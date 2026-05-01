import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashRegisterRepository, type OpenCashRegisterPayload, type CloseCashRegisterPayload } from '@data/repositories/cashRegister.repository';
import { useToastStore } from '@/stores';
import { getErrorMessage } from '@core/utils/errorMessage';

const CASH_REGISTER_BASE = { refetchOnWindowFocus: false } as const;

export function useCashRegisterPreview() {
  return useQuery({
    queryKey: ['cash-registers', 'preview'],
    queryFn: () => cashRegisterRepository.getPreview(),
    staleTime: 2 * 60 * 1000,
    ...CASH_REGISTER_BASE,
  });
}

export function useTodayCashRegister() {
  return useQuery({
    queryKey: ['cash-registers', 'today'],
    queryFn: () => cashRegisterRepository.getToday(),
    staleTime: 2 * 60 * 1000,
    ...CASH_REGISTER_BASE,
  });
}

export function useCashRegisterHistory(page = 1) {
  return useQuery({
    queryKey: ['cash-registers', 'history', page],
    queryFn: () => cashRegisterRepository.getHistory(page),
    staleTime: 5 * 60 * 1000,
    ...CASH_REGISTER_BASE,
  });
}

export function useCashRegisterById(id: string | null) {
  return useQuery({
    queryKey: ['cash-registers', 'detail', id],
    queryFn: () => cashRegisterRepository.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...CASH_REGISTER_BASE,
  });
}

export function useOpenCashRegister() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (payload: OpenCashRegisterPayload) => cashRegisterRepository.open(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-registers', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers', 'preview'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers', 'history'] });
      showToast('Caja abierta correctamente');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al abrir la caja'), 'error');
    },
  });
}

export function useCloseCashRegister() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CloseCashRegisterPayload }) =>
      cashRegisterRepository.close(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-registers', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Caja cerrada correctamente');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al cerrar la caja'), 'error');
    },
  });
}
