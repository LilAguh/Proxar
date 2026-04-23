import { Modal } from '@presentation/molecules';
import { Badge, Button } from '@presentation/atoms';
import { Spinner } from '@presentation/molecules';
import { useTicketWithDetails, useUpdateTicketStatus } from '@/hooks/api';
import { TicketState, TICKET_STATE_CONFIG, PRIORITY_CONFIG } from '@core/enums';
import './ModalTicketDetail.scss';

const TICKET_TYPE_LABEL: Record<string, string> = {
  Medicion: 'Medición',
  Reparacion: 'Reparación',
  Vidrio: 'Vidrio',
  Abertura: 'Abertura',
  Obra: 'Obra',
  Otro: 'Otro',
};

const STATUS_TRANSITIONS: Record<TicketState, TicketState | null> = {
  [TicketState.Nuevo]: TicketState.EnVisita,
  [TicketState.EnVisita]: TicketState.Presupuestado,
  [TicketState.Presupuestado]: TicketState.Aprobado,
  [TicketState.Aprobado]: TicketState.EnProceso,
  [TicketState.EnProceso]: TicketState.Completado,
  [TicketState.Completado]: null,
  [TicketState.Descartado]: null,
};

const ACTION_LABEL: Record<string, string> = {
  Creado: 'Ticket creado',
  EstadoCambiado: 'Estado actualizado',
  Completado: 'Completado',
  Asignado: 'Reasignado',
};

interface Props {
  ticketId: string | null;
  onClose: () => void;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);

export const ModalTicketDetail = ({ ticketId, onClose }: Props) => {
  const { data: ticket, isLoading } = useTicketWithDetails(ticketId ?? '');
  const updateStatus = useUpdateTicketStatus();

  const nextStatus = ticket ? STATUS_TRANSITIONS[ticket.status] : null;
  const nextConfig = nextStatus ? TICKET_STATE_CONFIG[nextStatus] : null;

  const handleAdvance = () => {
    if (!ticket || !nextStatus) return;
    updateStatus.mutate({ id: ticket.id, data: { newStatus: nextStatus } });
  };

  return (
    <Modal
      isOpen={!!ticketId}
      onClose={onClose}
      title={ticket ? `Ticket #${ticket.number}` : 'Cargando...'}
      width="xl"
      footer={
        ticket && nextStatus ? (
          <>
            <Button variant="ghost" onClick={onClose}>Cerrar</Button>
            <Button
              variant="primary"
              onClick={handleAdvance}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Actualizando...' : `Mover a ${nextConfig?.label}`}
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        )
      }
    >
      {isLoading || !ticket ? (
        <div className="ticket-detail__loading">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="ticket-detail">
          {/* Header info */}
          <div className="ticket-detail__header">
            <div className="ticket-detail__meta">
              <Badge status={ticket.status} size="lg" />
              <span
                className="ticket-detail__priority"
                style={{ color: PRIORITY_CONFIG[ticket.priority]?.color }}
              >
                ● {PRIORITY_CONFIG[ticket.priority]?.label ?? ticket.priority}
              </span>
              <span className="ticket-detail__type">{TICKET_TYPE_LABEL[ticket.type] ?? ticket.type}</span>
            </div>
            <span className="ticket-detail__date">{formatDate(ticket.createdAt)}</span>
          </div>

          <h2 className="ticket-detail__title">{ticket.title}</h2>

          {/* Grid de info */}
          <div className="ticket-detail__grid">
            <div className="ticket-detail__field">
              <span className="ticket-detail__label">Cliente</span>
              <span className="ticket-detail__value">{ticket.client?.name ?? '—'}</span>
              {ticket.client?.phone && (
                <span className="ticket-detail__sub">{ticket.client.phone}</span>
              )}
            </div>
            <div className="ticket-detail__field">
              <span className="ticket-detail__label">Asignado a</span>
              <span className="ticket-detail__value">{ticket.assignedTo?.name ?? '—'}</span>
            </div>
            <div className="ticket-detail__field">
              <span className="ticket-detail__label">Dirección</span>
              <span className="ticket-detail__value">{ticket.address ?? '—'}</span>
            </div>
            <div className="ticket-detail__field">
              <span className="ticket-detail__label">Creado por</span>
              <span className="ticket-detail__value">{ticket.createdBy?.name ?? '—'}</span>
            </div>
          </div>

          {ticket.description && (
            <div className="ticket-detail__description">
              <span className="ticket-detail__label">Descripción</span>
              <p>{ticket.description}</p>
            </div>
          )}

          {/* Movimientos */}
          {ticket.movements?.length > 0 && (
            <div className="ticket-detail__section">
              <h4 className="ticket-detail__section-title">Movimientos de caja</h4>
              <div className="ticket-detail__movements">
                {ticket.movements.map((m: any) => (
                  <div key={m.id} className="ticket-detail__movement">
                    <div className="ticket-detail__movement-info">
                      <span className="ticket-detail__movement-concept">{m.concept}</span>
                      <span className="ticket-detail__movement-account">{m.account?.name}</span>
                    </div>
                    <span className={`ticket-detail__movement-amount ticket-detail__movement-amount--${m.type === 'Ingreso' ? 'in' : 'out'}`}>
                      {m.type === 'Ingreso' ? '+' : '-'}{formatCurrency(m.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial */}
          {ticket.history?.length > 0 && (
            <div className="ticket-detail__section">
              <h4 className="ticket-detail__section-title">Historial</h4>
              <div className="ticket-detail__history">
                {[...ticket.history].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((h: any) => (
                  <div key={h.id} className="ticket-detail__history-item">
                    <div className="ticket-detail__history-dot" />
                    <div className="ticket-detail__history-content">
                      <div className="ticket-detail__history-action">
                        <strong>{h.user?.name}</strong> — {ACTION_LABEL[h.action] ?? h.action}
                        {h.previousStatus && h.newStatus && (
                          <span className="ticket-detail__history-transition">
                            {' '}{h.previousStatus} → {h.newStatus}
                          </span>
                        )}
                      </div>
                      {h.comment && <p className="ticket-detail__history-comment">{h.comment}</p>}
                      <span className="ticket-detail__history-date">{formatDate(h.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
