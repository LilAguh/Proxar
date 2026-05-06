import { useState } from 'react';
import { Card, Button } from '@presentation/atoms';
import { EmptyState } from '@presentation/molecules';
import { ModalAccount } from '@presentation/features/ModalAccount/ModalAccount';
import { useAccounts, useDeleteAccount } from '@/hooks/api/useAccounts';
import type { Account } from '@core/entities/Account.entity';
import './Cuentas.scss';

const accountTypeLabels: Record<number, string> = {
  0: 'Efectivo',
  1: 'Banco',
  2: 'Mercado Pago',
  3: 'Otro',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);

export const Cuentas = () => {
  const { data: accounts, isLoading } = useAccounts();
  const deleteAccount = useDeleteAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const handleDelete = async (account: Account) => {
    if (!window.confirm(`¿Eliminar la cuenta "${account.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteAccount.mutateAsync(account.id);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAccount(null);
  };

  if (isLoading) {
    return (
      <div className="cuentas">
        <div className="cuentas__header">
          <h1 className="cuentas__title">Cuentas</h1>
          <p className="cuentas__subtitle">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cuentas">
      <div className="cuentas__header">
        <div>
          <h1 className="cuentas__title">Cuentas</h1>
          <p className="cuentas__subtitle">Administrá las cuentas de tu empresa</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          + Nueva cuenta
        </Button>
      </div>

      {!accounts || accounts.length === 0 ? (
        <Card>
          <EmptyState
            message="No hay cuentas registradas"
            submessage="Creá tu primera cuenta para empezar"
            action={() => setModalOpen(true)}
            actionLabel="+ Nueva cuenta"
          />
        </Card>
      ) : (
        <div className="cuentas__grid">
          {accounts.map((account) => (
            <Card key={account.id} className="cuentas__card">
              <div className="cuentas__card-header">
                <div>
                  <h3 className="cuentas__card-name">{account.name}</h3>
                  <span className="cuentas__card-type">{accountTypeLabels[account.type]}</span>
                </div>
                <div className="cuentas__card-balance">{fmt(account.currentBalance)}</div>
              </div>
              <div className="cuentas__card-footer">
                <span className={`cuentas__card-status ${account.active ? 'active' : 'inactive'}`}>
                  {account.active ? '● Activa' : '○ Inactiva'}
                </span>
                <div className="cuentas__card-actions">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(account)}
                    disabled={deleteAccount.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ModalAccount isOpen={modalOpen} onClose={handleCloseModal} account={editingAccount} />
    </div>
  );
};
