import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore, useUIStore, useCompanyStore } from "@/stores";
import { useLogout } from "@/hooks/api/useAuth";
import { Avatar } from "@presentation/atoms";
import "./Sidebar.scss";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuthStore();
  const { company } = useCompanyStore();
  const { openModalTicket, openModalCaja } = useUIStore();
  const logout = useLogout();

  const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '▦', path: '/' },
  { key: 'tickets', label: 'Tickets', icon: '◈', path: '/tickets' },
  { key: 'caja', label: 'Caja', icon: '$', path: '/caja' },
  { key: 'clients', label: 'Clientes', icon: '◉', path: '/clients' }, // ← QUITAR soon: true
  { key: 'users', label: 'Usuarios', icon: '👥', path: '/users', adminOnly: true },
  { key: 'reports', label: 'Reportes', icon: '▣', path: '/reports', soon: true },
];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <img src="/SVG/Proxar.svg" alt="Proxar" className="Proxar" />

        <div className="sidebar__client-tag">
          <span className="sidebar__client-dot" />
          <span className="sidebar__client-name">{company?.name || 'Empresa'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin()) // ← FILTRO
          .map((item) => (
            <button
              key={item.key}
              onClick={() => !item.soon && navigate(item.path)}
              className={`sidebar__nav-item ${isActive(item.path) ? "sidebar__nav-item--active" : ""}`}
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
        <button
          className="sidebar__action sidebar__action--ticket"
          onClick={openModalTicket}
        >
          + Nuevo Ticket
        </button>
        <button
          className="sidebar__action sidebar__action--cash"
          onClick={openModalCaja}
        >
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
          <button
            className="sidebar__logout"
            onClick={logout}
            title="Cerrar sesión"
          >
            →
          </button>
        </div>
      )}
    </aside>
  );
};
