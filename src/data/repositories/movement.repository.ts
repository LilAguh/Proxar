import { BaseRepository } from './base.repository';
import { BoxMovement } from '@core/entities/BoxMovement.entity';
import { MovementType } from '@core/enums';
import { PagedResult } from '@core/types/PagedResult';

class MovementRepository extends BaseRepository {
  async getPaged(page: number, pageSize: number, type?: MovementType): Promise<PagedResult<BoxMovement>> {
    const typeQuery = type ? `&type=${encodeURIComponent(type)}` : '';
    return this.get<PagedResult<BoxMovement>>(`/movements?page=${page}&pageSize=${pageSize}${typeQuery}`);
  }

  async getById(id: string): Promise<BoxMovement> {
    return this.get<BoxMovement>(`/movements/${id}`);
  }

  async getByAccount(accountId: string): Promise<BoxMovement[]> {
    return this.get<BoxMovement[]>(`/movements/account/${accountId}`);
  }

  async getByTicket(ticketId: string): Promise<BoxMovement[]> {
    return this.get<BoxMovement[]>(`/movements/ticket/${ticketId}`);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<BoxMovement[]> {
    return this.get<BoxMovement[]>(
      `/movements/date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
  }

  async getBalances(): Promise<Record<string, number>> {
    return this.get<Record<string, number>>('/movements/balances');
  }

  async register(data: any): Promise<BoxMovement> {
    return this.post<BoxMovement>('/movements', data);
  }

  async delete(id: string): Promise<void> {
    return this.apiDelete<void>(`/movements/${id}`);
  }
}

export const movementRepository = new MovementRepository();
