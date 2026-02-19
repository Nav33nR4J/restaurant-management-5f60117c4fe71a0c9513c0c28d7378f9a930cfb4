/**
 * Frontend Warnings Utility - All custom warnings in one file
 * Called via functions
 */

// Warning Messages
export const WARNINGS = {
  // Authentication Warnings
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_EXPIRED: 'Session expired. Please login again',
    TOKEN_INVALID: 'Invalid session. Please login again',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    USER_EXISTS: 'An account with this email already exists',
    WEAK_PASSWORD: 'Password must be at least 8 characters',
    LOGIN_REQUIRED: 'Please login to continue',
  },

  // Menu Warnings
  MENU: {
    ITEM_NOT_FOUND: 'Menu item not found',
    CATEGORY_NOT_FOUND: 'Category not found',
    ITEM_UNAVAILABLE: 'This item is currently unavailable',
    INVALID_PRICE: 'Invalid price',
    LOADING_ERROR: 'Failed to load menu. Please try again',
  },

  // Cart Warnings
  CART: {
    EMPTY_CART: 'Your cart is empty',
    ITEM_NOT_IN_CART: 'Item not found in cart',
    INVALID_QUANTITY: 'Invalid quantity',
    MAX_QUANTITY_EXCEEDED: 'Maximum quantity reached',
    ADD_ERROR: 'Failed to add item to cart',
  },

  // Order Warnings
  ORDER: {
    ORDER_NOT_FOUND: 'Order not found',
    INVALID_STATUS: 'Invalid order status',
    CANNOT_CANCEL: 'This order cannot be cancelled',
    MIN_ORDER_NOT_MET: 'Minimum order amount not met',
    CREATE_ERROR: 'Failed to create order',
    LOAD_ERROR: 'Failed to load orders',
  },

  // Promotion Warnings
  PROMOTION: {
    NOT_FOUND: 'Promotion not found',
    EXPIRED: 'This promotion has expired',
    INACTIVE: 'This promotion is not active',
    CODE_INVALID: 'Invalid promotion code',
    MIN_ORDER_NOT_MET: 'Minimum order amount not met for this promotion',
    ALREADY_USED: 'This promotion code has already been used',
    APPLY_ERROR: 'Failed to apply promotion',
  },

  // Network Warnings
  NETWORK: {
    NO_CONNECTION: 'No internet connection',
    TIMEOUT: 'Request timed out. Please try again',
    SERVER_ERROR: 'Server error. Please try again later',
  },

  // Validation Warnings
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE: 'Invalid phone number',
    PASSWORD_MISMATCH: 'Passwords do not match',
  },
};

// Get warning by category and key
export const getWarning = (category: keyof typeof WARNINGS, key: string): string => {
  return WARNINGS[category]?.[key as keyof typeof WARNINGS[typeof category]] || WARNINGS.NETWORK.SERVER_ERROR;
};

// Get warning with custom message
export const getCustomWarning = (message: string): string => {
  return message;
};

export default WARNINGS;
