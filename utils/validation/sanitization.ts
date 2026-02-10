/**
 * Sanitization Utilities
 * Functions for sanitizing input to prevent XSS and other attacks
 */

import {
  validateDOB,
  validateEmail,
  validateMinLength,
  validatePhone,
  validateRequired
} from "./coreValidations";
import { validateField } from "./formValidators";

/**
 * Sanitize string input to prevent XSS attacks
 * Note: We intentionally do NOT trim the value to allow users to enter
 * trailing/leading spaces in fields like address
 * Note: We do NOT replace '/' to preserve date formats like DOB (DD/MM/YYYY)
 */
export function sanitizeInput(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize all string values in an object
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Real-time Validation Helpers
 */

/**
 * Get validation state for an input field
 */
export type ValidationState = 'valid' | 'invalid' | 'default';

export function getInputValidationState(
  value: string,
  rules: Array<{
    type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => boolean;
    message?: string;
  }>
): ValidationState {
  if (value === '') return 'default';

  const result = validateField(value, 'Field', rules);
  return result.isValid ? 'valid' : 'invalid';
}

/**
 * Debounced validation for real-time input
 */
export function createDebouncedValidator(
  validator: (value: string) => { isValid: boolean; error?: string },
  delay: number = 300
): (value: string) => { isValid: boolean; error?: string } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (value: string): { isValid: boolean; error?: string } => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (value === '') {
      return { isValid: true };
    }

    timeoutId = setTimeout(() => {
      const result = validator(value);
      return result;
    }, delay);

    return { isValid: true }; // Return pending state
  };
}

/**
 * Validate a single field and return error message if any
 */
export function validateSingleField(
  field: string,
  value: string
): string | undefined {
  switch (field) {
    case 'firstName': {
      const requiredResult = validateRequired(value.trim(), 'First name');
      if (!requiredResult.isValid) return requiredResult.error;
      const minLengthResult = validateMinLength(value.trim(), 'First name', 2);
      if (!minLengthResult.isValid) return minLengthResult.error;
      return undefined;
    }
    case 'lastName': {
      const requiredResult = validateRequired(value.trim(), 'Last name');
      if (!requiredResult.isValid) return requiredResult.error;
      const minLengthResult = validateMinLength(value.trim(), 'Last name', 2);
      if (!minLengthResult.isValid) return minLengthResult.error;
      return undefined;
    }
    case 'phone': {
      const phoneResult = validatePhone(value.trim(), 'Phone number', 10);
      return phoneResult.isValid ? undefined : phoneResult.error;
    }
    case 'address': {
      const requiredResult = validateRequired(value, 'Address');
      if (!requiredResult.isValid) return requiredResult.error;
      const minLengthResult = validateMinLength(value, 'Address', 10);
      return minLengthResult.isValid ? undefined : minLengthResult.error;
    }
    case 'dob': {
      const dobResult = validateDOB(value.trim());
      return dobResult.isValid ? undefined : dobResult.error;
    }
    case 'email': {
      const emailResult = validateEmail(value.trim(), 'Email');
      return emailResult.isValid ? undefined : emailResult.error;
    }
    default:
      return undefined;
  }
}

// ============================================================================
// Export
// ============================================================================

export default {
  sanitizeInput,
  sanitizeObject,
  getInputValidationState,
  createDebouncedValidator,
  validateSingleField,
};

