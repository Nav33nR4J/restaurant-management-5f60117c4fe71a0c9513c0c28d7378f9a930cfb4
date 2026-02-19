/**
 * Unit Tests for Warnings Utility
 */
const {
  WARNINGS,
  getWarning,
  formatWarning,
} = require('../../src/utils/warnings');

describe('Warnings Utility', () => {
  describe('WARNINGS', () => {
    it('should have AUTH warnings', () => {
      expect(WARNINGS.AUTH).toBeDefined();
      expect(WARNINGS.AUTH.INVALID_CREDENTIALS).toEqual({
        code: 'AUTH001',
        message: 'Invalid email or password',
      });
    });

    it('should have MENU warnings', () => {
      expect(WARNINGS.MENU).toBeDefined();
      expect(WARNINGS.MENU.ITEM_NOT_FOUND).toEqual({
        code: 'MENU001',
        message: 'Menu item not found',
      });
    });

    it('should have CART warnings', () => {
      expect(WARNINGS.CART).toBeDefined();
      expect(WARNINGS.CART.EMPTY_CART).toEqual({
        code: 'CART001',
        message: 'Cart is empty',
      });
    });

    it('should have ORDER warnings', () => {
      expect(WARNINGS.ORDER).toBeDefined();
      expect(WARNINGS.ORDER.ORDER_NOT_FOUND).toEqual({
        code: 'ORDER001',
        message: 'Order not found',
      });
    });

    it('should have PROMOTION warnings', () => {
      expect(WARNINGS.PROMOTION).toBeDefined();
      expect(WARNINGS.PROMOTION.NOT_FOUND).toEqual({
        code: 'PROMO001',
        message: 'Promotion not found',
      });
    });

    it('should have GENERAL warnings', () => {
      expect(WARNINGS.GENERAL).toBeDefined();
      expect(WARNINGS.GENERAL.VALIDATION_ERROR).toEqual({
        code: 'GEN001',
        message: 'Validation error',
      });
    });
  });

  describe('getWarning', () => {
    it('should return warning by category and code', () => {
      const warning = getWarning('AUTH', 'INVALID_CREDENTIALS');
      expect(warning).toEqual({
        code: 'AUTH001',
        message: 'Invalid email or password',
      });
    });

    it('should return SERVER_ERROR for invalid category', () => {
      const warning = getWarning('INVALID', 'SOME_CODE');
      expect(warning).toEqual(WARNINGS.GENERAL.SERVER_ERROR);
    });

    it('should return SERVER_ERROR for invalid code', () => {
      const warning = getWarning('AUTH', 'INVALID_CODE');
      expect(warning).toEqual(WARNINGS.GENERAL.SERVER_ERROR);
    });
  });

  describe('formatWarning', () => {
    it('should return warning object as-is if not a function', () => {
      const warning = { code: 'TEST001', message: 'Test' };
      const result = formatWarning(warning);
      expect(result).toEqual(warning);
    });

    it('should call function with args if warning is a function', () => {
      const warning = (name) => ({ code: 'TEST001', message: `Hello ${name}` });
      const result = formatWarning(warning, 'World');
      expect(result).toEqual({ code: 'TEST001', message: 'Hello World' });
    });

    it('should handle dynamic NOT_FOUND warning', () => {
      const result = formatWarning(WARNINGS.GENERAL.NOT_FOUND, 'User');
      expect(result).toEqual({ code: 'GEN003', message: 'User not found' });
    });
  });
});

