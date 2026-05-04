import { useState } from 'react';
import { useBudgets } from '@/hooks/api/useBudgets';
import { budgetRepository } from '@data/repositories/budget.repository';
import { Button, Badge } from '@presentation/atoms';
import { Spinner } from '@presentation/molecules';
import { useCompanyStore } from '@/stores/useCompanyStore';
import { formatDateInTimeZone } from '@/utils/dateTime';
import './Budgets.scss';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const Budgets = () => {
  const [page] = useState(1);
  const { company } = useCompanyStore();
  const { data: budgets = [], isLoading } = useBudgets(page, 100);

  const handleViewPdf = (budgetId: string) => {
    window.open(budgetRepository.getPdfUrl(budgetId), '_blank');
  };

  if (isLoading) {
    return (
      <div className="budgets__loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="budgets">
      <div className="budgets__header">
        <h1 className="budgets__title">Historial de Presupuestos</h1>
        <span className="budgets__count">{budgets.length} presupuestos</span>
      </div>

      {budgets.length === 0 ? (
        <div className="budgets__empty">
          <p>No hay presupuestos registrados</p>
        </div>
      ) : (
        <div className="budgets__table-container">
          <table className="budgets__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Ticket</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Descuento</th>
                <th>Válido hasta</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => (
                <tr key={budget.id}>
                  <td className="budgets__number">#{budget.number}</td>
                  <td>
                    <div className="budgets__client">
                      <span className="budgets__client-name">{budget.clientName}</span>
                      {budget.clientPhone && (
                        <span className="budgets__client-phone">{budget.clientPhone}</span>
                      )}
                    </div>
                  </td>
                  <td>#{budget.ticketNumber}</td>
                  <td>
                    <Badge status={budget.status} size="sm" />
                  </td>
                  <td className="budgets__amount">
                    <strong>{formatCurrency(budget.total)}</strong>
                  </td>
                  <td className="budgets__amount">
                    {budget.discount > 0 ? formatCurrency(budget.discount) : '—'}
                  </td>
                  <td>
                    {formatDateInTimeZone(budget.validUntil, company?.timeZoneId, { dateStyle: 'short' })}
                  </td>
                  <td>
                    {formatDateInTimeZone(budget.createdAt, company?.timeZoneId, {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </td>
                  <td>
                    <div className="budgets__actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewPdf(budget.id)}
                      >
                        Ver PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
