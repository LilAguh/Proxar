import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientRepository } from '@data/repositories/client.repository';
import { useToastStore } from '@/stores';
import { getErrorMessage } from '@core/utils/errorMessage';

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientRepository.getAll(),
    staleTime: 10 * 60 * 1000,
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
  const [debouncedName, setDebouncedName] = useState(name);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedName(name.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [name]);

  return useQuery({
    queryKey: ['clients', 'search', debouncedName],
    queryFn: () => clientRepository.searchByName(debouncedName),
    enabled: debouncedName.length >= 2,
    staleTime: 60 * 1000,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (data: Parameters<typeof clientRepository.create>[0]) => clientRepository.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast(`Cliente ${data.name} creado correctamente`);
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al crear cliente'), 'error');
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
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al actualizar cliente'), 'error');
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => clientRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Cliente eliminado correctamente');
    },
    onError: (error: unknown) => {
      showToast(getErrorMessage(error, 'Error al eliminar cliente'), 'error');
    },
  });
}
