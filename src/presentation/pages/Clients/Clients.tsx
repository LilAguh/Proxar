import { useState } from 'react';
import { useClients, useDeleteClient } from '@/hooks/api';
import { Card, Button, Input } from '@presentation/atoms';
import { Spinner, EmptyState } from '@presentation/molecules';
import { ModalClient } from '@presentation/features';
import { Client } from '@core/entities/Client.entity';
import { ConfirmDialog } from '@presentation/molecules/ConfirmDialog/ConfirmDialog';
import './Clients.scss';

export const Clients = () => {
  const { data: clients, isLoading } = useClients();
  const deleteClient = useDeleteClient();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; client: any }>({
  open: false,
  client: null,
});

const handleDeleteClick = (client: any) => {
  setDeleteConfirm({ open: true, client });
};

const handleConfirmDelete = async () => {
  if (deleteConfirm.client) {
    await deleteClient.mutateAsync(deleteConfirm.client.id);
  }
  setDeleteConfirm({ open: false, client: null });
};


  const filtered = clients?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedClient(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteClient.mutate(id);
    setConfirmDeleteId(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
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
          <p className="clients__subtitle">{clients?.length ?? 0} clientes registrados</p>
        </div>
        <Button variant="primary" onClick={handleNew}>
          + Nuevo Cliente
        </Button>
      </div>

      <div className="clients__toolbar">
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={setSearch}
        />
      </div>
      <ConfirmDialog
  isOpen={deleteConfirm.open}
  title="Eliminar Cliente"
  message={`¿Estás seguro que querés eliminar a ${deleteConfirm.client?.name}? Esta acción no se puede deshacer.`}
  onConfirm={handleConfirmDelete}
  onCancel={() => setDeleteConfirm({ open: false, client: null })}
  confirmText="Eliminar"
  variant="danger"
/>

      {filtered.length === 0 ? (
        <EmptyState
          icon="👤"
          title={search ? 'Sin resultados' : 'No hay clientes'}
          description={search ? `No se encontraron clientes para "${search}"` : 'Creá el primer cliente con el botón de arriba'}
        />
      ) : (
        <div className="clients__grid">
          {filtered.map((client) => (
            <Card key={client.id} className="clients__card">
              <div className="clients__card-header">
                <div className="clients__avatar">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="clients__card-actions">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                    Editar
                  </Button>
                  {confirmDeleteId === client.id ? (
                    <div className="clients__confirm-delete">
                      <span>¿Eliminar?</span>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(client.id)}>
                        Sí
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                        No
                      </Button>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(client.id)}>
                      ✕
                    </Button>
                  )}
                </div>
              </div>

              <h3 className="clients__card-name">{client.name}</h3>

              <div className="clients__card-info">
                <div className="clients__card-field">
                  <span className="clients__card-icon">📞</span>
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="clients__card-field">
                    <span className="clients__card-icon">✉</span>
                    <span>{client.email}</span>
                  </div>
                )}
                {client.address && (
                  <div className="clients__card-field">
                    <span className="clients__card-icon">📍</span>
                    <span>{client.address}</span>
                  </div>
                )}
                {client.notes && (
                  <div className="clients__card-notes">
                    {client.notes}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ModalClient
        isOpen={modalOpen}
        onClose={handleCloseModal}
        client={selectedClient}
      />
    </div>
  );
};
