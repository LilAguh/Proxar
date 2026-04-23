import { useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores';
import { Button } from '@presentation/atoms';
import './Topbar.scss';

export const Topbar = () => {
  const location = useLocation();
  const { openModalTicket, openModalCaja } = useUIStore();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/tickets')) return 'Tickets / Kanban';
    if (path.startsWith('/caja')) return 'Caja / Movimientos';
    if (path.startsWith('/clients')) return 'Clientes';
    return 'Proxar';
  };

  return (
    <div className="topbar">
      <div className="topbar__breadcrumb">{getBreadcrumb()}</div>
      
      <div className="topbar__actions">
        <Button variant="primary" size="sm" onClick={openModalTicket}>
          + Nuevo Ticket
        </Button>
        <Button variant="success" size="sm" onClick={openModalCaja}>
          $ Caja
        </Button>
      </div>
    </div>
  );
};