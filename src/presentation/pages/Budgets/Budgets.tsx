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
  const [searchTerm, setSearchTerm] = useState('');
  const { company } = useCompanyStore();
  const { data: budgets = [], isLoading } = useBudgets(page, 100);

  const handleViewPdf = async (budgetId: string) => {
    try {
      await budgetRepository.downloadPdf(budgetId);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
    }
  };

  // Filtrar presupuestos por nombre de cliente, teléfono o número
  const filteredBudgets = budgets.filter((budget) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      budget.clientName.toLowerCase().includes(search) ||
      budget.clientPhone?.toLowerCase().includes(search) ||
      budget.number.toString().includes(search) ||
      budget.id.toLowerCase().includes(search)
    );
  });

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
        <div>
          <h1 className="budgets__title">Historial de Presupuestos</h1>
          <span className="budgets__count">
            {filteredBudgets.length} de {budgets.length} presupuestos
          </span>
        </div>
        <input
          type="text"
          className="budgets__search"
          placeholder="Buscar por cliente, teléfono, # presupuesto o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {budgets.length === 0 ? (
        <div className="budgets__empty">
          <p>No hay presupuestos registrados</p>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="budgets__empty">
          <p>No se encontraron presupuestos que coincidan con "{searchTerm}"</p>
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
              {filteredBudgets.map((budget) => (
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
