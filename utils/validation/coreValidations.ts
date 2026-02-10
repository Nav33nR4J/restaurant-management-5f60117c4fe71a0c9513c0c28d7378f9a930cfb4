/**
 * Core Validation Utilities
 * Basic validation functions for form inputs and data sanitization
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} is required`,
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
  maxLength: (field: string, max: number) => `${field} must be less than ${max} characters`,
  invalid: (field: string) => `Invalid ${field}`,
};

// ============================================================================
// Core Validation Functions
// ============================================================================

/**
 * Check if a value is empty (null, undefined, or empty string after trim)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Validate that a field is required
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (isEmpty(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required(fieldName) };
  }
  return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(value: string, fieldName: string = 'Email'): ValidationResult {
  if (isEmpty(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required(fieldName) };
  }

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.email };
  }
  return { isValid: true };
}

/**
 * Validate phone number (supports various formats)
 */
export function validatePhone(
  value: string,
  fieldName: string = 'Phone number',
  minLength: number = 10
): ValidationResult {
  if (isEmpty(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required(fieldName) };
  }

  // Remove all non-digit characters for validation
  const digitsOnly = value.replace(/\D/g, '');
  
  if (digitsOnly.length < minLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.phone };
  }
  return { isValid: true };
}

/**
 * Validate minimum length
 * Note: We do NOT trim the value to allow trailing/leading spaces in fields like address
 */
export function validateMinLength(
  value: string,
  fieldName: string,
  minLength: number
): ValidationResult {
  if (value.length < minLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.minLength(fieldName, minLength) };
  }
  return { isValid: true };
}

/**
 * Validate maximum length
 * Note: We do NOT trim the value to allow trailing/leading spaces in fields like address
 */
export function validateMaxLength(
  value: string,
  fieldName: string,
  maxLength: number
): ValidationResult {
  if (value.length > maxLength) {
    return { isValid: false, error: VALIDATION_MESSAGES.maxLength(fieldName, maxLength) };
  }
  return { isValid: true };
}

/**
 * Validate against a custom regex pattern
 */
export function validatePattern(
  value: string,
  fieldName: string,
  pattern: RegExp,
  errorMessage?: string
): ValidationResult {
  if (!pattern.test(value)) {
    return { isValid: false, error: errorMessage || VALIDATION_MESSAGES.invalid(fieldName) };
  }
  return { isValid: true };
}

/**
 * Custom validator function
 */
export function validateCustom(
  value: string,
  validator: (val: string) => boolean,
  errorMessage: string
): ValidationResult {
  if (!validator(value)) {
    return { isValid: false, error: errorMessage };
  }
  return { isValid: true };
}

/**
 * Validate date of birth format (DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY)
 */
export function validateDOB(value: string): ValidationResult {
  if (isEmpty(value)) {
    return { isValid: false, error: VALIDATION_MESSAGES.required('Date of birth') };
  }

  // Basic format check - accepts /, -, or . as separators
  const dobRegex = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
  if (!dobRegex.test(value)) {
    return { isValid: false, error: 'Please enter DOB in DD/MM/YYYY format' };
  }

  // Split using the separator that was used
  const separator = value.match(/[\/\-\.]/)?.[0] || '/';
  const [day, month, year] = value.split(separator).map(Number);

  // Validate ranges
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Invalid month in date of birth' };
  }

  if (day < 1 || day > 31) {
    return { isValid: false, error: 'Invalid day in date of birth' };
  }

  if (year < 1900 || year > new Date().getFullYear()) {
    return { isValid: false, error: 'Invalid year in date of birth' };
  }

  return { isValid: true };
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

// ============================================================================
// Export
// ============================================================================

export default {
  isEmpty,
  validateRequired,
  validateEmail,
  validatePhone,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  validateCustom,
  validateDOB,
  formatPhoneNumber,
  VALIDATION_MESSAGES,
};

