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
import { useUIStore } from "@/stores";
import { TicketState, TicketType } from "@core/enums";
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

const COLUMNS = [
  TicketState.Nuevo,
  TicketState.EnVisita,
  TicketState.Presupuestado,
  TicketState.Aprobado,
  TicketState.EnProceso,
  TicketState.Completado,
];

// Prefix para distinguir IDs de columna de IDs de ticket
const colId = (status: TicketState) => `col::${status}`;

const TicketCard = ({
  ticket,
  onClick,
}: {
  ticket: Ticket;
  onClick: () => void;
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
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <Card className="tickets__card" hoverable>
        <div className="tickets__card-header">
          <span className="tickets__card-number">#{ticket.number}</span>
          <span className="tickets__card-type">
            {TICKET_TYPE_LABEL[ticket.type] ?? ticket.type}
          </span>
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
}: {
  status: TicketState;
  tickets: Ticket[];
  onTicketClick: (id: string) => void;
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
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
      acc[status] = tickets?.filter((t) => t.status === status) ?? [];
      return acc;
    },
    {} as Record<TicketState, Ticket[]>,
  );

  const [wasDragging, setWasDragging] = useState(false);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTicket(event.active.data.current?.ticket ?? null);
    setWasDragging(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
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
            />
          ))}
        </div>

        <DragOverlay>
          {activeTicket && (
            <div style={{ rotate: "2deg" }}>
              <Card className="tickets__card tickets__card--dragging" hoverable>
                <div className="tickets__card-header">
                  <span className="tickets__card-number">
                    #{activeTicket.number}
                  </span>
                  <span className="tickets__card-type">
                    {TICKET_TYPE_LABEL[activeTicket.type] ?? activeTicket.type}
                  </span>
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

      <ModalTicketDetail
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </div>
  );
};
