import { useEffect, useState } from "react";
import {
  useMovementsPage,
  useMovementsByDateRange,
  useAccountBalances,
  useActiveAccounts,
  useDeleteMovement,
} from "@/hooks/api";
import { Card, Button } from "@presentation/atoms";
import { Spinner, EmptyState, ConfirmDialog } from "@presentation/molecules";
import { useUIStore, useAuthStore } from "@/stores";
import { MovementType } from "@core/enums";
import { useConfirm } from "@/hooks/useConfirm";
import "./Saldo.scss";

const getLocalDayBounds = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

export const Saldo = () => {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const movementType =
    filter === "income" ? MovementType.Income : filter === "expense" ? MovementType.Expense : undefined;

  const { startDate, endDate } = getLocalDayBounds();
  const { data: pagedMovements, isLoading: isLoadingMovements } = useMovementsPage(page, pageSize, movementType);
  const { data: todayMovements, isLoading: isLoadingToday } = useMovementsByDateRange(startDate, endDate);
  const { data: balances, isLoading: isLoadingBalances } = useAccountBalances();
  const { data: accounts, isLoading: isLoadingAccounts } = useActiveAccounts();
  const { openModalCaja } = useUIStore();
  const deleteMovement = useDeleteMovement();
  const { isAdmin } = useAuthStore();

  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();

  const handleDelete = async (movement: any) => {
    const confirmed = await confirm({
      title: "Eliminar Movimiento",
      message: `¿Estás seguro que querés eliminar este movimiento? El saldo de la cuenta será revertido automáticamente.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });
    if (confirmed) await deleteMovement.mutateAsync(movement.id);
  };

  useEffect(() => {
    setPage(1);
  }, [filter]);

  if (isLoadingMovements || isLoadingToday || isLoadingBalances || isLoadingAccounts) {
    return <div className="saldo-loading"><Spinner size="lg" /></div>;
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const totalBalance = Object.values(balances || {}).reduce(
    (sum, bal) => sum + (bal as number),
    0
  );

  const movements = pagedMovements?.items ?? [];
  const totalPages = pagedMovements?.totalPages ?? 1;

  const today = new Date().toISOString().split("T")[0];
  const todayIncome = todayMovements
    ?.filter((m) => new Date(m.movementDate).toISOString().split("T")[0] === today && m.type === MovementType.Income)
    .reduce((sum, m) => sum + m.amount, 0) || 0;
  const todayExpense = todayMovements
    ?.filter((m) => new Date(m.movementDate).toISOString().split("T")[0] === today && m.type === MovementType.Expense)
    .reduce((sum, m) => sum + m.amount, 0) || 0;

  return (
    <div className="saldo">
      <div className="saldo__header">
        <div>
          <h1 className="saldo__title">Movimientos</h1>
          <p className="saldo__subtitle">Ingresos y egresos por cuenta</p>
        </div>
        <Button variant="success" onClick={openModalCaja}>
          $ Registrar Movimiento
        </Button>
      </div>

      <div className="saldo__metrics">
        <Card className="saldo__metric">
          <h4 className="saldo__metric-title">Saldo Total</h4>
          <div className="saldo__metric-value saldo__metric-value--balance">
            {formatCurrency(totalBalance)}
          </div>
          <div className="saldo__metric-accounts">
            {accounts?.map((acc) => (
              <div key={acc.id} className="saldo__metric-account">
                <span className="saldo__metric-account-name">{acc.name}</span>
                <span className="saldo__metric-account-balance">
                  {formatCurrency(acc.currentBalance)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="saldo__metric">
          <h4 className="saldo__metric-title">Movimientos Hoy</h4>
          <div className="saldo__metric-value saldo__metric-value--today">
            {formatCurrency(todayIncome - todayExpense)}
          </div>
          <div className="saldo__metric-breakdown">
            <span className="saldo__metric-item saldo__metric-item--income">
              +{formatCurrency(todayIncome)}
            </span>
            <span className="saldo__metric-item saldo__metric-item--expense">
              -{formatCurrency(todayExpense)}
            </span>
          </div>
        </Card>
      </div>

      <div className="saldo__filters">
        <Button variant={filter === "all" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("all")}>Todos</Button>
        <Button variant={filter === "income" ? "success" : "ghost"} size="sm" onClick={() => setFilter("income")}>Ingresos</Button>
        <Button variant={filter === "expense" ? "danger" : "ghost"} size="sm" onClick={() => setFilter("expense")}>Egresos</Button>
      </div>

      <Card className="saldo__movements">
        <div className="saldo__movements-header">
          <h3 className="saldo__movements-title">Movimientos</h3>
          <span className="saldo__movements-meta">
            Página {page} de {totalPages}
          </span>
        </div>
        {!movements || movements.length === 0 ? (
          <EmptyState icon="💰" title="No hay movimientos" />
        ) : (
          <div className="saldo__movements-list">
            {movements.map((mov) => (
              <div key={mov.id} className="saldo__movement">
                <div className="saldo__movement-info">
                  <div className="saldo__movement-header">
                    <span className="saldo__movement-number">#{mov.number}</span>
                    <span className="saldo__movement-method">{mov.method}</span>
                    {mov.ticket && (
                      <span className="saldo__movement-ticket">Ticket #{mov.ticket.number}</span>
                    )}
                  </div>
                  <div className="saldo__movement-concept">{mov.concept}</div>
                  <div className="saldo__movement-footer">
                    <span className="saldo__movement-account">{mov.account?.name || "Sin cuenta"}</span>
                    <span className="saldo__movement-date">{formatDate(mov.movementDate)}</span>
                  </div>
                </div>
                <div className="saldo__movement-actions">
                  <div className={`saldo__movement-amount saldo__movement-amount--${mov.type === MovementType.Income ? "income" : "expense"}`}>
                    {mov.type === MovementType.Income ? "+" : "-"}{formatCurrency(mov.amount)}
                  </div>
                  {isAdmin() && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(mov)} disabled={deleteMovement.isPending}>
                      🗑️
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="saldo__pagination">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={deleteMovement.isPending}
      />
    </div>
  );
};
