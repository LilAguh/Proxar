import { useState } from 'react';
import { Card, Button, Input, Select } from '@presentation/atoms';
import { Spinner } from '@presentation/molecules';
import { useTicketsReport, useMovementsReport, useMetrics } from '@/hooks/api/useReports';
import { useClients } from '@/hooks/api';
import { formatCurrency, formatDate } from '@/utils/formatters';
import './Reports.scss';

type TabType = 'tickets' | 'movements' | 'metrics';

export const Reports = () => {
  const [activeTab, setActiveTab] = useState<TabType>('metrics');

  // Filtros Tickets
  const [ticketFilters, setTicketFilters] = useState({
    dateFrom: '',
    dateTo: '',
    clientId: '',
    state: '',
    type: '',
    priority: '',
  });

  // Filtros Movimientos
  const [movementFilters, setMovementFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
  });

  const { data: clients } = useClients();
  const { data: metricsData, isLoading: isLoadingMetrics } = useMetrics();

  const shouldFetchTickets = activeTab === 'tickets';
  const shouldFetchMovements = activeTab === 'movements';

  const { data: ticketsReport, isLoading: isLoadingTickets } = useTicketsReport(
    ticketFilters,
    shouldFetchTickets
  );
  const { data: movementsReport, isLoading: isLoadingMovements } = useMovementsReport(
    movementFilters,
    shouldFetchMovements
  );

  const renderMetrics = () => {
    if (isLoadingMetrics) return <Spinner size="lg" />;
    if (!metricsData) return <p>No hay datos</p>;

    const growthColor = metricsData.incomeGrowth >= 0 ? '#16a34a' : '#dc2626';

    return (
      <div className="reports__metrics">
        <div className="reports__metrics-grid">
          {/* Tickets */}
          <Card className="reports__metric-card">
            <h3>Tickets</h3>
            <div className="reports__metric-value">{metricsData.totalTickets}</div>
            <div className="reports__metric-breakdown">
              <div>Abiertos: {metricsData.openTickets}</div>
              <div>Completados: {metricsData.completedTickets}</div>
              <div>Descartados: {metricsData.discardedTickets}</div>
            </div>
            <div className="reports__metric-stat">
              Conversión: <strong>{metricsData.conversionRate}%</strong>
            </div>
            <div className="reports__metric-stat">
              Días promedio: <strong>{metricsData.averageDaysToComplete}</strong>
            </div>
          </Card>

          {/* Finanzas Mes Actual */}
          <Card className="reports__metric-card">
            <h3>Finanzas - Mes Actual</h3>
            <div className="reports__metric-value">
              {formatCurrency(metricsData.currentMonthNet)}
            </div>
            <div className="reports__metric-breakdown">
              <div className="reports__income">
                ↑ Ingresos: {formatCurrency(metricsData.currentMonthIncome)}
              </div>
              <div className="reports__expense">
                ↓ Egresos: {formatCurrency(metricsData.currentMonthExpense)}
              </div>
            </div>
            <div className="reports__metric-stat">
              Mes anterior: {formatCurrency(metricsData.previousMonthIncome)}
            </div>
            <div className="reports__metric-stat" style={{ color: growthColor }}>
              Crecimiento: <strong>{metricsData.incomeGrowth.toFixed(1)}%</strong>
            </div>
          </Card>

          {/* Balance Total */}
          <Card className="reports__metric-card">
            <h3>Balance Total</h3>
            <div className="reports__metric-value">
              {formatCurrency(metricsData.totalBalance)}
            </div>
            <div className="reports__metric-stat">
              Saldo actual de todas las cuentas
            </div>
          </Card>

          {/* Clientes */}
          <Card className="reports__metric-card">
            <h3>Clientes</h3>
            <div className="reports__metric-value">{metricsData.totalClients}</div>
            <div className="reports__metric-stat">
              Activos este mes: <strong>{metricsData.activeClients}</strong>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderTicketsReport = () => {
    if (isLoadingTickets) return <Spinner size="lg" />;
    if (!ticketsReport) return <p>Aplicá filtros para ver el reporte</p>;

    const { summary } = ticketsReport;

    return (
      <div className="reports__tickets">
        <Card className="reports__filters">
          <h3>Filtros</h3>
          <div className="reports__filters-grid">
            <Input
              label="Desde"
              type="date"
              value={ticketFilters.dateFrom}
              onChange={(value) => setTicketFilters({ ...ticketFilters, dateFrom: value })}
            />
            <Input
              label="Hasta"
              type="date"
              value={ticketFilters.dateTo}
              onChange={(value) => setTicketFilters({ ...ticketFilters, dateTo: value })}
            />
            <Select
              label="Cliente"
              value={ticketFilters.clientId}
              onChange={(value) => setTicketFilters({ ...ticketFilters, clientId: value })}
              options={[
                { value: '', label: 'Todos' },
                ...(clients?.map((c) => ({ value: c.id, label: c.name })) || []),
              ]}
            />
            <Select
              label="Estado"
              value={ticketFilters.state}
              onChange={(value) => setTicketFilters({ ...ticketFilters, state: value })}
              options={[
                { value: '', label: 'Todos' },
                { value: 'Nuevo', label: 'Nuevo' },
                { value: 'EnVisita', label: 'En Visita' },
                { value: 'Presupuestado', label: 'Presupuestado' },
                { value: 'Aprobado', label: 'Aprobado' },
                { value: 'EnProceso', label: 'En Proceso' },
                { value: 'Completado', label: 'Completado' },
                { value: 'Descartado', label: 'Descartado' },
              ]}
            />
          </div>
        </Card>

        <Card className="reports__summary">
          <h3>Resumen</h3>
          <div className="reports__summary-grid">
            <div>
              <strong>Total:</strong> {summary.total}
            </div>
            <div>
              <strong>Conversión:</strong> {summary.conversionRate}%
            </div>
            <div>
              <strong>Días promedio:</strong> {summary.averageDaysToComplete}
            </div>
          </div>

          <h4>Por Estado</h4>
          <div className="reports__summary-grid">
            <div>Nuevo: {summary.byStateNew}</div>
            <div>En Visita: {summary.byStateInVisit}</div>
            <div>Presupuestado: {summary.byStateBudgeted}</div>
            <div>Aprobado: {summary.byStateApproved}</div>
            <div>En Proceso: {summary.byStateInProcess}</div>
            <div>Completado: {summary.byStateCompleted}</div>
            <div>Descartado: {summary.byStateDiscarded}</div>
          </div>

          <h4>Por Tipo</h4>
          <div className="reports__summary-grid">
            <div>Medición: {summary.byTypeMeasurement}</div>
            <div>Reparación: {summary.byTypeRepair}</div>
            <div>Vidrio: {summary.byTypeGlass}</div>
            <div>Abertura: {summary.byTypeWindow}</div>
            <div>Obra: {summary.byTypeConstruction}</div>
            <div>Otro: {summary.byTypeOther}</div>
          </div>
        </Card>

        <Card className="reports__table">
          <h3>Tickets ({ticketsReport.tickets.length})</h3>
          <div className="reports__table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Tipo</th>
                  <th>Prioridad</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {ticketsReport.tickets.map((ticket: any) => (
                  <tr key={ticket.id}>
                    <td>{ticket.number}</td>
                    <td>{ticket.client?.name}</td>
                    <td>{ticket.title}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.type}</td>
                    <td>{ticket.priority}</td>
                    <td>{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderMovementsReport = () => {
    if (isLoadingMovements) return <Spinner size="lg" />;
    if (!movementsReport) return <p>Aplicá filtros para ver el reporte</p>;

    const { summary } = movementsReport;

    return (
      <div className="reports__movements">
        <Card className="reports__filters">
          <h3>Filtros</h3>
          <div className="reports__filters-grid">
            <Input
              label="Desde"
              type="date"
              value={movementFilters.dateFrom}
              onChange={(value) => setMovementFilters({ ...movementFilters, dateFrom: value })}
            />
            <Input
              label="Hasta"
              type="date"
              value={movementFilters.dateTo}
              onChange={(value) => setMovementFilters({ ...movementFilters, dateTo: value })}
            />
            <Select
              label="Tipo"
              value={movementFilters.type}
              onChange={(value) => setMovementFilters({ ...movementFilters, type: value })}
              options={[
                { value: '', label: 'Todos' },
                { value: 'Ingreso', label: 'Ingreso' },
                { value: 'Egreso', label: 'Egreso' },
              ]}
            />
          </div>
        </Card>

        <Card className="reports__summary">
          <h3>Resumen</h3>
          <div className="reports__summary-totals">
            <div className="reports__summary-total reports__summary-total--income">
              <div className="reports__summary-total-label">Ingresos</div>
              <div className="reports__summary-total-value">
                {formatCurrency(summary.totalIncome)}
              </div>
            </div>
            <div className="reports__summary-total reports__summary-total--expense">
              <div className="reports__summary-total-label">Egresos</div>
              <div className="reports__summary-total-value">
                {formatCurrency(summary.totalExpense)}
              </div>
            </div>
            <div className="reports__summary-total reports__summary-total--net">
              <div className="reports__summary-total-label">Balance Neto</div>
              <div className="reports__summary-total-value">
                {formatCurrency(summary.netBalance)}
              </div>
            </div>
          </div>

          <h4>Por Cuenta</h4>
          <div className="reports__table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Ingresos</th>
                  <th>Egresos</th>
                  <th>Neto</th>
                </tr>
              </thead>
              <tbody>
                {summary.byAccount.map((acc) => (
                  <tr key={acc.accountId}>
                    <td>{acc.accountName}</td>
                    <td className="reports__amount--income">{formatCurrency(acc.income)}</td>
                    <td className="reports__amount--expense">{formatCurrency(acc.expense)}</td>
                    <td>
                      <strong>{formatCurrency(acc.net)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4>Por Medio de Pago</h4>
          <div className="reports__table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Ingresos</th>
                  <th>Egresos</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {summary.byPaymentMethod.map((method) => (
                  <tr key={method.method}>
                    <td>{method.method}</td>
                    <td className="reports__amount--income">{formatCurrency(method.income)}</td>
                    <td className="reports__amount--expense">{formatCurrency(method.expense)}</td>
                    <td>{method.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="reports__table">
          <h3>Movimientos ({movementsReport.movements.length})</h3>
          <div className="reports__table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Concepto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movementsReport.movements.map((mov: any) => (
                  <tr key={mov.id}>
                    <td>{mov.number}</td>
                    <td>{mov.account?.name}</td>
                    <td>{mov.type}</td>
                    <td
                      className={
                        mov.type === 'Ingreso'
                          ? 'reports__amount--income'
                          : 'reports__amount--expense'
                      }
                    >
                      {formatCurrency(mov.amount)}
                    </td>
                    <td>{mov.concept}</td>
                    <td>{formatDate(mov.movementDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="reports">
      <div className="reports__header">
        <div>
          <h1 className="reports__title">Reportes</h1>
          <p className="reports__subtitle">Estadísticas y análisis del negocio</p>
        </div>
      </div>

      <div className="reports__tabs">
        <button
          className={`reports__tab ${activeTab === 'metrics' ? 'reports__tab--active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Métricas Generales
        </button>
        <button
          className={`reports__tab ${activeTab === 'tickets' ? 'reports__tab--active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Reporte de Tickets
        </button>
        <button
          className={`reports__tab ${activeTab === 'movements' ? 'reports__tab--active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          Reporte de Caja
        </button>
      </div>

      <div className="reports__content">
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'tickets' && renderTicketsReport()}
        {activeTab === 'movements' && renderMovementsReport()}
      </div>
    </div>
  );
};
