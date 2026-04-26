import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5109/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Leer token desde Zustand persist storage
    const authStorage = localStorage.getItem('proxar-auth');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state?.token;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Agregar headers multi-tenant desde el usuario logueado
        const userId = state?.user?.id;
        const companyId = state?.user?.companyId;

        if (userId) {
          config.headers['X-User-Id'] = userId;
        }
        if (companyId) {
          config.headers['X-Company-Id'] = companyId;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo limpiar storage, NO hacer redirect (dejamos que ProtectedRoute maneje eso)
      localStorage.removeItem('proxar-auth');
    }
    return Promise.reject(error);
  }
);
