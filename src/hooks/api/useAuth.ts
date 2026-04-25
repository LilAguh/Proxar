import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authRepository } from '@data/repositories/auth.repository';
import { useAuthStore } from '@/stores';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@/stores';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof authRepository.login>[0]) => authRepository.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      showToast('Bienvenido!');
      navigate('/');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Email o contraseña incorrectos',
        'error'
      );
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    logout();
    queryClient.clear();
    navigate('/login');
  };
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authRepository.getMe(),
    enabled: isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useChangePassword() {
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: authRepository.changePassword,
    onSuccess: () => {
      showToast('Contraseña actualizada correctamente');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Error al cambiar contraseña',
        'error'
      );
    },
  });
}

// Admin only hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => authRepository.getAllUsers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: authRepository.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario creado correctamente');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Error al crear usuario',
        'error'
      );
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      authRepository.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario actualizado correctamente');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Error al actualizar usuario',
        'error'
      );
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: authRepository.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Usuario desactivado correctamente');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Error al desactivar usuario',
        'error'
      );
    },
  });
}