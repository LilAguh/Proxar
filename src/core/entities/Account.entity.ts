import { AccountType } from '@core/enums';

export interface Account {
  id: string;
  companyId: string;
  name: string;
  type: AccountType;
  currentBalance: number;
  active: boolean;
  createdAt: string;
  modifiedAt: string;
}