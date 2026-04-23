import { useQuery } from '@tanstack/react-query';
import { dashboardRepository } from '@data/repositories/dashboard.repository';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardRepository.getSummary(),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000,
  });
}

export function useTicketsByStatusChart() {
  return useQuery({
    queryKey: ['dashboard', 'tickets-by-status'],
    queryFn: () => dashboardRepository.getTicketsByStatus(),
    staleTime: 1 * 60 * 1000,
  });
}