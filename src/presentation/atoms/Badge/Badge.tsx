import './Badge.scss';
import { TicketState, TICKET_STATE_CONFIG } from '@core/enums';

interface BadgeProps {
  status: TicketState;
  size?: 'sm' | 'lg';
}

export const Badge = ({ status, size = 'sm' }: BadgeProps) => {
  const config = TICKET_STATE_CONFIG[status];

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