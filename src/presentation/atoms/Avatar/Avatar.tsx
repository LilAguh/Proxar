import './Avatar.scss';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar = ({ name, size = 'md', className = '' }: AvatarProps) => {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const colors = ['#d64717', '#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];

  return (
    <span 
      className={`avatar avatar--${size} ${className}`}
      style={{ backgroundColor }}
    >
      {initials}
    </span>
  );
};