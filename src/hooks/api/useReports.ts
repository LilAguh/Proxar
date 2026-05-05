import { useQuery } from '@tanstack/react-query';
import {
  reportRepository,
  type TicketsReportRequest,
  type MovementsReportRequest,
} from '@data/repositories/report.repository';

export function useTicketsReport(filters: TicketsReportRequest, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'tickets', filters],
    queryFn: () => reportRepository.getTicketsReport(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function useMovementsReport(filters: MovementsReportRequest, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'movements', filters],
    queryFn: () => reportRepository.getMovementsReport(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMetrics() {
  return useQuery({
    queryKey: ['reports', 'metrics'],
    queryFn: () => reportRepository.getMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
