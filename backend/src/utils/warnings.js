/**
 * Centralized Warnings Utility
 * All custom warnings should be defined here and called via function
 */

const WARNINGS = {
  // Authentication Warnings
  AUTH: {
    INVALID_CREDENTIALS: { code: 'AUTH001', message: 'Invalid email or password' },
    TOKEN_EXPIRED: { code: 'AUTH002', message: 'Authentication token has expired' },
    TOKEN_INVALID: { code: 'AUTH003', message: 'Invalid authentication token' },
    UNAUTHORIZED: { code: 'AUTH004', message: 'Unauthorized access' },
    USER_EXISTS: { code: 'AUTH005', message: 'User with this email already exists' },
    WEAK_PASSWORD: { code: 'AUTH006', message: 'Password must be at least 8 characters' }
  },

  // Menu Warnings
  MENU: {
    ITEM_NOT_FOUND: { code: 'MENU001', message: 'Menu item not found' },
    CATEGORY_NOT_FOUND: { code: 'MENU002', message: 'Category not found' },
    ITEM_UNAVAILABLE: { code: 'MENU003', message: 'This item is currently unavailable' },
    INVALID_PRICE: { code: 'MENU004', message: 'Invalid price value' },
    SEASONAL_ITEM_EXPIRED: { code: 'MENU005', message: 'Seasonal menu item has expired' }
  },

  // Cart Warnings
  CART: {
    EMPTY_CART: { code: 'CART001', message: 'Cart is empty' },
    ITEM_NOT_IN_CART: { code: 'CART002', message: 'Item not found in cart' },
    INVALID_QUANTITY: { code: 'CART003', message: 'Invalid quantity value' },
    MAX_QUANTITY_EXCEEDED: { code: 'CART004', message: 'Maximum quantity exceeded' }
  },

  // Order Warnings
  ORDER: {
    ORDER_NOT_FOUND: { code: 'ORDER001', message: 'Order not found' },
    INVALID_STATUS: { code: 'ORDER002', message: 'Invalid order status' },
    CANNOT_CANCEL: { code: 'ORDER003', message: 'Order cannot be cancelled at this stage' },
    MIN_ORDER_NOT_MET: { code: 'ORDER004', message: 'Minimum order amount not met' }
  },

  // Promotion Warnings
  PROMOTION: {
    NOT_FOUND: { code: 'PROMO001', message: 'Promotion not found' },
    EXPIRED: { code: 'PROMO002', message: 'Promotion has expired' },
    INACTIVE: { code: 'PROMO003', message: 'Promotion is not active' },
    CODE_INVALID: { code: 'PROMO004', message: 'Invalid promotion code' },
    MIN_ORDER_NOT_MET: { code: 'PROMO005', message: 'Minimum order amount not met for this promotion' },
    ALREADY_USED: { code: 'PROMO006', message: 'Promotion code already used' }
  },

  // General Warnings
  GENERAL: {
    VALIDATION_ERROR: { code: 'GEN001', message: 'Validation error' },
    SERVER_ERROR: { code: 'GEN002', message: 'Internal server error' },
    NOT_FOUND: (resource) => ({ code: 'GEN003', message: `${resource} not found` }),
    BAD_REQUEST: (message) => ({ code: 'GEN004', message })
  },

  // Route helper for 404
  NOT_FOUND: {
    route: (url) => ({ code: 'GEN003', message: `Route ${url} not found` })
  }
};

/**
 * Get warning by code
 */
const getWarning = (category, code) => {
  return WARNINGS[category]?.[code] || WARNINGS.GENERAL.SERVER_ERROR;
};

/**
 * Format warning message with dynamic values
 */
const formatWarning = (warning, ...args) => {
  if (typeof warning === 'function') {
    return warning(...args);
  }
  return warning;
};

module.exports = {
  WARNINGS,
  getWarning,
  formatWarning
};
