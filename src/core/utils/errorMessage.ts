/**
 * Extrae un mensaje de error legible para el usuario a partir de cualquier error de axios.
 * Cubre: errores de red (offline), 4xx con mensaje del backend, 5xx genéricos.
 */
export const getErrorMessage = (error: unknown, fallback = 'Ocurrió un error inesperado'): string => {
  if (!error || typeof error !== 'object') return fallback;

  const err = error as any;

  // Sin respuesta del servidor → error de red / offline
  if (!err.response) {
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
      return 'Sin conexión. Verificá tu conexión a internet e intentá nuevamente.';
    }
    if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      return 'La solicitud tardó demasiado. Verificá tu conexión e intentá nuevamente.';
    }
    return 'No se pudo conectar con el servidor. Verificá tu conexión e intentá nuevamente.';
  }

  const status: number = err.response.status;
  const data = err.response.data;

  // 5xx → error del servidor, no exponer detalles
  if (status >= 500) {
    return 'Error interno del servidor. Intentá nuevamente en unos momentos.';
  }

  // 4xx → usar el mensaje del backend si existe
  if (data?.message) return data.message;

  // Errores de validación con array de errores
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0];
  }

  // Fallback por código HTTP
  switch (status) {
    case 400: return 'Los datos enviados no son válidos.';
    case 401: return 'Sesión expirada. Volvé a iniciar sesión.';
    case 403: return 'No tenés permisos para realizar esta acción.';
    case 404: return 'El recurso solicitado no existe.';
    case 409: return 'Ya existe un registro con esos datos.';
    case 422: return 'Los datos enviados no son válidos.';
    case 429: return 'Demasiadas solicitudes. Esperá un momento e intentá nuevamente.';
    default:  return fallback;
  }
};

/** Detecta si un error es recuperable (vale la pena reintentar) */
export const isRetryableError = (error: unknown): boolean => {
  const err = error as any;
  // Sin respuesta → error de red → reintentable
  if (!err?.response) return true;
  // 5xx → reintentable
  if (err.response.status >= 500) return true;
  // 4xx → no reintentable (el cliente envió datos incorrectos)
  return false;
};
