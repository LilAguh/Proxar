import { MovementType, PaymentMethod } from '../enums';
import { Account } from './Account.entity';
import { User } from './User.entity';

export interface BoxMovement {
  id: string;
  number: number;
  account: Account;
  ticketNumber?: number;
  user: User;
  type: MovementType;
  amount: number;
  method: PaymentMethod;
  concept: string;
  voucherNumber?: string;
  observations?: string;
  movementDate: string;
  registeredAt: string;
}