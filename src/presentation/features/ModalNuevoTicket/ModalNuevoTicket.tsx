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

export const ModalNuevoTicket = ({ isOpen, onClose }: ModalNuevoTicketProps) => {
  const { data: clients } = useClients();
  const createTicket = useCreateTicket();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    clientId: '',
    type: TicketType.Glass,
    priority: Priority.Medium,
    title: '',
    description: '',
    address: '',
  });

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'clientId':
        if (!value) return 'Selecciona un cliente';
        return '';

      case 'title':
        if (!value) return 'El título es requerido';
        if (value.length < 5) return 'Mínimo 5 caracteres';
        if (value.length > 200) return 'Máximo 200 caracteres';
        return '';

      case 'description':
        if (value.length > 2000) return 'Máximo 2000 caracteres';
        return '';

      default:
        return '';
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {
      clientId: validateField('clientId', form.clientId),
      title: validateField('title', form.title),
      description: validateField('description', form.description),
    };

    setErrors(newErrors);
    setTouched({ clientId: true, title: true, description: true });
    return !newErrors.clientId && !newErrors.title && !newErrors.description;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await createTicket.mutateAsync(form);
    handleClose();
  };

  const handleClose = () => {
    setForm({
      clientId: '',
      type: TicketType.Glass,
      priority: Priority.Medium,
      title: '',
      description: '',
      address: '',
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

  const isValid = form.clientId && form.title && form.title.length >= 5 && !errors.clientId && !errors.title && !errors.description;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Ticket"
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || createTicket.isPending}
          >
            {createTicket.isPending ? 'Creando...' : 'Crear Ticket'}
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
            onChange={(value) => handleFieldChange('clientId', value)}
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
            onChange={(value) => setForm({ ...form, type: value as TicketType })}
            options={[
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
            onChange={(value) => setForm({ ...form, priority: value as Priority })}
            options={[
              { value: Priority.Low, label: 'Baja' },
              { value: Priority.Medium, label: 'Media' },
              { value: Priority.High, label: 'Alta' },
              { value: Priority.Urgent, label: 'Urgente' },
            ]}
          />
          <Input
            label="Dirección (opcional)"
            value={form.address}
            onChange={(value) => setForm({ ...form, address: value })}
            placeholder="Dirección del trabajo"
          />
        </div>

        <Input
          label="Título"
          required
          value={form.title}
          onChange={(value) => handleFieldChange('title', value)}
          onBlur={() => handleFieldBlur('title')}
          placeholder="Ej: Cambio de vidrio ventana cocina"
          error={touched.title ? errors.title : ''}
          hint="Mínimo 5 caracteres"
        />

        <Textarea
          label="Descripción (opcional)"
          value={form.description}
          onChange={(value) => handleFieldChange('description', value)}
          onBlur={() => handleFieldBlur('description')}
          placeholder="Detalles del trabajo a realizar..."
          error={touched.description ? errors.description : ''}
          rows={5}
        />
      </div>
    </Modal>
  );
};