/**
 * Extrae el mensaje de error de una respuesta de API.
 * Funciona con errores de axios y otros tipos de errores.
 */
export const getApiErrorMessage = (error: any, fallback = 'Ocurrió un error inesperado'): string => {
  // Estructura de error de axios: error.response.data.message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Otros casos comunes
  if (error?.message) {
    return error.message;
  }

  // Si es un string directamente
  if (typeof error === 'string') {
    return error;
  }

  return fallback;
};
