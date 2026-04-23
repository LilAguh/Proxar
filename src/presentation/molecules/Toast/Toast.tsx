import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Toast.scss';

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onRemove: (id: string) => void;
}

export const Toast = ({ id, message, type, onRemove }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 3500);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const icons = {
    success: '✓',
    error: '!',
    warning: '⚠',
    info: 'ℹ',
  };

  return createPortal(
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{icons[type]}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={() => onRemove(id)}>
        ×
      </button>
    </div>,
    document.body
  );
};