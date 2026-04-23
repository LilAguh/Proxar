import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/stores';
import { Avatar } from '@presentation/atoms';
import logo from '../../../../public/SVG/Proxar.svg'
import './Sidebar.scss';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { openModalTicket, openModalCaja } = useUIStore();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '▦', path: '/' },
    { key: 'tickets', label: 'Tickets', icon: '◈', path: '/tickets' },
    { key: 'caja', label: 'Caja', icon: '$', path: '/caja' },
    { key: 'clients', label: 'Clientes', icon: '◉', path: '/clientes' },
    { key: 'reports', label: 'Reportes', icon: '▣', path: '/reports', soon: true },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <img src={logo} alt="Proxar" className="Proxar" />
        
        <div className="sidebar__client-tag">
          <span className="sidebar__client-dot" />
          <span className="sidebar__client-name">Aberturas Sagitario</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => !item.soon && navigate(item.path)}
            className={`sidebar__nav-item ${isActive(item.path) ? 'sidebar__nav-item--active' : ''}`}
            disabled={item.soon}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__nav-label">{item.label}</span>
            {item.soon && <span className="sidebar__nav-badge">Pronto</span>}
          </button>
        ))}
      </nav>

      {/* Quick Actions */}
      <div className="sidebar__actions">
        <button className="sidebar__action sidebar__action--ticket" onClick={openModalTicket}>
          + Nuevo Ticket
        </button>
        <button className="sidebar__action sidebar__action--cash" onClick={openModalCaja}>
          $ Mov. Caja
        </button>
      </div>

      {/* User */}
      {user && (
        <div className="sidebar__user">
          <Avatar name={user.name} size="md" />
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{user.name}</p>
            <p className="sidebar__user-role">{user.role}</p>
          </div>
        </div>
      )}
    </aside>
  );
};