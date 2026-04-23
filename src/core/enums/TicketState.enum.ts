export enum TicketState {
  Nuevo = 'Nuevo',
  EnVisita = 'EnVisita',
  Presupuestado = 'Presupuestado',
  Aprobado = 'Aprobado',
  EnProceso = 'EnProceso',
  Completado = 'Completado',
  Descartado = 'Descartado',
}

export const TICKET_STATE_CONFIG = {
  [TicketState.Nuevo]: { label: 'Nuevo', color: '#6366f1', bg: '#eef2ff' },
  [TicketState.EnVisita]: { label: 'En Visita', color: '#8b5cf6', bg: '#f5f3ff' },
  [TicketState.Presupuestado]: { label: 'Presupuestado', color: '#0ea5e9', bg: '#e0f2fe' },
  [TicketState.Aprobado]: { label: 'Aprobado', color: '#10b981', bg: '#d1fae5' },
  [TicketState.EnProceso]: { label: 'En Proceso', color: '#f59e0b', bg: '#fef3c7' },
  [TicketState.Completado]: { label: 'Completado', color: '#22c55e', bg: '#dcfce7' },
  [TicketState.Descartado]: { label: 'Descartado', color: '#6b7280', bg: '#f3f4f6' },
};