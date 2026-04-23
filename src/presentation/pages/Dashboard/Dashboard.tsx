import { useDashboardSummary, useTickets } from '@/hooks/api';
import { Card, Button } from '@presentation/atoms';
import { Spinner, EmptyState } from '@presentation/molecules';
import { useNavigate } from 'react-router-dom';
import './Dashboard.scss';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: recentTickets } = useTickets();

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!summary) {
    return (
      <EmptyState
        icon="▦"
        title="No hay datos disponibles"
        description="No se pudo cargar el resumen del dashboard"
      />
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">Resumen general de Proxar</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="dashboard__metrics">
        <Card className="dashboard__metric">
          <div className="dashboard__metric-header">
            <span className="dashboard__metric-icon">🎫</span>
            <h3 className="dashboard__metric-title">Tickets</h3>
          </div>
          <div className="dashboard__metric-content">
            <div className="dashboard__metric-value">{summary.tickets.total}</div>
            <div className="dashboard__metric-breakdown">
              <span className="dashboard__metric-item dashboard__metric-item--new">
                {summary.tickets.new} nuevos
              </span>
              <span className="dashboard__metric-item dashboard__metric-item--progress">
                {summary.tickets.inProgress} en proceso
              </span>
              <span className="dashboard__metric-item dashboard__metric-item--completed">
                {summary.tickets.completed} completados
              </span>
            </div>
          </div>
        </Card>

        <Card className="dashboard__metric">
          <div className="dashboard__metric-header">
            <span className="dashboard__metric-icon">💰</span>
            <h3 className="dashboard__metric-title">Caja Hoy</h3>
          </div>
          <div className="dashboard__metric-content">
            <div className="dashboard__metric-value dashboard__metric-value--cash">
              {formatCurrency(summary.cashToday.net)}
            </div>
            <div className="dashboard__metric-breakdown">
              <span className="dashboard__metric-item dashboard__metric-item--income">
                +{formatCurrency(summary.cashToday.income)}
              </span>
              <span className="dashboard__metric-item dashboard__metric-item--expense">
                -{formatCurrency(summary.cashToday.expense)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="dashboard__metric">
          <div className="dashboard__metric-header">
            <span className="dashboard__metric-icon">🏦</span>
            <h3 className="dashboard__metric-title">Saldo Total</h3>
          </div>
          <div className="dashboard__metric-content">
            <div className="dashboard__metric-value dashboard__metric-value--balance">
              {formatCurrency(summary.totalBalance)}
            </div>
            <div className="dashboard__metric-breakdown">
              {Object.entries(summary.accountBalances).map(([id, balance]) => (
                <span key={id} className="dashboard__metric-item">
                  {formatCurrency(balance as number)}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Tickets recientes */}
      <Card className="dashboard__recent">
        <div className="dashboard__recent-header">
          <h3 className="dashboard__recent-title">Tickets Recientes</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>
            Ver todos →
          </Button>
        </div>
        <div className="dashboard__recent-list">
          {recentTickets?.slice(0, 5).map((ticket) => (
            <div
              key={ticket.id}
              className="dashboard__recent-item"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <div className="dashboard__recent-info">
                <span className="dashboard__recent-number">#{ticket.number}</span>
                <span className="dashboard__recent-title-text">{ticket.title}</span>
              </div>
              <span className="dashboard__recent-client">{ticket.client?.name ?? 'Sin cliente'}</span>
            </div>
          )) || <EmptyState icon="🎫" title="No hay tickets" />}
        </div>
      </Card>
    </div>
  );
};