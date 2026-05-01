import { useState } from 'react';
import { Modal } from '@presentation/molecules';
import { Input, Select, Textarea, Button } from '@presentation/atoms';
import { useClients, useCreateTicket } from '@/hooks/api';
import { TicketType, Priority } from '@core/enums';
import './ModalNuevoTicket.scss';

interface ModalNuevoTicketProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TicketForm {
  clientId: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  address: string;
}

const EMPTY_FORM: TicketForm = {
  clientId: '',
  type: '',
  priority: '',
  title: '',
  description: '',
  address: '',
};

const validateField = (field: keyof TicketForm, value: string): string => {
  switch (field) {
    case 'clientId':
      return value ? '' : 'Seleccioná un cliente';
    case 'type':
      return value ? '' : 'Seleccioná el tipo de trabajo';
    case 'priority':
      return value ? '' : 'Seleccioná la prioridad';
    case 'title':
      if (!value) return 'El título es requerido';
      if (value.length < 5) return 'Mínimo 5 caracteres';
      if (value.length > 200) return 'Máximo 200 caracteres';
      return '';
    case 'description':
      return value.length > 2000 ? 'Máximo 2000 caracteres' : '';
    default:
      return '';
  }
};

const REQUIRED_FIELDS: (keyof TicketForm)[] = ['clientId', 'type', 'priority', 'title'];

export const ModalNuevoTicket = ({ isOpen, onClose }: ModalNuevoTicketProps) => {
  const { data: clients } = useClients();
  const createTicket = useCreateTicket();
  const [form, setForm] = useState<TicketForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof TicketForm, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TicketForm, boolean>>>({});

  const handleChange = (field: keyof TicketForm, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field: keyof TicketForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const validateAll = (): boolean => {
    const allFields: (keyof TicketForm)[] = ['clientId', 'type', 'priority', 'title', 'description'];
    const newErrors: Partial<Record<keyof TicketForm, string>> = {};
    const allTouched: Partial<Record<keyof TicketForm, boolean>> = {};

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

    await createTicket.mutateAsync({
      ...form,
      type: form.type as TicketType,
      priority: form.priority as Priority,
    });
    handleClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    onClose();
  };

  const isSubmitDisabled =
    createTicket.isPending ||
    REQUIRED_FIELDS.some((f) => !form[f]) ||
    Object.values(errors).some(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Ticket"
      width="lg"
      isLoading={createTicket.isPending}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={createTicket.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            loading={createTicket.isPending}
          >
            Crear Ticket
          </Button>
        </>
      }
    >
      <div className="modal-ticket">
        <div className="modal-ticket__row">
          <Select
            label="Cliente"
            required
            value={form.clientId}
            onChange={(value) => handleChange('clientId', value)}
            onBlur={() => handleBlur('clientId')}
            error={touched.clientId ? errors.clientId : ''}
            options={[
              { value: '', label: 'Seleccionar cliente' },
              ...(clients?.map((c) => ({ value: c.id, label: c.name })) || []),
            ]}
          />
          <Select
            label="Tipo"
            required
            value={form.type}
            onChange={(value) => handleChange('type', value)}
            onBlur={() => handleBlur('type')}
            error={touched.type ? errors.type : ''}
            options={[
              { value: '', label: 'Seleccionar tipo' },
              { value: TicketType.Measurement, label: 'Medición' },
              { value: TicketType.Repair, label: 'Reparación' },
              { value: TicketType.Glass, label: 'Vidrio' },
              { value: TicketType.Window, label: 'Abertura' },
              { value: TicketType.Construction, label: 'Obra' },
              { value: TicketType.Other, label: 'Otro' },
            ]}
          />
        </div>

        <div className="modal-ticket__row">
          <Select
            label="Prioridad"
            required
            value={form.priority}
            onChange={(value) => handleChange('priority', value)}
            onBlur={() => handleBlur('priority')}
            error={touched.priority ? errors.priority : ''}
            options={[
              { value: '', label: 'Seleccionar prioridad' },
              { value: Priority.Low, label: 'Baja' },
              { value: Priority.Medium, label: 'Media' },
              { value: Priority.High, label: 'Alta' },
              { value: Priority.Urgent, label: 'Urgente' },
            ]}
          />
          <Input
            label="Dirección (opcional)"
            value={form.address}
            onChange={(value) => handleChange('address', value)}
            placeholder="Dirección del trabajo"
          />
        </div>

        <Input
          label="Título"
          required
          value={form.title}
          onChange={(value) => handleChange('title', value)}
          onBlur={() => handleBlur('title')}
          placeholder="Ej: Cambio de vidrio ventana cocina"
          error={touched.title ? errors.title : ''}
          hint="Mínimo 5 caracteres"
        />

        <Textarea
          label="Descripción (opcional)"
          value={form.description}
          onChange={(value) => handleChange('description', value)}
          onBlur={() => handleBlur('description')}
          placeholder="Detalles del trabajo a realizar..."
          error={touched.description ? errors.description : ''}
          rows={5}
        />
      </div>
    </Modal>
  );
};
