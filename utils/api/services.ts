/**
 * API Services - All backend API calls
 * Each function is a backend code call
 */
import type {
    AuthResponse,
    Cart,
    Category,
    MenuItem,
    Order,
    Promotion,
    User
} from '../../types';
import { endpoints } from '../config';
import { clearAllStorage, setToken, setUserData } from '../storage';
import apiClient from './client';

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(endpoints.login, { email, password });
    if (response.success && response.data) {
      await setToken(response.data.token);
      await setUserData(response.data.user);
    }
    return response.data;
  },

  register: async (name: string, email: string, password: string, phone?: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(endpoints.register, { name, email, password, phone });
    if (response.success && response.data) {
      await setToken(response.data.token);
      await setUserData(response.data.user);
    }
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>(endpoints.profile);
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>(endpoints.updateProfile, data);
    if (response.success && response.data) {
      await setUserData(response.data);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(endpoints.logout);
    } finally {
      await clearAllStorage();
    }
  },
};

// Menu Service
export const menuService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(endpoints.categories);
    return response.data;
  },

  getMenuItems: async (params?: { category_id?: string; page?: number; limit?: number; branch_code?: string }): Promise<{ data: MenuItem[]; total: number }> => {
    const response = await apiClient.get<MenuItem[]>(endpoints.menuItems, params);
    return { data: response.data, total: response.pagination?.total || 0 };
  },

  getMenuItem: async (id: string, branch_code?: string): Promise<MenuItem> => {
    const response = await apiClient.get<MenuItem>(endpoints.menuItem(id), { branch_code });
    return response.data;
  },

  searchMenu: async (query: string, limit?: number): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuItem[]>(endpoints.searchMenu, { q: query, limit });
    return response.data;
  },

  getSeasonalItems: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuItem[]>(endpoints.seasonalItems);
    return response.data;
  },

  getSpecialItems: async (): Promise<MenuItem[]> => {
    const response = await apiClient.get<MenuItem[]>(endpoints.specialItems);
    return response.data;
  },
};

// Cart Service
export const cartService = {
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>(endpoints.cart);
    return response.data;
  },

  addToCart: async (menu_item_id: string, quantity?: number, notes?: string): Promise<{ cart_id: string; quantity: number }> => {
    const response = await apiClient.post<{ cart_id: string; quantity: number }>(endpoints.addToCart, { menu_item_id, quantity, notes });
    return response.data;
  },

  updateCartItem: async (id: string, quantity: number): Promise<{ id: string; quantity: number }> => {
    const response = await apiClient.put<{ id: string; quantity: number }>(endpoints.updateCartItem(id), { quantity });
    return response.data;
  },

  removeFromCart: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.removeCartItem(id));
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete(endpoints.clearCart);
  },

  applyPromotion: async (code: string): Promise<{ promotion: any; subtotal: number; discount: number; total: number }> => {
    const response = await apiClient.post<{ promotion: any; subtotal: number; discount: number; total: number }>(endpoints.applyPromo, { code });
    return response.data;
  },
};

// Order Service
export const orderService = {
  getOrders: async (params?: { page?: number; limit?: number; status?: string }): Promise<{ data: Order[]; total: number }> => {
    const response = await apiClient.get<Order[]>(endpoints.orders, params);
    return { data: response.data, total: response.pagination?.total || 0 };
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(endpoints.order(id));
    return response.data;
  },

  createOrder: async (data: { 
    delivery_address: string; 
    delivery_phone: string; 
    notes?: string; 
    promotion_code?: string;
  }): Promise<{ order_id: string; total_amount: number; status: string }> => {
    const response = await apiClient.post<{ order_id: string; total_amount: number; status: string }>(endpoints.createOrder, data);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<{ id: string; status: string }> => {
    const response = await apiClient.put<{ id: string; status: string }>(endpoints.updateOrderStatus(id), { status });
    return response.data;
  },

  cancelOrder: async (id: string): Promise<{ id: string; status: string }> => {
    const response = await apiClient.delete<{ id: string; status: string }>(endpoints.cancelOrder(id));
    return response.data;
  },
};

// Promotion Service
export const promotionService = {
  getPromotions: async (params?: { active_only?: boolean; page?: number; limit?: number }): Promise<{ data: Promotion[]; total: number }> => {
    const response = await apiClient.get<Promotion[]>(endpoints.promotions, params as any);
    return { data: response.data, total: response.pagination?.total || 0 };
  },

  getPromotion: async (id: string): Promise<Promotion> => {
    const response = await apiClient.get<Promotion>(endpoints.promotion(id));
    return response.data;
  },

  createPromotion: async (data: Partial<Promotion>): Promise<Promotion> => {
    const response = await apiClient.post<Promotion>(endpoints.promotions, data);
    return response.data;
  },

  updatePromotion: async (id: string, data: Partial<Promotion>): Promise<Promotion> => {
    const response = await apiClient.put<Promotion>(endpoints.promotion(id), data);
    return response.data;
  },

  deletePromotion: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.promotion(id));
  },

  validatePromotion: async (code: string, order_amount?: number): Promise<{ valid: boolean; promotion: Promotion }> => {
    const response = await apiClient.post<{ valid: boolean; promotion: Promotion }>(endpoints.validatePromo, { code, order_amount });
    return response.data;
  },
};
