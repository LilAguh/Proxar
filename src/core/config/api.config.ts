import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5109/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Response interceptor — detecta 401 y errores de red
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('proxar-auth');
    }

    // Si no hay respuesta, es un error de red — normalizamos el código
    if (!error.response && !error.code) {
      error.code = 'ERR_NETWORK';
    }

    return Promise.reject(error);
  }
);
