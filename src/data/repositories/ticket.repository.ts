import { BaseRepository } from './base.repository';
import { Ticket } from '@core/entities/Ticket.entity';
import { TicketState } from '@core/enums';

interface TicketDetail extends Ticket {
  history: any[];
  movements: any[];
}

class TicketRepository extends BaseRepository {
  async getAll(): Promise<Ticket[]> {
    return this.get<Ticket[]>('/tickets');
  }

  async getById(id: string): Promise<Ticket> {
    return this.get<Ticket>(`/tickets/${id}`);
  }

  async getWithDetails(id: string): Promise<TicketDetail> {
    return this.get<TicketDetail>(`/tickets/${id}/details`);
  }

  async getByStatus(status: TicketState): Promise<Ticket[]> {
    return this.get<Ticket[]>(`/tickets/status/${status}`);
  }

  async getByAssignedUser(userId: string): Promise<Ticket[]> {
    return this.get<Ticket[]>(`/tickets/assigned/${userId}`);
  }

  async getByClient(clientId: string): Promise<Ticket[]> {
    return this.get<Ticket[]>(`/tickets/client/${clientId}`);
  }

  async create(data: any): Promise<Ticket> {
    return this.post<Ticket>('/tickets', data);
  }

  async updateStatus(id: string, data: { newStatus: TicketState; comment?: string }): Promise<Ticket> {
    return this.put<Ticket>(`/tickets/${id}/status`, data);
  }

  async assign(id: string, userId: string): Promise<Ticket> {
    return this.put<Ticket>(`/tickets/${id}/assign`, { userId });
  }
}

export const ticketRepository = new TicketRepository();