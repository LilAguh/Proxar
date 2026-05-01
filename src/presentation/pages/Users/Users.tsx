import { useState, useEffect } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser } from '@/hooks/api/useAuth';
import { Card, Button, Input, Select } from '@presentation/atoms';
import { Spinner, EmptyState, Modal } from '@presentation/molecules';
import { UserRole } from '@core/enums';
import { useConfirm } from '@/hooks/useConfirm';
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

// ─── Password requirements ────────────────────────────────────────────────────

const PASSWORD_REQUIREMENTS = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos una minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Al menos un número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Al menos un carácter especial', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

const PasswordChecklist = ({ password }: { password: string }) => (
  <ul className="users__password-checklist">
    {PASSWORD_REQUIREMENTS.map((req) => {
      const met = password.length > 0 && req.test(password);
      return (
        <li key={req.label} className={`users__password-req ${met ? 'users__password-req--met' : ''}`}>
          {met ? '✓' : '○'} {req.label}
        </li>
      );
    })}
  </ul>
);

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateName = (value: string): string => {
  if (!value) return 'El nombre es requerido';
  if (value.length < 3) return 'Mínimo 3 caracteres';
  if (value.length > 100) return 'Máximo 100 caracteres';
  return '';
};

const validateEmail = (value: string): string => {
  if (!value) return 'El email es requerido';
  if (!EMAIL_REGEX.test(value)) return 'Email inválido';
  return '';
};

const isPasswordValid = (password: string): boolean =>
  PASSWORD_REQUIREMENTS.every((req) => req.test(password));

// ─── Modal ────────────────────────────────────────────────────────────────────

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserModal = ({ isOpen, onClose, user }: UserModalProps) => {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.Operador as string,
    active: true,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [emailServerError, setEmailServerError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || UserRole.Operador,
        active: user?.active ?? true,
      });
      setTouched({});
      setEmailServerError('');
    }
  }, [user, isOpen]);

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleEmailChange = (value: string) => {
    setForm((prev) => ({ ...prev, email: value }));
    setEmailServerError('');
    if (touched.email) {
      // re-validate clears server error
    }
  };

  const nameError = touched.name ? validateName(form.name) : '';
  const emailError = emailServerError || (touched.email ? validateEmail(form.email) : '');
  const passwordInvalid = !user && form.password.length > 0 && !isPasswordValid(form.password);

  const validateAll = (): boolean => {
    setTouched({ name: true, email: true, password: true });
    const hasNameError = !!validateName(form.name);
    const hasEmailError = !!validateEmail(form.email);
    const hasPasswordError = !user && !isPasswordValid(form.password);
    return !hasNameError && !hasEmailError && !hasPasswordError;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;

    try {
      if (user) {
        await updateUser.mutateAsync({
          id: user.id,
          data: { name: form.name, email: form.email, role: form.role, active: form.active },
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
    } catch (error: any) {
      // Si el server rechaza el email por duplicado, mostrarlo en el campo
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409 && message) {
        setEmailServerError(message);
      }
    }
  };

  const isSubmitDisabled =
    createUser.isPending ||
    updateUser.isPending ||
    !!nameError ||
    !!emailError ||
    (!user && (!form.password || passwordInvalid));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Editar Usuario' : 'Nuevo Usuario'}
      isLoading={createUser.isPending || updateUser.isPending}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createUser.isPending || updateUser.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            loading={createUser.isPending || updateUser.isPending}
          >
            {user ? 'Guardar' : 'Crear'}
          </Button>
        </>
      }
    >
      <div className="users__modal-form">
        <Input
          label="Nombre"
          value={form.name}
          onChange={(v) => setForm((prev) => ({ ...prev, name: v }))}
          onBlur={() => handleBlur('name')}
          error={nameError}
          required
        />

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={handleEmailChange}
          onBlur={() => handleBlur('email')}
          error={emailError}
          required
        />

        {!user && (
          <div className="users__password-field">
            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(v) => setForm((prev) => ({ ...prev, password: v }))}
              onBlur={() => handleBlur('password')}
              required
            />
            <PasswordChecklist password={form.password} />
          </div>
        )}

        <Select
          label="Rol"
          value={form.role}
          onChange={(v) => setForm((prev) => ({ ...prev, role: v }))}
          options={[
            { value: UserRole.Admin, label: 'Admin' },
            { value: UserRole.Operador, label: 'Operador' },
            { value: UserRole.Visor, label: 'Visor' },
          ]}
        />

        {user && (
          <label className="users__checkbox-label">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
            />
            Usuario activo
          </label>
        )}
      </div>
    </Modal>
  );
};
