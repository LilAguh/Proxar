import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movementRepository } from '@data/repositories/movement.repository';
import { useToastStore } from '@/stores';

export function useMovements() {
  return useQuery({
    queryKey: ['movements'],
    queryFn: () => movementRepository.getAll(),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

export function useMovementsByAccount(accountId: string) {
  return useQuery({
    queryKey: ['movements', 'account', accountId],
    queryFn: () => movementRepository.getByAccount(accountId),
    enabled: !!accountId,
  });
}

export function useMovementsByTicket(ticketId: string) {
  return useQuery({
    queryKey: ['movements', 'ticket', ticketId],
    queryFn: () => movementRepository.getByTicket(ticketId),
    enabled: !!ticketId,
  });
}

export function useAccountBalances() {
  return useQuery({
    queryKey: ['movements', 'balances'],
    queryFn: () => movementRepository.getBalances(),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refetch cada 30s
  });
}

export function useRegisterMovement() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: movementRepository.register,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      const sign = data.type === 'Ingreso' ? '+' : '-';
      showToast(`Movimiento registrado: ${sign}$${data.amount.toLocaleString('es-AR')}`);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error al registrar movimiento', 'error');
    },
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => movementRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Movimiento eliminado y saldo revertido correctamente');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Error al eliminar movimiento',
        'error'
      );
    },
  });
}