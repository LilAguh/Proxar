import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetRepository } from '@data/repositories/budget.repository';
import { useToastStore } from '@/stores';
import { BudgetStatus } from '@core/enums';
import { getErrorMessage } from '@core/utils/errorMessage';

export function useBudgets(page: number = 1, pageSize: number = 50) {
  return useQuery({
    queryKey: ['budgets', page, pageSize],
    queryFn: () => budgetRepository.getAll(page, pageSize),
    staleTime: 3 * 60 * 1000,
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: () => budgetRepository.getById(id),
    enabled: !!id,
  });
}

export function useBudgetsByTicket(ticketId: string) {
  return useQuery({
    queryKey: ['budgets', 'ticket', ticketId],
    queryFn: () => budgetRepository.getByTicketId(ticketId),
    enabled: !!ticketId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof budgetRepository.create>[0]) =>
      budgetRepository.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      showToast(`Presupuesto #${data.number} creado correctamente`);
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al crear presupuesto'), 'error');
    },
  });
}

export function useCreateDirectBudget() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof budgetRepository.createDirect>[0]) =>
      budgetRepository.createDirect(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      showToast(`Presupuesto #${data.number} creado correctamente`);
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al crear presupuesto'), 'error');
    },
  });
}

export function useUpdateBudgetStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BudgetStatus }) =>
      budgetRepository.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', data.id] });
      showToast('Estado del presupuesto actualizado');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al actualizar estado'), 'error');
    },
  });
}
