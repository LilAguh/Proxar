import { TicketState, TicketType, Priority } from '../enums';
import { Client } from './Client.entity';
import { User } from './User.entity';

export interface Ticket {
  id: string;
  number: number;
  client: Client;
  createdBy: User;
  assignedTo?: User;
  type: TicketType;
  status: TicketState;
  priority: Priority;
  title: string;
  description?: string;
  address?: string;
  createdAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
}