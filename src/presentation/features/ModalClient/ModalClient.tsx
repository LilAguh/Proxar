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

export const ModalClient = ({ isOpen, onClose, client }: ModalClientProps) => {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name,
        phone: client.phone,
        email: client.email || '',
        address: client.address || '',
        notes: client.notes || '',
      });
    }
  }, [client]);

  const handleSubmit = async () => {
    if (client) {
      await updateClient.mutateAsync({ id: client.id, data: form });
    } else {
      await createClient.mutateAsync(form);
    }
    handleClose();
  };

  const handleClose = () => {
    setForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    onClose();
  };

  const isValid = form.name && form.phone;
  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={client ? 'Editar Cliente' : 'Nuevo Cliente'}
      width="md"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? 'Guardando...' : client ? 'Guardar Cambios' : 'Crear Cliente'}
          </Button>
        </>
      }
    >
      <div className="modal-client">
        <Input
          label="Nombre"
          required
          value={form.name}
          onChange={(value) => setForm({ ...form, name: value })}
          placeholder="Nombre completo o razón social"
        />

        <div className="modal-client__row">
          <Input
            label="Teléfono"
            type="tel"
            required
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
            placeholder="351-1234567"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => setForm({ ...form, email: value })}
            placeholder="cliente@ejemplo.com"
          />
        </div>

        <Input
          label="Dirección"
          value={form.address}
          onChange={(value) => setForm({ ...form, address: value })}
          placeholder="Dirección completa"
        />

        <Textarea
          label="Notas"
          value={form.notes}
          onChange={(value) => setForm({ ...form, notes: value })}
          placeholder="Información adicional del cliente..."
          rows={4}
        />
      </div>
    </Modal>
  );
};