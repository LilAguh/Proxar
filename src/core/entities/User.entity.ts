import { UserRole } from '@core/enums';

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
  modifiedAt?: string;
}