import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTickets, useUpdateTicketStatus } from "@/hooks/api";
import { Card, Badge, Button } from "@presentation/atoms";
import { Spinner, EmptyState } from "@presentation/molecules";
import { ModalTicketDetail } from "@presentation/features";
import { useUIStore, useAuthStore } from "@/stores";
import { TicketState, TicketType, Priority } from "@core/enums";
import { Ticket } from "@core/entities/Ticket.entity";
import "./Tickets.scss";

const TICKET_TYPE_LABEL: Record<string, string> = {
  [TicketType.Measurement]: "Medición",
  [TicketType.Repair]: "Reparación",
  [TicketType.Glass]: "Vidrio",
  [TicketType.Window]: "Abertura",
  [TicketType.Construction]: "Obra",
  [TicketType.Other]: "Otro",
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  [Priority.Urgent]: { label: "🔴 Urgente", color: "#ef4444" },
  [Priority.High]: { label: "🟠 Alta", color: "#f97316" },
  [Priority.Medium]: { label: "🟡 Media", color: "#eab308" },
  [Priority.Low]: { label: "🟢 Baja", color: "#22c55e" },
};

const COLUMNS = [
  TicketState.Nuevo,
  TicketState.EnVisita,
  TicketState.Presupuestado,
  TicketState.Aprobado,
  TicketState.EnProceso,
];

const CLOSED_STATES = [TicketState.Completado, TicketState.Descartado];

// Prefix para distinguir IDs de columna de IDs de ticket
const colId = (status: TicketState) => `col::${status}`;

// Orden de prioridad (mayor = más urgente)
const PRIORITY_ORDER: Record<Priority, number> = {
  [Priority.Urgent]: 4,
  [Priority.High]: 3,
  [Priority.Medium]: 2,
  [Priority.Low]: 1,
};

// Ordenar tickets por prioridad (más urgente primero)
const sortByPriority = (tickets: Ticket[]): Ticket[] => {
  return [...tickets].sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority] ?? 0;
    const priorityB = PRIORITY_ORDER[b.priority] ?? 0;
    return priorityB - priorityA; // Descendente: urgente primero
  });
};

const TicketCard = ({
  ticket,
  onClick,
  isDraggable = true,
}: {
  ticket: Ticket;
  onClick: () => void;
  isDraggable?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket.id,
    data: { type: "ticket", ticket },
    transition: {
      duration: 300,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
    cursor: isDraggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
    scale: isDragging ? '1.05' : '1',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDraggable ? listeners : {})}
      onClick={onClick}
    >
      <Card className="tickets__card" hoverable>
        <div className="tickets__card-header">
          <span className="tickets__card-number">#{ticket.number}</span>
          <span className="tickets__card-type">
            {TICKET_TYPE_LABEL[ticket.type] ?? ticket.type}
          </span>
        </div>
        <div className="tickets__card-priority" style={{
          fontSize: '0.75rem',
          fontWeight: '600',
          color: PRIORITY_CONFIG[ticket.priority]?.color ?? '#6b7280',
          marginBottom: '0.5rem'
        }}>
          {PRIORITY_CONFIG[ticket.priority]?.label ?? ticket.priority}
        </div>
        <h4 className="tickets__card-title">{ticket.title}</h4>
        <p className="tickets__card-client">
          {ticket.client?.name ?? "Sin cliente"}
        </p>
        {ticket.assignedTo && (
          <div className="tickets__card-assigned">
            Asignado a: {ticket.assignedTo.name}
          </div>
        )}
      </Card>
    </div>
  );
};

