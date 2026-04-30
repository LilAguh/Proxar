import { CashRegisterStatus } from '@core/enums';
import { BoxMovement } from './BoxMovement.entity';

export interface CashRegisterEntry {
  accountId: string;
  accountName: string;
  openingAmount: number;
  closingAmount?: number;
}

export interface Discrepancy {
  accountId: string;
  accountName: string;
  previousClosingAmount: number;
  currentOpeningAmount: number;
  difference: number;
}

export interface CashRegister {
  id: string;
  date: string;
  status: CashRegisterStatus;
  openedAt: string;
  openedByName: string;
  closedAt?: string;
  closedByName?: string;
  notes?: string;
  entries: CashRegisterEntry[];
  discrepancies: Discrepancy[];
  movements: BoxMovement[];
}

export interface AccountOpeningPreview {
  accountId: string;
  accountName: string;
  suggestedAmount?: number;
}

export interface CashRegisterPreview {
  alreadyOpenToday: boolean;
  accounts: AccountOpeningPreview[];
  discrepancies: Discrepancy[];
}
