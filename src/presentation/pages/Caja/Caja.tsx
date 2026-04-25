import { useState } from "react";
import {
  useMovements,
  useAccountBalances,
  useActiveAccounts,
  useDeleteMovement,
} from "@/hooks/api";
import { Card, Button } from "@presentation/atoms";
import { Spinner, EmptyState, ConfirmDialog } from "@presentation/molecules";
import { useUIStore, useAuthStore } from "@/stores";
import { MovementType } from "@core/enums";
import { useConfirm } from "@/hooks/api/useConfirm"; // ← CORREGIDO el path
import "./Caja.scss";

export const Caja = () => {
  const { data: movements, isLoading } = useMovements();
  const { data: balances } = useAccountBalances();
  const { data: accounts } = useActiveAccounts();
  const { openModalCaja } = useUIStore();
  const deleteMovement = useDeleteMovement();
  const { isAdmin } = useAuthStore();

  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();

  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const handleDelete = async (movement: any) => {
    const confirmed = await confirm({
      title: "Eliminar Movimiento",
      message: `¿Estás seguro que querés eliminar este movimiento? El saldo de la cuenta será revertido automáticamente.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (confirmed) {
      await deleteMovement.mutateAsync(movement.id);
    }
  };

  if (isLoading) {
    return (
      <div className="caja-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalBalance = Object.values(balances || {}).reduce(
    (sum, bal) => sum + (bal as number),
    0
  );

  const filteredMovements = movements?.filter((m) => {
    if (filter === "income") return m.type === MovementType.Income;
    if (filter === "expense") return m.type === MovementType.Expense;
    return true;
  });

  const todayIncome =
    movements
      ?.filter((m) => {
        const today = new Date().toISOString().split("T")[0];
        const movDate = m.movementDate.split("T")[0];
        return movDate === today && m.type === MovementType.Income;
      })
      .reduce((sum, m) => sum + m.amount, 0) || 0;

  const todayExpense =
    movements
      ?.filter((m) => {
        const today = new Date().toISOString().split("T")[0];
        const movDate = m.movementDate.split("T")[0];
        return movDate === today && m.type === MovementType.Expense;
      })
      .reduce((sum, m) => sum + m.amount, 0) || 0;

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

      {/* Métricas */}
      <div className="caja__metrics">
        <Card className="caja__metric">
          <h4 className="caja__metric-title">Saldo Total</h4>
          <div className="caja__metric-value caja__metric-value--balance">
            {formatCurrency(totalBalance)}
          </div>
          <div className="caja__metric-accounts">
            {accounts?.map((acc) => (
              <div key={acc.id} className="caja__metric-account">
                <span className="caja__metric-account-name">{acc.name}</span>
                <span className="caja__metric-account-balance">
                  {formatCurrency(acc.currentBalance)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="caja__metric">
          <h4 className="caja__metric-title">Caja Hoy</h4>
          <div className="caja__metric-value caja__metric-value--today">
            {formatCurrency(todayIncome - todayExpense)}
          </div>
          <div className="caja__metric-breakdown">
            <span className="caja__metric-item caja__metric-item--income">
              +{formatCurrency(todayIncome)}
            </span>
            <span className="caja__metric-item caja__metric-item--expense">
              -{formatCurrency(todayExpense)}
            </span>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="caja__filters">
        <Button
          variant={filter === "all" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={filter === "income" ? "success" : "ghost"}
          size="sm"
          onClick={() => setFilter("income")}
        >
          Ingresos
        </Button>
        <Button
          variant={filter === "expense" ? "danger" : "ghost"}
          size="sm"
          onClick={() => setFilter("expense")}
        >
          Egresos
        </Button>
      </div>

      {/* Movimientos */}
      <Card className="caja__movements">
        <h3 className="caja__movements-title">Movimientos</h3>

        {!filteredMovements || filteredMovements.length === 0 ? (
          <EmptyState icon="💰" title="No hay movimientos" />
        ) : (
          <div className="caja__movements-list">
            {filteredMovements.map((mov) => (
              <div key={mov.id} className="caja__movement">
                <div className="caja__movement-info">
                  <div className="caja__movement-header">
                    <span className="caja__movement-number">#{mov.number}</span>
                    <span className="caja__movement-method">{mov.method}</span>
                    {mov.ticket && ( // ← CORREGIDO: mov.ticket en vez de mov.ticketNumber
                      <span className="caja__movement-ticket">
                        Ticket #{mov.ticket.number} {/* ← CORREGIDO */}
                      </span>
                    )}
                  </div>
                  <div className="caja__movement-concept">{mov.concept}</div>
                  <div className="caja__movement-footer">
                    <span className="caja__movement-account">
                      {mov.account?.name || "Sin cuenta"}
                    </span>
                    <span className="caja__movement-date">
                      {formatDate(mov.movementDate)}
                    </span>
                  </div>
                </div>

                <div className="caja__movement-actions">
                  <div
                    className={`caja__movement-amount caja__movement-amount--${
                      mov.type === MovementType.Income ? "income" : "expense"
                    }`}
                  >
                    {mov.type === MovementType.Income ? "+" : "-"}
                    {formatCurrency(mov.amount)}
                  </div>
                  {isAdmin() && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(mov)}
                      disabled={deleteMovement.isPending}
                    >
                      🗑️
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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