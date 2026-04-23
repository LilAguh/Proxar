import { useMovements, useAccountBalances } from '@/hooks/api';
import { Card, Button } from '@presentation/atoms';
import { Spinner, EmptyState } from '@presentation/molecules';
import { useUIStore } from '@/stores';
import './Caja.scss';

export const Caja = () => {
  const { data: movements, isLoading } = useMovements();
  const { data: balances } = useAccountBalances();
  const { openModalCaja } = useUIStore();

  if (isLoading) {
    return (
      <div className="caja-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="caja">
      <div className="caja__header">
        <div>
          <h1 className="caja__title">Caja</h1>
          <p className="caja__subtitle">Movimientos y saldos</p>
        </div>
        <Button variant="success" onClick={openModalCaja}>
          $ Registrar Movimiento
        </Button>
      </div>

      {/* Saldos */}
      <div className="caja__balances">
        {balances &&
          Object.entries(balances).map(([accountId, balance]) => (
            <Card key={accountId} className="caja__balance">
              <h4 className="caja__balance-title">Cuenta</h4>
              <div className="caja__balance-amount">{formatCurrency(balance as number)}</div>
            </Card>
          ))}
      </div>

      {/* Movimientos */}
      <Card className="caja__movements">
        <h3 className="caja__movements-title">Movimientos Recientes</h3>

        {!movements || movements.length === 0 ? (
          <EmptyState icon="💰" title="No hay movimientos" />
        ) : (
          <div className="caja__movements-list">
            {movements.map((mov) => (
              <div key={mov.id} className="caja__movement">
                <div className="caja__movement-info">
                  <div className="caja__movement-header">
                    <span className="caja__movement-number">#{mov.number}</span>
                    <span className="caja__movement-method">{mov.method}</span>
                  </div>
                  <div className="caja__movement-concept">{mov.concept}</div>
                  <div className="caja__movement-date">{formatDate(mov.movementDate)}</div>
                </div>
                <div
                  className={`caja__movement-amount caja__movement-amount--${
                    mov.type === 'Ingreso' ? 'income' : 'expense'
                  }`}
                >
                  {mov.type === 'Ingreso' ? '+' : '-'}
                  {formatCurrency(mov.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};