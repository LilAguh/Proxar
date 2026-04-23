import { BaseRepository } from './base.repository';
import { Account } from '@core/entities/Account.entity';

class AccountRepository extends BaseRepository {
  async getAll(): Promise<Account[]> {
    return this.get<Account[]>('/accounts');
  }

  async getActive(): Promise<Account[]> {
    return this.get<Account[]>('/accounts/active');
  }

  async getById(id: string): Promise<Account> {
    return this.get<Account>(`/accounts/${id}`);
  }

  async create(data: Partial<Account>): Promise<Account> {
    return this.post<Account>('/accounts', data);
  }

  async update(id: string, data: Partial<Account>): Promise<Account> {
    return this.put<Account>(`/accounts/${id}`, data);
  }

  async remove(id: string): Promise<void> {
    return this.delete<void>(`/accounts/${id}`);
  }
}

export const accountRepository = new AccountRepository();