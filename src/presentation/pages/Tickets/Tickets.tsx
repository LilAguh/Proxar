import { useTickets } from '@/hooks/api';
import { Card, Badge, Button } from '@presentation/atoms';
import { Spinner, EmptyState } from '@presentation/molecules';
import { useUIStore } from '@/stores';
import { TicketState } from '@core/enums';
import './Tickets.scss';

export const Tickets = () => {
  const { data: tickets, isLoading } = useTickets();
  const { openModalTicket } = useUIStore();

  if (isLoading) {
    return (
      <div className="tickets-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const groupedTickets = {
    [TicketState.Nuevo]: tickets?.filter((t) => t.status === TicketState.Nuevo) || [],
    [TicketState.EnVisita]: tickets?.filter((t) => t.status === TicketState.EnVisita) || [],
    [TicketState.Presupuestado]: tickets?.filter((t) => t.status === TicketState.Presupuestado) || [],
    [TicketState.Aprobado]: tickets?.filter((t) => t.status === TicketState.Aprobado) || [],
    [TicketState.EnProceso]: tickets?.filter((t) => t.status === TicketState.EnProceso) || [],
    [TicketState.Completado]: tickets?.filter((t) => t.status === TicketState.Completado) || [],
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

      <div className="tickets__kanban">
        {Object.entries(groupedTickets).map(([status, statusTickets]) => (
          <div key={status} className="tickets__column">
            <div className="tickets__column-header">
              <Badge status={status as TicketState} size="lg" />
              <span className="tickets__column-count">{statusTickets.length}</span>
            </div>

            <div className="tickets__column-body">
              {statusTickets.length === 0 ? (
                <EmptyState icon="📋" title="Sin tickets" />
              ) : (
                statusTickets.map((ticket) => (
                  <Card key={ticket.id} className="tickets__card" hoverable>
                    <div className="tickets__card-header">
                      <span className="tickets__card-number">#{ticket.number}</span>
                      <span className="tickets__card-type">{ticket.type}</span>
                    </div>
                    <h4 className="tickets__card-title">{ticket.title}</h4>
                    <p className="tickets__card-client">{ticket.client.name}</p>
                    {ticket.assignedTo && (
                      <div className="tickets__card-assigned">
                        Asignado a: {ticket.assignedTo.name}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};