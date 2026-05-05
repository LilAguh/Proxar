import { BaseRepository } from './base.repository';

interface TicketsReportRequest {
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  state?: string;
  type?: string;
  priority?: string;
  assignedToId?: string;
  createdById?: string;
}

interface MovementsReportRequest {
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  ticketId?: string;
  type?: string;
  paymentMethod?: string;
}

interface TicketsReportSummary {
  total: number;
  byStateNew: number;
  byStateInVisit: number;
  byStateBudgeted: number;
  byStateApproved: number;
  byStateInProcess: number;
  byStateCompleted: number;
  byStateDiscarded: number;
  byTypeRepair: number;
  byTypeMeasurement: number;
  byTypeGlass: number;
  byTypeWindow: number;
  byTypeConstruction: number;
  byTypeOther: number;
  byPriorityLow: number;
  byPriorityMedium: number;
  byPriorityHigh: number;
  byPriorityUrgent: number;
  averageDaysToComplete: number;
  conversionRate: number;
}

interface TicketsReportResponse {
  tickets: any[];
  summary: TicketsReportSummary;
}

interface AccountSummary {
  accountId: string;
  accountName: string;
  income: number;
  expense: number;
  net: number;
}

interface PaymentMethodSummary {
  method: string;
  income: number;
  expense: number;
  count: number;
}

interface MovementsReportSummary {
  total: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  byAccount: AccountSummary[];
  byPaymentMethod: PaymentMethodSummary[];
}

interface MovementsReportResponse {
  movements: any[];
  summary: MovementsReportSummary;
}

interface MetricsResponse {
  totalTickets: number;
  openTickets: number;
  completedTickets: number;
  discardedTickets: number;
  conversionRate: number;
  averageDaysToComplete: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthNet: number;
  previousMonthIncome: number;
  incomeGrowth: number;
  totalBalance: number;
  totalClients: number;
  activeClients: number;
}

class ReportRepository extends BaseRepository {
  async getTicketsReport(filters: TicketsReportRequest): Promise<TicketsReportResponse> {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.state) params.append('state', filters.state);
    if (filters.type) params.append('type', filters.type);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedToId) params.append('assignedToId', filters.assignedToId);
    if (filters.createdById) params.append('createdById', filters.createdById);

    return this.get<TicketsReportResponse>(`/reports/tickets?${params.toString()}`);
  }

  async getMovementsReport(filters: MovementsReportRequest): Promise<MovementsReportResponse> {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.accountId) params.append('accountId', filters.accountId);
    if (filters.ticketId) params.append('ticketId', filters.ticketId);
    if (filters.type) params.append('type', filters.type);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);

    return this.get<MovementsReportResponse>(`/reports/movements?${params.toString()}`);
  }

  async getMetrics(): Promise<MetricsResponse> {
    return this.get<MetricsResponse>('/reports/metrics');
  }
}

export const reportRepository = new ReportRepository();
export type {
  TicketsReportRequest,
  MovementsReportRequest,
  TicketsReportResponse,
  MovementsReportResponse,
  MetricsResponse,
  TicketsReportSummary,
  MovementsReportSummary,
  AccountSummary,
  PaymentMethodSummary,
};
