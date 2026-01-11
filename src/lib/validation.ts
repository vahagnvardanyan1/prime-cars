// Validation utility functions

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone.trim()) && phone.trim().length >= 8;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = ({ value, min }: { value: string; min: number }): boolean => {
  return value.trim().length >= min;
};

export const validateMaxLength = ({ value, max }: { value: string; max: number }): boolean => {
  return value.trim().length <= max;
};

// Helper to get error class for inputs
export const getInputErrorClass = (hasError: boolean): string => {
  return hasError
    ? 'border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus-visible:ring-red-500'
    : '';
};
