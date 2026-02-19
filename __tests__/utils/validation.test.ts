/**
 * Unit Tests for Validation Utilities
 */
import {
  formatPhoneNumber,
  isEmpty,
  sanitizeInput,
  sanitizeObject,
  validateCartForCheckout,
  validateDOB,
  validateEmail,
  validateField,
  validateMaxLength,
  validateMinLength,
  validateOrderForm,
  validatePhone,
  validateProfileForm,
  validateRequired,
  VALIDATION_MESSAGES,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isEmpty', () => {
    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty string', () => {
      expect(isEmpty('hello')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should return valid for non-empty value', () => {
      const result = validateRequired('hello', 'Name');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty value', () => {
      const result = validateRequired('', 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateEmail', () => {
    it('should return valid for valid email', () => {
      const result = validateEmail('test@example.com', 'Email');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for invalid email', () => {
      const result = validateEmail('invalid-email', 'Email');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for empty email', () => {
      const result = validateEmail('', 'Email');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should return valid for valid phone numbers', () => {
      expect(validatePhone('1234567890', 'Phone', 10).isValid).toBe(true);
      expect(validatePhone('123-456-7890', 'Phone', 10).isValid).toBe(true);
    });

    it('should return invalid for short phone numbers', () => {
      const result = validatePhone('123', 'Phone', 10);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateMinLength', () => {
    it('should return valid when string meets minimum length', () => {
      const result = validateMinLength('hello', 'Name', 3);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid when string is too short', () => {
      const result = validateMinLength('hi', 'Name', 3);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateMaxLength', () => {
    it('should return valid when string is within max length', () => {
      const result = validateMaxLength('hello', 'Name', 10);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid when string exceeds max length', () => {
      const result = validateMaxLength('hello world', 'Name', 5);
      expect(result.isValid).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone number', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    it('should return input if not 10 digits', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });
  });

  describe('validateDOB', () => {
    it('should return valid for valid date of birth', () => {
      const result = validateDOB('01/01/1990');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for invalid format', () => {
      const result = validateDOB('invalid');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for future year', () => {
      const result = validateDOB('01/01/2099');
      expect(result.isValid).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string values in object', () => {
      const obj = { name: '  hello  ', email: ' test@example.com ' };
      const result = sanitizeObject(obj);
      expect(result.name).toBe('hello');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('validateField', () => {
    it('should validate email field with rules', () => {
      const rules = [{ type: 'email' as const }];
      const result = validateField('test@example.com', 'Email', rules);
      expect(result.isValid).toBe(true);
    });

    it('should return error for invalid email', () => {
      const rules = [{ type: 'email' as const }];
      const result = validateField('invalid', 'Email', rules);
      expect(result.isValid).toBe(false);
    });

    it('should validate required field', () => {
      const rules = [{ type: 'required' as const }];
      const result = validateField('', 'Name', rules);
      expect(result.isValid).toBe(false);
    });

    it('should validate minLength', () => {
      const rules = [{ type: 'minLength' as const, minLength: 5 }];
      const result = validateField('abc', 'Name', rules);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateCartForCheckout', () => {
    it('should return valid for non-empty cart', () => {
      const cart = [
        { id: '1', name: 'Item 1', price: 10, quantity: 2 },
      ];
      const result = validateCartForCheckout(cart, 20);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty cart', () => {
      const result = validateCartForCheckout([], 0);
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for cart with zero quantity item', () => {
      const cart = [
        { id: '1', name: 'Item 1', price: 10, quantity: 0 },
      ];
      const result = validateCartForCheckout(cart, 0);
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for negative total', () => {
      const cart = [
        { id: '1', name: 'Item 1', price: 10, quantity: 2 },
      ];
      const result = validateCartForCheckout(cart, -5);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateOrderForm', () => {
    it('should return valid for valid order form', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        address: '123 Main Street',
        dob: '01/01/1990',
        email: 'john@example.com',
      };
      const result = validateOrderForm(formData);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty firstName', () => {
      const formData = {
        firstName: '',
        lastName: 'Doe',
        phone: '1234567890',
        address: '123 Main Street',
        dob: '01/01/1990',
        email: 'john@example.com',
      };
      const result = validateOrderForm(formData);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateProfileForm', () => {
    it('should return valid for valid profile form', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john@example.com',
        address: '123 Main Street',
      };
      const result = validateProfileForm(formData);
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for invalid email', () => {
      const formData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'invalid-email',
        address: '123 Main Street',
      };
      const result = validateProfileForm(formData);
      expect(result.isValid).toBe(false);
    });
  });

  describe('VALIDATION_MESSAGES', () => {
    it('should have required message function', () => {
      expect(VALIDATION_MESSAGES.required('Name')).toBe('Name is required');
    });

    it('should have email message', () => {
      expect(VALIDATION_MESSAGES.email).toBeDefined();
    });

    it('should have phone message', () => {
      expect(VALIDATION_MESSAGES.phone).toBeDefined();
    });

    it('should have minLength message function', () => {
      expect(VALIDATION_MESSAGES.minLength('Name', 5)).toBe('Name must be at least 5 characters');
    });

    it('should have maxLength message function', () => {
      expect(VALIDATION_MESSAGES.maxLength('Name', 10)).toBe('Name must be less than 10 characters');
    });
  });
});

