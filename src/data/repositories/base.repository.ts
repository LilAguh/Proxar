import { apiClient } from '../../core/config/api.config';
import { AxiosResponse } from 'axios';

export class BaseRepository {
  protected async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.get(url);
    return response.data;
  }

  protected async post<T, D = any>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.post(url, data);
    return response.data;
  }

  protected async put<T, D = any>(url: string, data?: D): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.put(url, data);
    return response.data;
  }

  protected async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await apiClient.delete(url);
    return response.data;
  }
}