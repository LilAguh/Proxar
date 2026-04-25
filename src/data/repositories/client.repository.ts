import { BaseRepository } from './base.repository';
import { Client } from '@core/entities/Client.entity';

class ClientRepository extends BaseRepository {
  async getAll(): Promise<Client[]> {
    return this.get<Client[]>('/clients');
  }

  async getById(id: string): Promise<Client> {
    return this.get<Client>(`/clients/${id}`);
  }

  async searchByName(name: string): Promise<Client[]> {
    return this.get<Client[]>(`/clients/search?name=${name}`);
  }

  async create(data: Partial<Client>): Promise<Client> {
    return this.post<Client>('/clients', data);
  }

  async update(id: string, data: Partial<Client>): Promise<Client> {
    return this.put<Client>(`/clients/${id}`, data);
  }

  // async remove(id: string): Promise<void> {
  //   return this.delete<void>(`/clients/${id}`);
  // }

  async delete(id: string): Promise<void> {
    return this.apiDelete<void>(`/clients/${id}`);
  }
}

export const clientRepository = new ClientRepository();