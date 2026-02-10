/**
 * Form-Specific Validators
 * Validation functions for specific form types
 */

import {
  ValidationResult,
  validateDOB,
  validateEmail,
  validateMinLength,
  validatePhone,
  validateRequired
} from "./coreValidations";

// ============================================================================
// Order Form Validation
// ============================================================================

export interface OrderFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
}

/**
 * Validate order form data
 */
export function validateOrderForm(formData: OrderFormData): ValidationResult {
  // First name validation
  const firstNameResult = validateRequired(formData.firstName.trim(), 'First name');
  if (!firstNameResult.isValid) return firstNameResult;

  // Last name validation
  const lastNameResult = validateRequired(formData.lastName.trim(), 'Last name');
  if (!lastNameResult.isValid) return lastNameResult;

  // Phone validation
  const phoneResult = validatePhone(formData.phone.trim(), 'Phone number', 10);
  if (!phoneResult.isValid) return phoneResult;

  // Address validation - NOT trimmed to allow spaces after words
  const addressResult = validateMinLength(formData.address, 'Address', 10);
  if (!addressResult.isValid) return addressResult;

  // DOB validation
  const dobResult = validateRequired(formData.dob.trim(), 'Date of birth');
  if (!dobResult.isValid) return dobResult;

  // DOB format validation
  const dobFormatResult = validateDOB(formData.dob.trim());
  if (!dobFormatResult.isValid) return dobFormatResult;

  // Email validation
  const emailResult = validateEmail(formData.email.trim(), 'Email');
  if (!emailResult.isValid) return emailResult;

  return { isValid: true };
}

// ============================================================================
// Profile Form Validation
// ============================================================================

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  dob?: string;
}

/**
 * Validate profile form data
 */
export function validateProfileForm(formData: ProfileFormData): ValidationResult {
  // First name validation
  const firstNameResult = validateRequired(formData.firstName.trim(), 'First name');
  if (!firstNameResult.isValid) return firstNameResult;

  // Last name validation
  const lastNameResult = validateRequired(formData.lastName.trim(), 'Last name');
  if (!lastNameResult.isValid) return lastNameResult;

  // Phone validation
  const phoneResult = validatePhone(formData.phone.trim(), 'Phone number', 10);
  if (!phoneResult.isValid) return phoneResult;

  // Email validation
  const emailResult = validateEmail(formData.email.trim(), 'Email');
  if (!emailResult.isValid) return emailResult;

  return { isValid: true };
}

// ============================================================================
// Cart Validation
// ============================================================================

export interface CartItemData {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

/**
 * Validate cart before checkout
 */
export function validateCartForCheckout(
  items: CartItemData[],
  total: number
): ValidationResult {
  if (!items || items.length === 0) {
    return { isValid: false, error: 'Your cart is empty' };
  }

  // Check for invalid quantities
  const invalidItems = items.filter(item => item.quantity <= 0 || !item.id);
  if (invalidItems.length > 0) {
    return { isValid: false, error: 'Some items have invalid quantities' };
  }

  // Check for negative prices
  const negativePriceItems = items.filter(item => item.price < 0);
  if (negativePriceItems.length > 0) {
    return { isValid: false, error: 'Some items have invalid prices' };
  }

  // Validate total
  if (total < 0) {
    return { isValid: false, error: 'Invalid cart total' };
  }

  return { isValid: true };
}

// ============================================================================
// Field Validation Helpers
// ============================================================================

export interface FieldValidation {
  value: string;
  label: string;
  validations: Array<{
    type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    message?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => boolean;
  }>;
}

/**
 * Validate a field with multiple rules
 */
export function validateField(
  value: string,
  label: string,
  rules: FieldValidation['validations']
): ValidationResult {
  for (const rule of rules) {
    let result: ValidationResult;

    switch (rule.type) {
      case 'required':
        result = validateRequired(value, label);
        break;
      case 'email':
        result = validateEmail(value, label);
        break;
      case 'phone':
        result = validatePhone(value, label, rule.minLength || 10);
        break;
      case 'minLength':
        result = validateMinLength(value, label, rule.minLength || 0);
        break;
      case 'maxLength':
        result = validateMaxLength(value, label, rule.maxLength || 100);
        break;
      case 'pattern':
        result = validatePattern(value, label, rule.pattern!, rule.message);
        break;
      case 'custom':
        result = validateCustom(value, rule.customValidator!, rule.message || 'Invalid value');
        break;
      default:
        continue;
    }

    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}

// Import additional validators needed for validateField
import { validateCustom, validateMaxLength, validatePattern } from "./coreValidations";

// ============================================================================
// Export
// ============================================================================

export default {
  validateOrderForm,
  validateProfileForm,
  validateCartForCheckout,
  validateField,
};

