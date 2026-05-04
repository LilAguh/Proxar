import './Badge.scss';
import { TicketState, TICKET_STATE_CONFIG, BudgetStatus, BUDGET_STATUS_CONFIG } from '@core/enums';

interface BadgeProps {
  status: TicketState | BudgetStatus;
  size?: 'sm' | 'lg';
}

export const Badge = ({ status, size = 'sm' }: BadgeProps) => {
  // Determinar qué configuración usar basado en el tipo de status
  const config = (status in TICKET_STATE_CONFIG)
    ? TICKET_STATE_CONFIG[status as TicketState]
    : BUDGET_STATUS_CONFIG[status as BudgetStatus];

  return (
    <span
      className={`badge badge--${size}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: `${config.color}30`,
      }}
    >
      {config.label}
    </span>
  );
};