export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const regex = /^[\d\s\-\+\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return regex.test(phone) && digitsOnly.length >= 8;
};

export const isValidAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0;
};

export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

export const isValidPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Debe tener al menos 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Debe tener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Debe tener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Debe tener al menos un número');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Debe tener al menos un caracter especial');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const isValidDate = (date: string): boolean => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

export const isFutureDate = (date: string): boolean => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

export const maxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

export const minLength = (value: string, min: number): boolean => {
  return value.length >= min;
};