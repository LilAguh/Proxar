import { BaseRepository } from './base.repository';

interface DashboardSummary {
  tickets: {
    total: number;
    new: number;
    inProgress: number;
    completed: number;
  };
  cashToday: {
    income: number;
    expense: number;
    net: number;
  };
  accountBalances: Record<string, number>;
  totalBalance: number;
}

class DashboardRepository extends BaseRepository {
  async getSummary(): Promise<DashboardSummary> {
    return this.get<DashboardSummary>('/dashboard/summary');
  }

  async getTicketsByStatus(): Promise<Record<string, number>> {
    return this.get<Record<string, number>>('/dashboard/tickets-by-status');
  }
}

export const dashboardRepository = new DashboardRepository();