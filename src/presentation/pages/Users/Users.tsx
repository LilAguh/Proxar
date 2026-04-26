import { useState, useEffect } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser } from '@/hooks/api/useAuth';
import { Card, Button, Input, Select } from '@presentation/atoms';
import { Spinner, EmptyState, Modal } from '@presentation/molecules';
import { UserRole } from '@core/enums';
import { useConfirm } from '@/hooks/api/useConfirm';
import { ConfirmDialog } from '@presentation/molecules';
import './Users.scss';

export const Users = () => {
  const { data: users, isLoading } = useUsers();
  const deactivateUser = useDeactivateUser();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { isOpen, options, confirm, handleConfirm, handleCancel } = useConfirm();

  if (isLoading) {
    return (
      <div className="users-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleDeactivate = async (user: any) => {
    const confirmed = await confirm({
      title: 'Desactivar Usuario',
      message: `¿Estás seguro que querés desactivar a ${user.name}? El usuario no podrá acceder al sistema.`,
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (confirmed) {
      await deactivateUser.mutateAsync(user.id);
    }
  };

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
                    <Button
  variant="warning"
  size="sm"
  onClick={() => handleDeactivate(user)}
  disabled={!user.active}
>
  {user.active ? 'Desactivar' : 'Inactivo'}
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

      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={deactivateUser.isPending}
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

  // Resetear formulario cuando cambia el user o se abre el modal
  useEffect(() => {
    if (isOpen) {
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || UserRole.Operador,
        active: user?.active ?? true,
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async () => {
    try {
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
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const validateName = (name: string): string => {
    if (!name) return 'El nombre es requerido';
    if (name.length < 3) return 'Mínimo 3 caracteres';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email) return 'El email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Debe tener al menos una mayúscula';
    if (!/[0-9]/.test(password)) return 'Debe tener al menos un número';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Debe tener al menos un carácter especial';
    return '';
  };

  const nameError = form.name ? validateName(form.name) : '';
  const emailError = form.email ? validateEmail(form.email) : '';
  const passwordError = !user && form.password ? validatePassword(form.password) : '';
  const isValid = form.name && !nameError && form.email && !emailError && (user || (form.password && !passwordError));

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
          error={nameError}
          hint="Mínimo 3 caracteres"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          error={emailError}
          required
        />
        {!user && (
          <Input
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            error={passwordError}
            hint="8+ caracteres, mayúscula, número y carácter especial"
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