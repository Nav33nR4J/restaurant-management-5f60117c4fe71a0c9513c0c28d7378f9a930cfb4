/**
 * API Configuration
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  profile: '/auth/me',
  updateProfile: '/auth/profile',
  logout: '/auth/logout',

  // Menu
  categories: '/menu/categories',
  menuItems: '/menu/items',
  menuItem: (id: string) => `/menu/items/${id}`,
  searchMenu: '/menu/search',
  seasonalItems: '/menu/seasonal',
  specialItems: '/menu/specials',

  // Cart
  cart: '/cart',
  addToCart: '/cart/items',
  updateCartItem: (id: string) => `/cart/items/${id}`,
  removeCartItem: (id: string) => `/cart/items/${id}`,
  clearCart: '/cart/clear',
  applyPromo: '/cart/apply-promo',

  // Orders
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  createOrder: '/orders',
  updateOrderStatus: (id: string) => `/orders/${id}/status`,
  cancelOrder: (id: string) => `/orders/${id}`,

  // Promotions
  promotions: '/promotions',
  promotion: (id: string) => `/promotions/${id}`,
  validatePromo: '/promotions/validate',
};
