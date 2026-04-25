export interface Client {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  modifiedAt: string;
}