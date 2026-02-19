/**
 * Type Definitions - All TypeScript types for the application
 */

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'driver';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// Menu Item Types
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  final_price?: number;
  category_id?: string;
  category_name?: string;
  image_url?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_special: boolean;
  is_seasonal: boolean;
  created_at: string;
  updated_at: string;
}

// Cart Types
export interface CartItem {
  id: string;
  menu_item_id: string;
  name: string;
  description?: string;
  image_url?: string;
  unit_price: number;
  final_price: number;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  item_count: number;
  subtotal: number;
  discount?: number;
  total?: number;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  session_id?: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address?: string;
  delivery_phone?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// Promotion Types
export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  code?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionItem {
  id: string;
  promotion_id: string;
  menu_item_id?: string;
  category_id?: string;
  item_name?: string;
  category_name?: string;
}

// API Response Types
export interface ApiError {
  success: false;
  message: string;
  errorCode?: string;
}

export interface PaginatedParams {
  page?: number;
  limit?: number;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
  Profile: undefined;
  Promotions: undefined;
  PromotionCreate: undefined;
  Login: undefined;
  Register: undefined;
};
