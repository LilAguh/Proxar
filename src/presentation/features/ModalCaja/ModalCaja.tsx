import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Spinner } from '@presentation/molecules';
import { Input, Select, Textarea, Button } from '../../atoms';
import { useActiveAccounts, useRegisterMovement, useTodayCashRegister } from '@/hooks/api';
import { MovementType, PaymentMethod, CashRegisterStatus } from '@core/enums';
import './ModalCaja.scss';

interface ModalCajaProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalCaja = ({ isOpen, onClose }: ModalCajaProps) => {
  if (!isOpen) return null;
  return <ModalCajaContent onClose={onClose} />;
};

const ModalCajaContent = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const { data: todayRegister, isLoading: loadingRegister } = useTodayCashRegister();
  const { data: accounts } = useActiveAccounts();
  const registerMovement = useRegisterMovement();

  const cajaAbierta = todayRegister?.status === CashRegisterStatus.Open;
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
        return !value ? 'Selecciona una cuenta' : '';
      case 'amount': {
        if (!value) return 'El monto es requerido';
        const n = parseFloat(value);
        if (isNaN(n)) return 'Debe ser un número válido';
        if (n <= 0) return 'El monto debe ser mayor a 0';
        return '';
      }
      case 'concept':
        if (!value) return 'El concepto es requerido';
        return value.length < 3 ? 'Mínimo 3 caracteres' : '';
      case 'movementDate': {
        if (!value) return 'La fecha es requerida';
        const [year, month, day] = value.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d > today ? 'La fecha no puede ser futura' : '';
      }
      default:
        return '';
    }
  };

  const validate = () => {
    const newErrors = {
      accountId: validateField('accountId', form.accountId),
      amount: validateField('amount', form.amount),
      concept: validateField('concept', form.concept),
      movementDate: validateField('movementDate', form.movementDate),
    };
    setErrors(newErrors);
    setTouched({ accountId: true, amount: true, concept: true, movementDate: true });
    return !Object.values(newErrors).some(Boolean);
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

  const handleSubmit = async () => {
    if (!validate()) return;
    await registerMovement.mutateAsync({ ...form, amount: parseFloat(form.amount) });
    handleClose();
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    if (touched[field]) setErrors({ ...errors, [field]: validateField(field, value) });
  };

  const handleFieldBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    setErrors({ ...errors, [field]: validateField(field, form[field as keyof typeof form] as string) });
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const hasRequiredFields = !!(form.accountId && form.amount && form.concept && form.movementDate);
  const isValid = hasRequiredFields && !hasErrors;

  if (loadingRegister) {
    return (
      <Modal isOpen onClose={handleClose} title="Registrar Movimiento de Caja" width="lg">
        <div className="modal-caja__loading"><Spinner size="md" /></div>
      </Modal>
    );
  }

  if (!cajaAbierta) {
    return (
      <Modal
        isOpen
        onClose={handleClose}
        title="Registrar Movimiento de Caja"
        width="lg"
        footer={
          <>
            <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
            <Button variant="primary" onClick={() => { handleClose(); navigate('/caja'); }}>
              Ir a abrir la caja →
            </Button>
          </>
        }
      >
        <div className="modal-caja__blocked">
          <div className="modal-caja__blocked-icon">⬡</div>
          <h3 className="modal-caja__blocked-title">La caja no está abierta</h3>
          <p className="modal-caja__blocked-text">
            Para registrar movimientos primero tenés que abrir la caja del día.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title="Registrar Movimiento de Caja"
      width="lg"
      isLoading={registerMovement.isPending}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={registerMovement.isPending}>Cancelar</Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!isValid || registerMovement.isPending}
            loading={registerMovement.isPending}
          >
            Registrar
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
            onChange={(v) => handleFieldChange('accountId', v)}
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
            onChange={(v) => setForm({ ...form, type: v as MovementType })}
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
            onChange={(v) => handleFieldChange('amount', v)}
            onBlur={() => handleFieldBlur('amount')}
            placeholder="0.00"
            error={touched.amount ? errors.amount : ''}
            hint="Debe ser mayor a 0"
          />
          <Select
            label="Medio de Pago"
            required
            value={form.method}
            onChange={(v) => setForm({ ...form, method: v as PaymentMethod })}
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
            onChange={(v) => setForm({ ...form, voucherNumber: v })}
            placeholder="FAC-001, REC-001, etc."
          />
          <Input
            label="Fecha"
            type="date"
            required
            value={form.movementDate}
            onChange={(v) => handleFieldChange('movementDate', v)}
            onBlur={() => handleFieldBlur('movementDate')}
            error={touched.movementDate ? errors.movementDate : ''}
            hint="No puede ser futura"
          />
        </div>

        <Input
          label="Concepto"
          required
          value={form.concept}
          onChange={(v) => handleFieldChange('concept', v)}
          onBlur={() => handleFieldBlur('concept')}
          placeholder="Ej: Pago de proveedor, Cobro cliente, etc."
          error={touched.concept ? errors.concept : ''}
          hint="Mínimo 3 caracteres"
        />

        <Textarea
          label="Observaciones"
          value={form.observations}
          onChange={(v) => setForm({ ...form, observations: v })}
          placeholder="Notas adicionales..."
          rows={3}
        />
      </div>
    </Modal>
  );
};
