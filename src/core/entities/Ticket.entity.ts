import { TicketType, TicketState, Priority } from '@core/enums';
import { Client } from './Client.entity';
import { User } from './User.entity';

export interface Ticket {
  id: string;
  companyId: string;
  number: number;
  clientId: string;
  client: Client;
  createdById: string;
  createdBy: User;
  assignedToId?: string;
  assignedTo?: User;
  type: TicketType;
  status: TicketState;
  priority: Priority;
  title: string;
  description?: string;
  address?: string;
  active: boolean;
  createdAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
}