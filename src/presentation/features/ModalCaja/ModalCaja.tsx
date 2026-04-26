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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'accountId':
        if (!value) return 'Selecciona una cuenta';
        return '';

      case 'amount':
        if (!value) return 'El monto es requerido';
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Debe ser un número válido';
        if (amount < 0) return 'El monto no puede ser negativo';
        if (amount === 0) return 'El monto debe ser mayor a 0';
        return '';

      case 'concept':
        if (!value) return 'El concepto es requerido';
        if (value.length < 3) return 'Mínimo 3 caracteres';
        return '';

      case 'movementDate':
        if (!value) return 'La fecha es requerida';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) return 'La fecha no puede ser futura';
        return '';

      default:
        return '';
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {
      accountId: validateField('accountId', form.accountId),
      amount: validateField('amount', form.amount),
      concept: validateField('concept', form.concept),
      movementDate: validateField('movementDate', form.movementDate),
    };

    setErrors(newErrors);
    setTouched({ accountId: true, amount: true, concept: true, movementDate: true });
    return !newErrors.accountId && !newErrors.amount && !newErrors.concept && !newErrors.movementDate;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

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
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });

    // Solo validar si el campo ya fue tocado
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, form[field as keyof typeof form]);
    setErrors({ ...errors, [field]: error });
  };

  const isValid = form.accountId && form.amount && form.concept && form.movementDate &&
    !errors.accountId && !errors.amount && !errors.concept && !errors.movementDate;

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
            onChange={(value) => handleFieldChange('accountId', value)}
            error={touched.accountId ? errors.accountId : ''}
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
            onChange={(value) => handleFieldChange('amount', value)}
            onBlur={() => handleFieldBlur('amount')}
            placeholder="0.00"
            error={touched.amount ? errors.amount : ''}
            hint="Debe ser mayor a 0"
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
            type="date"
            required
            value={form.movementDate}
            onChange={(value) => handleFieldChange('movementDate', value)}
            onBlur={() => handleFieldBlur('movementDate')}
            error={touched.movementDate ? errors.movementDate : ''}
            hint="No puede ser futura"
          />
        </div>

        <Input
          label="Concepto"
          required
          value={form.concept}
          onChange={(value) => handleFieldChange('concept', value)}
          onBlur={() => handleFieldBlur('concept')}
          placeholder="Ej: Pago de proveedor, Cobro cliente, etc."
          error={touched.concept ? errors.concept : ''}
          hint="Mínimo 3 caracteres"
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