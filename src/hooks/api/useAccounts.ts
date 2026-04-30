import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountRepository } from '@data/repositories/account.repository';
import { useToastStore } from '@/stores';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountRepository.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveAccounts(enabled = true) {
  return useQuery({
    queryKey: ['accounts', 'active'],
    queryFn: () => accountRepository.getActive(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: any) => accountRepository.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showToast(`Cuenta ${data.name} creada correctamente`);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error al crear cuenta', 'error');
    },
  });
}