import type { ReactNode } from 'react';
import './AuthCard.scss';

interface AuthCardProps {
  title: string;
  subtitle: string;
  error?: string;
  children: ReactNode;
  footer?: ReactNode;
  badge?: ReactNode;
}

export const AuthCard = ({ title, subtitle, error, children, footer, badge }: AuthCardProps) => {
  return (
    <div className="auth-card">
      <div className="auth-card__container">
        <div className="auth-card__card">

          <div className="auth-card__logo">
            <img src="/SVG/Proxar.svg" alt="Proxar" />
          </div>

          <h1 className="auth-card__title">{title}</h1>
          {badge && <div className="auth-card__badge">{badge}</div>}
          <p className="auth-card__subtitle">{subtitle}</p>

          {error && (
            <div className="auth-card__error">
              ⚠️ {error}
            </div>
          )}

          <div className="auth-card__body">{children}</div>

          {footer && (
            <div className="auth-card__footer">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
};
