import { useState, useEffect, type ReactNode } from 'react';
import './PageTransition.scss';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const [phase, setPhase] = useState<'loading' | 'enter'>('loading');

  useEffect(() => {
    const t = setTimeout(() => setPhase('enter'), 500);
    return () => clearTimeout(t);
  }, []);

  if (phase === 'loading') {
    return (
      <div className="page-transition__loader">
        <img src="/SVG/Proxar.svg" alt="Proxar" className="page-transition__logo" />
        <div className="page-transition__spinner" />
      </div>
    );
  }

  return (
    <div className="page-transition__content">
      {children}
    </div>
  );
};
