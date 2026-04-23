import { BaseRepository } from './base.repository';
import { Ticket } from '@core/entities/Ticket.entity';
import { TicketState, TicketType, Priority } from '@core/enums';

interface TicketDetail extends Ticket {
  history: any[];
  movements: any[];
}

const TICKET_STATE_MAP: Record<number, TicketState> = {
  0: TicketState.Nuevo,
  1: TicketState.EnVisita,
  2: TicketState.Presupuestado,
  3: TicketState.Aprobado,
  4: TicketState.EnProceso,
  5: TicketState.Completado,
  6: TicketState.Descartado,
};

const TICKET_TYPE_MAP: Record<number, TicketType> = {
  0: TicketType.Measurement,
  1: TicketType.Repair,
  2: TicketType.Glass,
  3: TicketType.Window,
  4: TicketType.Construction,
  5: TicketType.Other,
};

const PRIORITY_MAP: Record<number, Priority> = {
  0: Priority.Low,
  1: Priority.Medium,
  2: Priority.High,
  3: Priority.Urgent,
};


function normalizeTicket(raw: any): Ticket {
  return {
    ...raw,
    status: typeof raw.status === 'number' ? TICKET_STATE_MAP[raw.status] ?? raw.status : raw.status,
    type: typeof raw.type === 'number' ? TICKET_TYPE_MAP[raw.type] ?? raw.type : raw.type,
    priority: typeof raw.priority === 'number' ? PRIORITY_MAP[raw.priority] ?? raw.priority : raw.priority,
  };
}

class TicketRepository extends BaseRepository {
  async getAll(): Promise<Ticket[]> {
    const raw = await this.get<any[]>('/tickets');
    return raw.map(normalizeTicket);
  }

  async getById(id: string): Promise<Ticket> {
    const raw = await this.get<any>(`/tickets/${id}`);
    return normalizeTicket(raw);
  }

  async getWithDetails(id: string): Promise<TicketDetail> {
    const raw = await this.get<any>(`/tickets/${id}/details`);
    return { ...normalizeTicket(raw), history: raw.history ?? [], movements: raw.movements ?? [] };
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

  async create(data: { clientId: string; type: TicketType; priority: Priority; title: string; description?: string; address?: string }): Promise<Ticket> {
    const raw = await this.post<any>('/tickets', data);
    return normalizeTicket(raw);
  }

  async updateStatus(id: string, data: { newStatus: TicketState; comment?: string }): Promise<Ticket> {
    const raw = await this.put<any>(`/tickets/${id}/status`, data);
    return normalizeTicket(raw);
  }

  async assign(id: string, userId: string): Promise<Ticket> {
    return this.put<Ticket>(`/tickets/${id}/assign`, { userId });
  }
}

export const ticketRepository = new TicketRepository();