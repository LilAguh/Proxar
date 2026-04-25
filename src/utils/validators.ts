export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const regex = /^[\d\s\-\+\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return regex.test(phone) && digitsOnly.length >= 8;
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
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

export const validateForm = (fields: Record<string, any>, rules: Record<string, string[]>): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((field) => {
    const value = fields[field];
    const fieldRules = rules[field];

    fieldRules.forEach((rule) => {
      if (rule === 'required' && isEmpty(value)) {
        errors[field] = 'Este campo es requerido';
      }
      if (rule === 'email' && !isEmpty(value) && !isValidEmail(value)) {
        errors[field] = 'Email inválido';
      }
      if (rule === 'phone' && !isEmpty(value) && !isValidPhone(value)) {
        errors[field] = 'Teléfono inválido';
      }
      if (rule === 'amount' && !isEmpty(value) && !isValidAmount(value)) {
        errors[field] = 'Monto inválido';
      }
    });
  });

  return errors;
};