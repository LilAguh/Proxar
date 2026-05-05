import { TicketType, Priority } from '@core/enums';

export interface CreateDirectBudgetRequest {
  // Cliente
  clientId: string;

  // Datos del ticket a crear
  ticketTitle: string;
  ticketDescription?: string;
  ticketType: TicketType;
  ticketPriority: Priority;

  // Datos del presupuesto
  validDays: number;
  discount: number;
  notes?: string;
  terms?: string;
  items: BudgetItemRequest[];
}

export interface BudgetItemRequest {
  quantity: number;
  description: string;
  unitPrice: number;
  ivaPercentage: number;
}
