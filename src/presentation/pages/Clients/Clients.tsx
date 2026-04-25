import { useState } from 'react';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/api';
import { Card, Button, Input, Textarea } from '@presentation/atoms';
import { Spinner, EmptyState, Modal, ConfirmDialog } from '@presentation/molecules';
import { Client } from '@core/entities/Client.entity';
import { useConfirm } from '@/hooks/api/useConfirm';
import './Clients.scss';

export const Clients = () => {
  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.phone.includes(search) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleDelete = async (client: Client) => {
    const confirmed = await confirm({
      title: 'Eliminar Cliente',
      message: `¿Estás seguro que querés eliminar a ${client.name}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (confirmed) {
      await deleteClient.mutateAsync(client.id);
    }
  };

  if (isLoading) {
    return (
      <div className="clients-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="clients">
      <div className="clients__header">
        <div>
          <h1 className="clients__title">Clientes</h1>
          <p className="clients__subtitle">Gestión de clientes</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nuevo Cliente
        </Button>
      </div>

      <Card className="clients__search">
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={setSearch}
          fullWidth
        />
      </Card>

      <div className="clients__list">
        {!filteredClients || filteredClients.length === 0 ? (
          <EmptyState
            icon="◉"
            title="No hay clientes"
            description={search ? 'No se encontraron resultados' : 'Creá tu primer cliente'}
            action={
              !search ? (
                <Button variant="primary" onClick={handleCreate}>
                  + Nuevo Cliente
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="clients__grid">
            {filteredClients.map((client) => (
              <Card key={client.id} className="clients__card" hoverable>
                <div className="clients__card-header">
                  <h3 className="clients__card-name">{client.name}</h3>
                </div>
                <div className="clients__card-body">
                  <div className="clients__card-info">
                    <span className="clients__card-label">Teléfono:</span>
                    <span className="clients__card-value">{client.phone}</span>
                  </div>
                  {client.email && (
                    <div className="clients__card-info">
                      <span className="clients__card-label">Email:</span>
                      <span className="clients__card-value">{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="clients__card-info">
                      <span className="clients__card-label">Dirección:</span>
                      <span className="clients__card-value">{client.address}</span>
                    </div>
                  )}
                </div>
                <div className="clients__card-footer">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(client)}
                    disabled={deleteClient.isPending}
                  >
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ClientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        client={editingClient}
      />

      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={deleteClient.isPending}
      />
    </div>
  );
};

// Modal de Cliente (mismo código que antes, sin cambios)
interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

const ClientModal = ({ isOpen, onClose, client }: ClientModalProps) => {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const [form, setForm] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
    notes: client?.notes || '',
  });

  const handleSubmit = async () => {
    if (client) {
      await updateClient.mutateAsync({ id: client.id, data: form });
    } else {
      await createClient.mutateAsync(form);
    }
    onClose();
  };

  const isValid = form.name && form.phone;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Editar Cliente' : 'Nuevo Cliente'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            {client ? 'Guardar' : 'Crear'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Nombre"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          required
        />
        <Input
          label="Teléfono"
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <Input
          label="Dirección"
          value={form.address}
          onChange={(v) => setForm({ ...form, address: v })}
        />
        <Textarea
          label="Notas"
          value={form.notes}
          onChange={(v) => setForm({ ...form, notes: v })}
          rows={4}
        />
      </div>
    </Modal>
  );
};