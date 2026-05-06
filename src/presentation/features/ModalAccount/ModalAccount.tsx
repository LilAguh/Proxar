import { useState, useEffect } from 'react';
import { Modal } from '@presentation/molecules';
import { Input, Select, Button } from '@presentation/atoms';
import { useCreateAccount, useUpdateAccount } from '@/hooks/api/useAccounts';
import type { Account } from '@core/entities/Account.entity';
import './ModalAccount.scss';

interface ModalAccountProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account | null;
}

export const ModalAccount = ({ isOpen, onClose, account }: ModalAccountProps) => {
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    name: '',
    type: '0', // Efectivo por defecto
  });

  useEffect(() => {
    if (account) {
      setForm({
        name: account.name,
        type: String(account.type),
      });
    } else {
      setForm({ name: '', type: '0' });
    }
    setErrors({});
    setTouched({});
  }, [account, isOpen]);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value) return 'El nombre es requerido';
        if (value.length < 3) return 'Mínimo 3 caracteres';
        if (value.length > 50) return 'Máximo 50 caracteres';
        return '';
      default:
        return '';
    }
  };

  const validate = () => {
    const newErrors = {
      name: validateField('name', form.name),
    };
    setErrors(newErrors);
    setTouched({ name: true });
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (account) {
        await updateAccount.mutateAsync({
          id: account.id,
          data: { name: form.name, type: parseInt(form.type) },
        });
      } else {
        await createAccount.mutateAsync({
          name: form.name,
          type: parseInt(form.type),
        });
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar cuenta:', error);
    }
  };

  const handleClose = () => {
    setForm({ name: '', type: '0' });
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={account ? 'Editar Cuenta' : 'Nueva Cuenta'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="modal-account__form">
        <Input
          label="Nombre"
          value={form.name}
          onChange={(value) => {
            setForm({ ...form, name: value });
            if (touched.name) {
              setErrors({ ...errors, name: validateField('name', value) });
            }
          }}
          onBlur={() => {
            setTouched({ ...touched, name: true });
            setErrors({ ...errors, name: validateField('name', form.name) });
          }}
          error={touched.name ? errors.name : ''}
          placeholder="Ej: Efectivo, Banco Galicia, Mercado Pago"
          required
        />

        <Select
          label="Tipo"
          value={form.type}
          onChange={(value) => setForm({ ...form, type: value })}
        >
          <option value="0">Efectivo</option>
          <option value="1">Banco</option>
          <option value="2">Mercado Pago</option>
          <option value="3">Otro</option>
        </Select>

        <div className="modal-account__actions">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={createAccount.isPending || updateAccount.isPending}
          >
            {account ? 'Guardar cambios' : 'Crear cuenta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
