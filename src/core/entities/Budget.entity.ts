import { BudgetStatus } from '@core/enums';

export interface BudgetItem {
  id: string;
  budgetId: string;
  quantity: number;
  description: string;
  unitPrice: number;
  ivaPercentage: number;
  subtotal: number;
  ivaAmount: number;
  total: number;
}

export interface Budget {
  id: string;
  companyId: string;
  number: number;
  ticketId: string;
  ticketNumber: number;
  clientId: string;

  // Snapshot del cliente
  clientName: string;
  clientPhone: string;
  clientCUIT?: string;
  clientEmail?: string;
  clientAddress?: string;

  // Items
  items: BudgetItem[];

  // Totales
  subtotal: number;
  ivaAmount: number;
  total: number;
  discount: number;

  // Validez
  validDays: number;
  validUntil: string;

  // Estado
  status: BudgetStatus;

  // PDF
  pdfUrl?: string;

  // Metadata
  createdAt: string;
  modifiedAt: string;
  createdByName: string;
}
