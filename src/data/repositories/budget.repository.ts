import { BaseRepository } from './base.repository';
import { Budget } from '@core/entities/Budget.entity';
import { CreateDirectBudgetRequest } from '@core/entities/DirectBudget.entity';
import { BudgetStatus } from '@core/enums';
import { API_URL } from '@core/config/api.config';

interface CreateBudgetItemRequest {
  quantity: number;
  description: string;
  unitPrice: number;
  ivaPercentage: number;
}

interface CreateBudgetRequest {
  ticketId: string;
  validDays?: number;
  discount?: number;
  items: CreateBudgetItemRequest[];
}

class BudgetRepository extends BaseRepository {
  async getAll(page: number = 1, pageSize: number = 50): Promise<Budget[]> {
    return this.get<Budget[]>(`/budgets?page=${page}&pageSize=${pageSize}`);
  }

  async getById(id: string): Promise<Budget> {
    return this.get<Budget>(`/budgets/${id}`);
  }

  async getByTicketId(ticketId: string): Promise<Budget[]> {
    return this.get<Budget[]>(`/budgets/ticket/${ticketId}`);
  }

  async create(data: CreateBudgetRequest): Promise<Budget> {
    return this.post<Budget>('/budgets', data);
  }

  async createDirect(data: CreateDirectBudgetRequest): Promise<Budget> {
    return this.post<Budget>('/budgets/direct', data);
  }

  async updateStatus(id: string, status: BudgetStatus): Promise<Budget> {
    return this.patch<Budget>(`/budgets/${id}/status`, { status });
  }

  getPdfUrl(id: string): string {
    return `${API_URL}/budgets/${id}/pdf`;
  }
}

export const budgetRepository = new BudgetRepository();
