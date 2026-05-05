import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5109/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Control de refresh en progreso (evitar múltiples refreshes simultáneos)
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

// Request interceptor — agrega auth token y headers multi-tenant
apiClient.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('proxar-auth');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (state?.user?.id) {
          config.headers['X-User-Id'] = state.user.id;
        }
        if (state?.user?.companyId) {
          config.headers['X-Company-Id'] = state.user.companyId;
        }
      } catch {
        // Si el storage está corrupto no bloqueamos el request
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — maneja 401 con refresh automático
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Si no hay respuesta, es un error de red — normalizamos el código
    if (!error.response && !error.code) {
      error.code = 'ERR_NETWORK';
    }

    // Si 401 y no es retry, intentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Evitar refresh en endpoints de auth
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        localStorage.removeItem('proxar-auth');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Obtener refreshToken del storage
      const authStorage = localStorage.getItem('proxar-auth');
      if (!authStorage) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      const { state } = JSON.parse(authStorage);
      const refreshToken = state?.refreshToken;

      if (!refreshToken) {
        localStorage.removeItem('proxar-auth');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Si ya hay un refresh en progreso, encolar este request
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((newToken: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      // Marcar como retry y comenzar refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Llamar al endpoint de refresh
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { token, refreshToken: newRefreshToken, user, expiresAt, refreshTokenExpiresAt } = response.data;

        // Actualizar storage
        const updatedAuth = {
          state: {
            user,
            token,
            refreshToken: newRefreshToken,
            expiresAt,
            refreshTokenExpiresAt,
            _hasHydrated: true,
          },
          version: 0,
        };
        localStorage.setItem('proxar-auth', JSON.stringify(updatedAuth));

        // Actualizar Zustand store para que isAuthenticated() vea el nuevo token
        useAuthStore.getState().setAuth(user, token, newRefreshToken, expiresAt, refreshTokenExpiresAt);

        // Actualizar header del request original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        // Procesar cola de requests pendientes
        refreshQueue.forEach((callback) => callback(token));
        refreshQueue = [];

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si refresh falla, limpiar y redirigir
        localStorage.removeItem('proxar-auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
