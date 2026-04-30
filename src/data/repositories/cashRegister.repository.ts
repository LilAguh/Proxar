import { BaseRepository } from './base.repository';
import { CashRegister, CashRegisterPreview } from '@core/entities/CashRegister.entity';

export interface OpenCashRegisterPayload {
  entries: { accountId: string; openingAmount: number }[];
  notes?: string;
}

export interface CloseCashRegisterPayload {
  entries: { accountId: string; closingAmount: number }[];
  notes?: string;
}

class CashRegisterRepository extends BaseRepository {
  async getPreview(): Promise<CashRegisterPreview> {
    return this.get<CashRegisterPreview>('/cash-registers/preview');
  }

  async getToday(): Promise<CashRegister | null> {
    try {
      return await this.get<CashRegister>('/cash-registers/today');
    } catch (err: any) {
      if (err?.response?.status === 204) return null;
      throw err;
    }
  }

  async getHistory(page = 1, pageSize = 20): Promise<CashRegister[]> {
    return this.get<CashRegister[]>(`/cash-registers?page=${page}&pageSize=${pageSize}`);
  }

  async getById(id: string): Promise<CashRegister> {
    return this.get<CashRegister>(`/cash-registers/${id}`);
  }

  async open(payload: OpenCashRegisterPayload): Promise<CashRegister> {
    return this.post<CashRegister>('/cash-registers', payload);
  }

  async close(id: string, payload: CloseCashRegisterPayload): Promise<CashRegister> {
    return this.put<CashRegister>(`/cash-registers/${id}/close`, payload);
  }
}

export const cashRegisterRepository = new CashRegisterRepository();
