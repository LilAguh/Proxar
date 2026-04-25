import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/api/useAuth';
import { Card, Button, Input, Select } from '@presentation/atoms';
import { Spinner, EmptyState, Modal } from '@presentation/molecules';
import { UserRole } from '@core/enums';
import './Users.scss';

export const Users = () => {
  const { data: users, isLoading } = useUsers();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="users-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return { bg: '#fef3c7', color: '#f59e0b' };
      case 'Operador':
        return { bg: '#e0f2fe', color: '#0ea5e9' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div className="users">
      <div className="users__header">
        <div>
          <h1 className="users__title">Usuarios</h1>
          <p className="users__subtitle">Gestión de accesos al sistema</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          + Nuevo Usuario
        </Button>
      </div>

      <Card className="users__list">
        {!users || users.length === 0 ? (
          <EmptyState icon="👥" title="No hay usuarios" />
        ) : (
          <div className="users__grid">
            {users.map((user) => {
              const roleColors = getRoleBadgeColor(user.role);
              return (
                <div key={user.id} className="users__card">
                  <div className="users__card-header">
                    <div className="users__card-info">
                      <h3 className="users__card-name">{user.name}</h3>
                      <p className="users__card-email">{user.email}</p>
                    </div>
                    <span
                      className="users__card-role"
                      style={{
                        backgroundColor: roleColors.bg,
                        color: roleColors.color,
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="users__card-footer">
                    <span className={`users__card-status ${user.active ? 'users__card-status--active' : 'users__card-status--inactive'}`}>
                      {user.active ? '● Activo' : '○ Inactivo'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                      Editar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <UserModal
        key={editingUser?.id || 'new'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editingUser}
      />
    </div>
  );
};

// Modal de Usuario
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserModal = ({ isOpen, onClose, user }: UserModalProps) => {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || UserRole.Operador,
    active: user?.active ?? true,
  });

  const handleSubmit = async () => {
    if (user) {
      await updateUser.mutateAsync({
        id: user.id,
        data: {
          name: form.name,
          email: form.email,
          role: form.role,
          active: form.active,
        },
      });
    } else {
      await createUser.mutateAsync({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
    }
    onClose();
  };

  const isValid = form.name && form.email && (user || form.password);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Editar Usuario' : 'Nuevo Usuario'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
            {user ? 'Guardar' : 'Crear'}
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
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          required
        />
        {!user && (
          <Input
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            required
          />
        )}
        <Select
          label="Rol"
          value={form.role}
          onChange={(v) => setForm({ ...form, role: v as UserRole })}
          options={[
            { value: UserRole.Admin, label: 'Admin' },
            { value: UserRole.Operador, label: 'Operador' },
            { value: UserRole.Visor, label: 'Visor' },
          ]}
        />
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <label>Usuario activo</label>
          </div>
        )}
      </div>
    </Modal>
  );
};