import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketRepository } from '@data/repositories/ticket.repository';
import { useToastStore } from '@/stores';
import { TicketState } from '@core/enums';

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketRepository.getAll(),
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => ticketRepository.getById(id),
    enabled: !!id,
  });
}

export function useTicketWithDetails(id: string) {
  return useQuery({
    queryKey: ['tickets', id, 'details'],
    queryFn: () => ticketRepository.getWithDetails(id),
    enabled: !!id,
  });
}

export function useTicketsByStatus(status: TicketState) {
  return useQuery({
    queryKey: ['tickets', 'status', status],
    queryFn: () => ticketRepository.getByStatus(status),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTicketsByUser(userId: string) {
  return useQuery({
    queryKey: ['tickets', 'user', userId],
    queryFn: () => ticketRepository.getByAssignedUser(userId),
    enabled: !!userId,
  });
}

export function useTicketsByClient(clientId: string) {
  return useQuery({
    queryKey: ['tickets', 'client', clientId],
    queryFn: () => ticketRepository.getByClient(clientId),
    enabled: !!clientId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof ticketRepository.create>[0]) => ticketRepository.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      showToast(`Ticket #${data.number} creado correctamente`);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error al crear ticket', 'error');
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ticketRepository.updateStatus(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', data.id, 'details'] });
      showToast('Estado del ticket actualizado');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error al actualizar estado', 'error');
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      ticketRepository.assign(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      showToast('Ticket asignado correctamente');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error al asignar ticket', 'error');
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => ticketRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Ticket eliminado correctamente');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Error al eliminar ticket',
        'error'
      );
    },
  });
}