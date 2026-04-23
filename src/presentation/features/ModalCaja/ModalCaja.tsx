import { useState } from 'react';
import { Modal } from '@presentation/molecules';
import { Input, Select, Textarea, Button } from '../../atoms';
import { useActiveAccounts, useRegisterMovement } from '@/hooks/api';
import { MovementType, PaymentMethod } from '@core/enums';
import './ModalCaja.scss';

interface ModalCajaProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalCaja = ({ isOpen, onClose }: ModalCajaProps) => {
  const { data: accounts } = useActiveAccounts();
  const registerMovement = useRegisterMovement();

  const [form, setForm] = useState({
    accountId: '',
    type: MovementType.Income,
    amount: '',
    method: PaymentMethod.Cash,
    concept: '',
    voucherNumber: '',
    observations: '',
    movementDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async () => {
    await registerMovement.mutateAsync({
      ...form,
      amount: parseFloat(form.amount),
    });
    handleClose();
  };

  const handleClose = () => {
    setForm({
      accountId: '',
      type: MovementType.Income,
      amount: '',
      method: PaymentMethod.Cash,
      concept: '',
      voucherNumber: '',
      observations: '',
      movementDate: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const isValid = form.accountId && form.amount && form.concept;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Movimiento de Caja"
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!isValid || registerMovement.isPending}
          >
            {registerMovement.isPending ? 'Registrando...' : 'Registrar'}
          </Button>
        </>
      }
    >
      <div className="modal-caja">
        <div className="modal-caja__row">
          <Select
            label="Cuenta"
            required
            value={form.accountId}
            onChange={(value) => setForm({ ...form, accountId: value })}
            options={[
              { value: '', label: 'Seleccionar cuenta' },
              ...(accounts?.map((a) => ({ value: a.id, label: a.name })) || []),
            ]}
          />
          <Select
            label="Tipo"
            required
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value as MovementType })}
            options={[
              { value: MovementType.Income, label: '💰 Ingreso' },
              { value: MovementType.Expense, label: '💸 Egreso' },
            ]}
          />
        </div>

        <div className="modal-caja__row">
          <Input
            label="Monto"
            type="number"
            required
            value={form.amount}
            onChange={(value) => setForm({ ...form, amount: value })}
            placeholder="0.00"
          />
          <Select
            label="Medio de Pago"
            required
            value={form.method}
            onChange={(value) => setForm({ ...form, method: value as PaymentMethod })}
            options={[
              { value: PaymentMethod.Cash, label: 'Efectivo' },
              { value: PaymentMethod.Transfer, label: 'Transferencia' },
              { value: PaymentMethod.Card, label: 'Tarjeta' },
              { value: PaymentMethod.Check, label: 'Cheque' },
              { value: PaymentMethod.Other, label: 'Otro' },
            ]}
          />
        </div>

        <div className="modal-caja__row">
          <Input
            label="Nº Comprobante"
            value={form.voucherNumber}
            onChange={(value) => setForm({ ...form, voucherNumber: value })}
            placeholder="FAC-001, REC-001, etc."
          />
          <Input
            label="Fecha"
            type="number"
            required
            value={form.movementDate}
            onChange={(value) => setForm({ ...form, movementDate: value })}
          />
        </div>

        <Input
          label="Concepto"
          required
          value={form.concept}
          onChange={(value) => setForm({ ...form, concept: value })}
          placeholder="Ej: Pago de proveedor, Cobro cliente, etc."
        />

        <Textarea
          label="Observaciones"
          value={form.observations}
          onChange={(value) => setForm({ ...form, observations: value })}
          placeholder="Notas adicionales..."
          rows={3}
        />
      </div>
    </Modal>
  );
};