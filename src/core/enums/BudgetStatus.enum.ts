export enum BudgetStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Viewed = 'Viewed',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Expired = 'Expired',
}

export const BUDGET_STATUS_CONFIG = {
  [BudgetStatus.Draft]: { label: 'Borrador', color: '#6b7280', bg: '#f3f4f6' },
  [BudgetStatus.Sent]: { label: 'Enviado', color: '#0ea5e9', bg: '#e0f2fe' },
  [BudgetStatus.Viewed]: { label: 'Visto', color: '#8b5cf6', bg: '#f5f3ff' },
  [BudgetStatus.Approved]: { label: 'Aprobado', color: '#22c55e', bg: '#dcfce7' },
  [BudgetStatus.Rejected]: { label: 'Rechazado', color: '#ef4444', bg: '#fee2e2' },
  [BudgetStatus.Expired]: { label: 'Expirado', color: '#f59e0b', bg: '#fef3c7' },
};
