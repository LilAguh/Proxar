import { useState, useEffect } from 'react';
import { useClients, useSearchClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/api';
import { Card, Button, Input, Textarea, Skeleton } from '@presentation/atoms';
import { EmptyState, Modal, ConfirmDialog } from '@presentation/molecules';
import { Client } from '@core/entities/Client.entity';
import { useConfirm } from '@/hooks/useConfirm';
import './Clients.scss';

export const Clients = () => {
  const { data: allClients, isLoading: isLoadingClients } = useClients();
  // const createClient = useCreateClient();
  // const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();
  const hasSearch = search.trim().length >= 2;
  const { data: searchedClients, isLoading: isLoadingSearch } = useSearchClients(search);
  const clients = hasSearch ? searchedClients : allClients;

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

  if (isLoadingClients) {
    return (
      <div className="clients">
        <div className="clients__header">
          <div>
            <Skeleton width={120} height={34} />
            <Skeleton width={200} height={18} />
          </div>
          <Skeleton width={160} height={40} borderRadius={8} />
        </div>
        <Card className="clients__search">
          <Skeleton width="100%" height={42} borderRadius={8} />
        </Card>
        <div className="clients__grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="clients__card">
              <Skeleton width="70%" height={22} />
              <Skeleton width="90%" height={16} />
              <Skeleton width="80%" height={16} />
              <Skeleton width="95%" height={16} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Skeleton width={80} height={32} borderRadius={8} />
                <Skeleton width={80} height={32} borderRadius={8} />
              </div>
            </Card>
          ))}
        </div>
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
          placeholder="Buscar por nombre..."
          value={search}
          onChange={setSearch}
          fullWidth
        />
      </Card>

      <div className="clients__list">
        {hasSearch && isLoadingSearch && !searchedClients ? (
          <div className="clients__grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="clients__card">
                <Skeleton width="70%" height={22} />
                <Skeleton width="90%" height={16} />
                <Skeleton width="80%" height={16} />
              </Card>
            ))}
          </div>
        ) : !clients || clients.length === 0 ? (
          <EmptyState
            icon="◉"
            title="No hay clientes"
            description={hasSearch ? 'No se encontraron resultados' : 'Creá tu primer cliente'}
            action={
              !hasSearch ? (
                <Button variant="primary" onClick={handleCreate}>
                  + Nuevo Cliente
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="clients__grid">
            {clients.map((client) => (
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
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    email: false,
  });

  // Resetear formulario cuando cambia el modal
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: client?.name || '',
        phone: client?.phone || '',
        email: client?.email || '',
        address: client?.address || '',
        notes: client?.notes || '',
      });
      setErrors({ name: '', phone: '', email: '' });
      setTouched({ name: false, phone: false, email: false });
    }
  }, [client, isOpen]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value) return 'El nombre es requerido';
        return '';

      case 'phone':
        if (!value) return 'El teléfono es requerido';
        const phoneDigits = value.replace(/\D/g, '');
        if (phoneDigits.length < 8) return 'Mínimo 8 dígitos';
        return '';

      case 'email':
        if (!value) return ''; // Email es opcional
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });

    // Validar solo si el campo ya fue tocado
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value);
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, form[field as keyof typeof form]);
    setErrors({ ...errors, [field]: error });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: validateField('name', form.name),
      phone: validateField('phone', form.phone),
      email: validateField('email', form.email),
    };

    setErrors(newErrors);
    setTouched({ name: true, phone: true, email: true });

    return !newErrors.name && !newErrors.phone && !newErrors.email;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (client) {
        await updateClient.mutateAsync({ id: client.id, data: form });
      } else {
        await createClient.mutateAsync(form);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  const isValid = form.name && form.phone && !errors.name && !errors.phone && !errors.email;

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
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || createClient.isPending || updateClient.isPending}
          >
            {createClient.isPending || updateClient.isPending ? 'Guardando...' : (client ? 'Guardar' : 'Crear')}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Nombre"
          value={form.name}
          onChange={(v) => handleChange('name', v)}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : ''}
          required
        />
        <Input
          label="Teléfono"
          type="tel"
          value={form.phone}
          onChange={(v) => handleChange('phone', v)}
          onBlur={() => handleBlur('phone')}
          error={touched.phone ? errors.phone : ''}
          hint="Mínimo 8 dígitos"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => handleChange('email', v)}
          onBlur={() => handleBlur('email')}
          error={touched.email ? errors.email : ''}
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
