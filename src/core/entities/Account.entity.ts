import { AccountType } from '../enums';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currentBalance: number;
  active: boolean;
  createdAt: string;
}