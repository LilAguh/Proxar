import { useState, useEffect } from 'react';
import { Modal } from '@presentation/molecules';
import { Input, Textarea, Button } from '@presentation/atoms';
import { useCreateClient, useUpdateClient } from '@/hooks/api';
import { Client } from '@core/entities/Client.entity';
import './ModalClient.scss';

interface ModalClientProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

interface ClientForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const EMPTY_FORM: ClientForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

const PHONE_REGEX = /^[\d\s\-+().]{6,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateField = (field: keyof ClientForm, value: string): string => {
  switch (field) {
    case 'name':
      if (!value) return 'El nombre es requerido';
      if (value.length < 2) return 'Mínimo 2 caracteres';
      if (value.length > 100) return 'Máximo 100 caracteres';
      return '';
    case 'phone':
      if (!value) return 'El teléfono es requerido';
      if (!PHONE_REGEX.test(value)) return 'Formato inválido. Ej: 351-1234567';
      return '';
    case 'email':
      if (value && !EMAIL_REGEX.test(value)) return 'Email inválido';
      return '';
    case 'address':
      if (value.length > 300) return 'Máximo 300 caracteres';
      return '';
    case 'notes':
      if (value.length > 1000) return 'Máximo 1000 caracteres';
      return '';
    default:
      return '';
  }
};

const REQUIRED_FIELDS: (keyof ClientForm)[] = ['name', 'phone'];

export const ModalClient = ({ isOpen, onClose, client }: ModalClientProps) => {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const [form, setForm] = useState<ClientForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientForm, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ClientForm, boolean>>>({});

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        phone: client.phone,
        email: client.email || '',
        address: client.address || '',
        notes: client.notes || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [client]);

  const handleChange = (field: keyof ClientForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field: keyof ClientForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const validateAll = (): boolean => {
    const allFields = Object.keys(EMPTY_FORM) as (keyof ClientForm)[];
    const newErrors: Partial<Record<keyof ClientForm, string>> = {};
    const allTouched: Partial<Record<keyof ClientForm, boolean>> = {};

    for (const field of allFields) {
      newErrors[field] = validateField(field, form[field]);
      allTouched[field] = true;
    }

    setErrors(newErrors);
    setTouched(allTouched);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;

    if (client) {
      await updateClient.mutateAsync({ id: client.id, data: form });
    } else {
      await createClient.mutateAsync(form);
    }
    handleClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    onClose();
  };

  const isPending = createClient.isPending || updateClient.isPending;
  const isSubmitDisabled =
    isPending ||
    REQUIRED_FIELDS.some((f) => !form[f]) ||
    Object.values(errors).some(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={client ? 'Editar Cliente' : 'Nuevo Cliente'}
      width="md"
      isLoading={isPending}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitDisabled} loading={isPending}>
            {client ? 'Guardar Cambios' : 'Crear Cliente'}
          </Button>
        </>
      }
    >
      <div className="modal-client">
        <Input
          label="Nombre"
          required
          value={form.name}
          onChange={(value) => handleChange('name', value)}
          onBlur={() => handleBlur('name')}
          placeholder="Nombre completo o razón social"
          error={touched.name ? errors.name : ''}
        />

        <div className="modal-client__row">
          <Input
            label="Teléfono"
            type="tel"
            required
            value={form.phone}
            onChange={(value) => handleChange('phone', value)}
            onBlur={() => handleBlur('phone')}
            placeholder="351-1234567"
            error={touched.phone ? errors.phone : ''}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => handleChange('email', value)}
            onBlur={() => handleBlur('email')}
            placeholder="cliente@ejemplo.com"
            error={touched.email ? errors.email : ''}
          />
        </div>

        <Input
          label="Dirección"
          value={form.address}
          onChange={(value) => handleChange('address', value)}
          onBlur={() => handleBlur('address')}
          placeholder="Dirección completa"
          error={touched.address ? errors.address : ''}
        />

        <Textarea
          label="Notas"
          value={form.notes}
          onChange={(value) => handleChange('notes', value)}
          onBlur={() => handleBlur('notes')}
          placeholder="Información adicional del cliente..."
          rows={4}
          error={touched.notes ? errors.notes : ''}
        />
      </div>
    </Modal>
  );
};
