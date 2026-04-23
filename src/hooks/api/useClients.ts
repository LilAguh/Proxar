import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRepository } from '@data/repositories/client.repository';
import { useToastStore } from '@/stores';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientRepository.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientRepository.getById(id),
    enabled: !!id,
  });
}

export function useSearchClients(name: string) {
  return useQuery({
    queryKey: ['clients', 'search', name],
    queryFn: () => clientRepository.searchByName(name),
    enabled: name.length >= 2,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: clientRepository.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast(`Cliente ${data.name} creado correctamente`);
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error al crear cliente', 'error');
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      clientRepository.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', data.id] });
      showToast('Cliente actualizado correctamente');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error al actualizar cliente', 'error');
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: clientRepository.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Cliente eliminado correctamente');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Error al eliminar cliente', 'error');
    },
  });
}