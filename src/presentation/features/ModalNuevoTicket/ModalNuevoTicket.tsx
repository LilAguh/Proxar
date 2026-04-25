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

const validate = () => {
  const newErrors: Record<string, string> = {};

  if (!form.clientId) newErrors.clientId = 'Seleccione un cliente';
  if (!form.title) newErrors.title = 'El título es requerido';
  if (form.title.length > 200) newErrors.title = 'Máximo 200 caracteres';
  if (form.description.length > 2000) newErrors.description = 'Máximo 2000 caracteres';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;
  
  await createTicket.mutateAsync(form);
  handleClose();
};

  const [form, setForm] = useState({
    clientId: '',
    type: TicketType.Glass,
    priority: Priority.Medium,
    title: '',
    description: '',
    address: '',
  });

  const handleClose = () => {
    setForm({
      clientId: '',
      type: TicketType.Glass,
      priority: Priority.Medium,
      title: '',
      description: '',
      address: '',
    });
    onClose();
  };

  const isValid = form.clientId && form.title;

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
            onChange={(value) => setForm({ ...form, clientId: value })}
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
            label="Dirección"
            value={form.address}
            onChange={(value) => setForm({ ...form, address: value })}
            placeholder="Dirección del trabajo"
          />
        </div>

        <Input
  label="Título"
  required
  value={form.title}
  onChange={(value) => {
    setForm({ ...form, title: value });
    if (errors.title) setErrors({ ...errors, title: '' });
  }}
  placeholder="Ej: Cambio de vidrio ventana cocina"
  error={errors.title}
/>

        <Textarea
          label="Descripción"
          value={form.description}
          onChange={(value) => setForm({ ...form, description: value })}
          placeholder="Detalles del trabajo a realizar..."
          rows={5}
        />
      </div>
    </Modal>
  );
};