import { BaseRepository } from './base.repository';
import { BoxMovement } from '@core/entities/BoxMovement.entity';

class MovementRepository extends BaseRepository {
  async getAll(): Promise<BoxMovement[]> {
    return this.get<BoxMovement[]>('/movements');
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
    return this.get<BoxMovement[]>(`/movements/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getBalances(): Promise<Record<string, number>> {
    return this.get<Record<string, number>>('/movements/balances');
  }

  async register(data: any): Promise<BoxMovement> {
    return this.post<BoxMovement>('/movements', data);
  }
}

export const movementRepository = new MovementRepository();