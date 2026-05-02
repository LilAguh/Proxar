import { SubscriptionPlan, SubscriptionStatus } from '@core/enums';

export interface Subscription {
  id: string;
  companyId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyFee: number;
  isOnTrial: boolean;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  cancellationEffectiveDate?: string;
  mercadoPagoPreapprovalId?: string;
  mercadoPagoCustomerId?: string;
  mercadoPagoCardToken?: string;
  lastFourDigits?: string;
  cardBrand?: string;
  cardHolderName?: string;
  failedPaymentAttempts: number;
  lastPaymentAttemptAt?: string;
  lastSuccessfulPaymentAt?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
