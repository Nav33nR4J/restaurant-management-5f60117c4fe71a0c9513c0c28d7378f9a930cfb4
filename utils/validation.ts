/**
 * Centralized Validation Utilities
 * Reusable validation functions for form inputs, data sanitization, and business logic validation
 * 
 * NOTE: This file re-exports from the modularized validation utilities.
 * New code should import directly from './validation/' submodules.
 */


// Import core validation functions
import {
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
  ValidationResult,
} from "./validation/coreValidations";

// Import form validators
import {
  validateField,
  validateOrderForm,
  validateProfileForm,
  validateCartForCheckout,
  FieldValidation,
  OrderFormData,
  ProfileFormData,
  CartItemData,
} from "./validation/formValidators";

// Import sanitization functions
import {
  sanitizeInput,
  sanitizeObject,
} from "./validation/sanitization";

// Re-export all utilities from modular structure
export * from "./validation/coreValidations";
export * from "./validation/formValidators";
export * from "./validation/sanitization";

// Types for backward compatibility (re-exported from modules above)
export {
  ValidationResult,
  FieldValidation,
  OrderFormData,
  ProfileFormData,
  CartItemData,
};

// Legacy exports for backward compatibility
export {
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
  validateField,
  validateOrderForm,
  validateProfileForm,
  validateCartForCheckout,
  sanitizeInput,
  sanitizeObject,
};

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
  validateField,
  validateOrderForm,
  validateProfileForm,
  validateCartForCheckout,
  sanitizeInput,
  sanitizeObject,
};
