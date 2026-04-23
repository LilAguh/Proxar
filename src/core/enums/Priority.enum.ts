export enum Priority {
  Low = 'Baja',
  Medium = 'Intermedia',
  High = 'Alta',
  Urgent = 'Urgente',
}

export const PRIORITY_CONFIG = {
  [Priority.Urgent]: { label: 'Urgente', color: '#dc2626' },
  [Priority.High]: { label: 'Alta', color: '#f59e0b' },
  [Priority.Medium]: { label: 'Media', color: '#3b82f6' },
  [Priority.Low]: { label: 'Baja', color: '#9ca3af' },
};