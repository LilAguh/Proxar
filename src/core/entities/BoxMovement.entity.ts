import { MovementType, PaymentMethod } from '@core/enums';
import { Account } from './Account.entity';
import { Ticket } from './Ticket.entity';
import { User } from './User.entity';

export interface BoxMovement {
  id: string;
  companyId: string;
  number: number;
  accountId: string;
  account: Account;
  ticketId?: string;
  ticket?: Ticket;
  userId: string;
  user: User;
  type: MovementType;
  amount: number;
  method: PaymentMethod;
  concept: string;
  voucherNumber?: string;
  observations?: string;
  active: boolean;
  movementDate: string;
  registeredAt: string;
}