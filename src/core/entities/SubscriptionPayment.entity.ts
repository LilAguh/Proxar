import { PaymentStatus } from '@core/enums';

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  companyId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  periodStart: string;
  periodEnd: string;
  mercadoPagoPaymentId?: string;
  mercadoPagoStatus?: string;
  mercadoPagoStatusDetail?: string;
  gatewayResponse?: string;
  failureReason?: string;
  attemptedAt: string;
  completedAt?: string;
  createdAt: string;
}
