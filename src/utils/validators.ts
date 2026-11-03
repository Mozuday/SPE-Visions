// Centralized validation — used by Contact, Apply, Admin forms, auth
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPhone = (phone: string): boolean =>
  /^[+]?[\d\s-]{10,15}$/.test(phone.trim());

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isNonEmpty = (value: string): boolean => value.trim().length > 0;

export const minLength = (value: string, min: number): boolean =>
  value.trim().length >= min;

export const isValidSlug = (slug: string): boolean =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

// Generic form validator — pass a schema, get back { field: errorMessage }
type ValidationRule<T> = {
  field: keyof T;
  validate: (value: string) => boolean;
  message: string;
};

export function validateForm<T extends Record<string, string>>(
  values: T,
  rules: ValidationRule<T>[]
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const rule of rules) {
    const value = values[rule.field] ?? "";
    if (!rule.validate(value)) {
      errors[rule.field] = rule.message;
    }
  }
  return errors;
}