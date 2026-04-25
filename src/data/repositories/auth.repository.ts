import { BaseRepository } from './base.repository';
import { User } from '@core/entities/User.entity';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserRequest {
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

class AuthRepository extends BaseRepository {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', data);
  }

  async getMe(): Promise<User> {
    return this.get<User>('/auth/me');
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.post<void>('/auth/change-password', data);
  }

  // Admin only
  async getAllUsers(): Promise<User[]> {
    return this.get<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async createUser(data: RegisterUserRequest): Promise<User> {
    return this.post<User>('/users', data);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return this.put<User>(`/users/${id}`, data);
  }

  async deactivateUser(id: string): Promise<void> {
    return this.apiDelete<void>(`/users/${id}`);
  }
}

export const authRepository = new AuthRepository();