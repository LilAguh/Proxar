import { BaseRepository } from './base.repository';
import { Subscription } from '@core/entities/Subscription.entity';
import { SubscriptionPayment } from '@core/entities/SubscriptionPayment.entity';

class SubscriptionRepository extends BaseRepository {
  async getAll(): Promise<Subscription[]> {
    return this.get<Subscription[]>('/subscriptions');
  }

  async getById(id: string): Promise<Subscription> {
    return this.get<Subscription>(`/subscriptions/${id}`);
  }

  async create(data: Partial<Subscription>): Promise<Subscription> {
    return this.post<Subscription>('/subscriptions', data);
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription> {
    return this.put<Subscription>(`/subscriptions/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return this.apiDelete<void>(`/subscriptions/${id}`);
  }

  async getPayments(subscriptionId: string): Promise<SubscriptionPayment[]> {
    return this.get<SubscriptionPayment[]>(`/subscriptions/${subscriptionId}/payments`);
  }
}

export const subscriptionRepository = new SubscriptionRepository();