const DroppableColumn = ({
  status,
  tickets,
  onTicketClick,
  isDraggable = true,
}: {
  status: TicketState;
  tickets: Ticket[];
  onTicketClick: (id: string) => void;
  isDraggable?: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: colId(status),
    data: { type: "column", status },
  });

  return (
    <div className="tickets__column">
      <div className="tickets__column-header">
        <Badge status={status} size="lg" />
        <span className="tickets__column-count">{tickets.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`tickets__column-body ${isOver ? "tickets__column-body--over" : ""}`}
      >
        <SortableContext
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.length === 0 ? (
            <div className="tickets__column-empty">
              <EmptyState icon="📋" title="Sin tickets" />
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => onTicketClick(ticket.id)}
                isDraggable={isDraggable}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export const Tickets = () => {
  const queryClient = useQueryClient();
  const { data: tickets, isLoading } = useTickets();
  const updateStatus = useUpdateTicketStatus();
  const { openModalTicket } = useUIStore();
  const { isAdmin } = useAuthStore();
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(false);

  const canDrag = isAdmin();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 100,
        tolerance: 5,
      },
    }),
  );

  if (isLoading) {
    return (
      <div className="tickets-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const groupedTickets = COLUMNS.reduce(
    (acc, status) => {
      const ticketsInColumn = tickets?.filter((t) => t.status === status) ?? [];
      acc[status] = sortByPriority(ticketsInColumn);
      return acc;
    },
    {} as Record<TicketState, Ticket[]>,
  );

  const closedTickets = tickets?.filter((t) => CLOSED_STATES.includes(t.status)) ?? [];
  const sortedClosedTickets = sortByPriority(closedTickets);

  const [wasDragging, setWasDragging] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTicket(event.active.data.current?.ticket ?? null);
    setWasDragging(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    // Solo permitir drag si es admin
    if (!canDrag) return;

    const { active, over } = event;

    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as TicketState;

    const ticket = tickets?.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    const previousStatus = ticket.status;

    // OPTIMISTIC UPDATE
    queryClient.setQueryData(['tickets'], (old: Ticket[] | undefined) => {
    if (!old) return old;
    return old.map((t) =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    );
  });

  try {
    await updateStatus.mutateAsync({
      id: ticketId,
      data: { newStatus },
    });
  } catch (error) {
    // REVERT ON ERROR
    queryClient.setQueryData(['tickets'], (old: Ticket[] | undefined) => {
      if (!old) return old;
      return old.map((t) =>
        t.id === ticketId ? { ...t, status: previousStatus } : t
      );
    });
    }
  };

  return (
    <div className="tickets">
      <div className="tickets__header">
        <div>
          <h1 className="tickets__title">Tickets</h1>
          <p className="tickets__subtitle">Gestión de trabajos y proyectos</p>
        </div>
        <Button variant="primary" onClick={openModalTicket}>
          + Nuevo Ticket
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="tickets__kanban">
          {COLUMNS.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              tickets={groupedTickets[status]}
              onTicketClick={(id) => {
                if (!wasDragging) setSelectedTicketId(id);
              }}
              isDraggable={canDrag}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          duration: 350,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeTicket && (
            <div style={{
              transform: 'rotate(3deg) scale(1.05)',
              transition: 'all 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              <Card className="tickets__card tickets__card--dragging" hoverable>
                <div className="tickets__card-header">
                  <span className="tickets__card-number">
                    #{activeTicket.number}
                  </span>
                  <span className="tickets__card-type">
                    {TICKET_TYPE_LABEL[activeTicket.type] ?? activeTicket.type}
                  </span>
                </div>
                <div className="tickets__card-priority" style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: PRIORITY_CONFIG[activeTicket.priority]?.color ?? '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  {PRIORITY_CONFIG[activeTicket.priority]?.label ?? activeTicket.priority}
                </div>
                <h4 className="tickets__card-title">{activeTicket.title}</h4>
                <p className="tickets__card-client">
                  {activeTicket.client?.name ?? "Sin cliente"}
                </p>
              </Card>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Sección de Tickets Cerrados */}
      {closedTickets.length > 0 && (
        <Card className="tickets__closed-section">
          <button
            className="tickets__closed-toggle"
            onClick={() => setShowClosed(!showClosed)}
          >
            <h3 className="tickets__closed-title">
              {showClosed ? '▼' : '▶'} Tickets Cerrados ({closedTickets.length})
            </h3>
          </button>

          {showClosed && (
            <div className="tickets__closed-grid">
              {sortedClosedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card className="tickets__card" hoverable>
                    <div className="tickets__card-header">
                      <span className="tickets__card-number">#{ticket.number}</span>
                      <Badge status={ticket.status} size="sm" />
                    </div>
                    <div className="tickets__card-priority" style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: PRIORITY_CONFIG[ticket.priority]?.color ?? '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      {PRIORITY_CONFIG[ticket.priority]?.label ?? ticket.priority}
                    </div>
                    <h4 className="tickets__card-title">{ticket.title}</h4>
                    <p className="tickets__card-client">
                      {ticket.client?.name ?? "Sin cliente"}
                    </p>
                    {ticket.assignedTo && (
                      <div className="tickets__card-assigned">
                        Asignado a: {ticket.assignedTo.name}
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <ModalTicketDetail
        isOpen={!!selectedTicketId}
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
};
