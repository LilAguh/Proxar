import './PriorityDot.scss';
import { Priority, PRIORITY_CONFIG } from '@core/enums';

interface PriorityDotProps {
  priority: Priority;
}

export const PriorityDot = ({ priority }: PriorityDotProps) => {
  const config = PRIORITY_CONFIG[priority];

  return (
    <span className="priority-dot" style={{ color: config.color }}>
      <span className="priority-dot__dot" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
};