import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authRepository } from '@/data/repositories/auth.repository';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@/stores/useToastStore';
import { getErrorMessage } from '@core/utils/errorMessage';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authRepository.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken, data.expiresAt, data.refreshTokenExpiresAt);
      navigate('/');
      showToast('¡Bienvenido!', 'success');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al iniciar sesión'), 'error');
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  return () => {
    logout();
    navigate('/login');
    showToast('Sesión cerrada', 'info');
  };
}

export function useMe() {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: () => authRepository.getMe(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useChangePassword() {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authRepository.changePassword(data),
    onSuccess: () => {
      showToast('Contraseña actualizada correctamente', 'success');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al cambiar contraseña'), 'error');
    },
  });
}

// User management hooks (Admin only)
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => authRepository.getAllUsers(),
    staleTime: 30 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
      authRepository.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario creado correctamente', 'success');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al crear usuario'), 'error');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; email: string; role: string; active: boolean } }) =>
      authRepository.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario actualizado correctamente', 'success');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al actualizar usuario'), 'error');
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (userId: string) => authRepository.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario desactivado correctamente', 'success');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al desactivar usuario'), 'error');
    },
  });
}
