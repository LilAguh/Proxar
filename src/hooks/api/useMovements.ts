import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movementRepository } from '@data/repositories/movement.repository';
import { useToastStore } from '@/stores';
import { getErrorMessage } from '@core/utils/errorMessage';
import { MovementType } from '@core/enums';

export function useMovementsPage(page: number, pageSize: number, type?: MovementType) {
  return useQuery({
    queryKey: ['movements', 'page', page, pageSize, type ?? 'all'],
    queryFn: () => movementRepository.getPaged(page, pageSize, type),
    staleTime: 1 * 60 * 1000,
  });
}

export function useMovementsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['movements', 'range', startDate, endDate],
    queryFn: () => movementRepository.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 1 * 60 * 1000,
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
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useRegisterMovement() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: any) => movementRepository.register(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      const sign = data.type === 'Ingreso' ? '+' : '-';
      showToast(`Movimiento registrado: ${sign}$${data.amount.toLocaleString('es-AR')}`);
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al registrar movimiento'), 'error');
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
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al eliminar movimiento'), 'error');
    },
  });
}
