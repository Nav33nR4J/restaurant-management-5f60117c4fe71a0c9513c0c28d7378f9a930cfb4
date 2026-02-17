import axios, { AxiosError } from "axios";

// Get the API base URL based on environment
// For Android emulator: use 10.0.2.2 to reach host machine's localhost
// For iOS simulator: use localhost or 127.0.0.1
// For real devices: use the machine's local IP address
const getApiBaseUrl = (): string => {
  // Check for environment variable first (for production or custom setup)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Default to Android emulator's special IP for localhost
  // This allows the Android emulator to connect to the host machine's backend
  return "http://10.0.2.2:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response - Network Error
      console.error("Network Error: Unable to reach server");
      console.error("Make sure the backend server is running at:", API_BASE_URL);
    } else {
      // Error setting up request
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to get user-friendly error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      // Network error
      return "Unable to connect to server. Please check your internet connection and ensure the backend server is running.";
    }
    // Server error
    const data = error.response.data as any;
    return data?.message || `Server error: ${error.response.status}`;
  }
  return "An unexpected error occurred";
};

// Promotion API endpoints
export const promotionApi = {
  // Get all promotions
  getAll: () => api.get("/promotions"),

  // Get single promotion
  getById: (id: string) => api.get(`/promotions/${id}`),

  // Create new promotion
  create: (data: any) => api.post("/promotions", data),

  // Update promotion
  update: (id: string, data: any) => api.put(`/promotions/${id}`, data),

  // Delete promotion
  delete: (id: string) => api.delete(`/promotions/${id}`),

  // Validate promo code
  validate: (promoCode: string, orderAmount: number) =>
    api.post("/promotions/validate", {
      promo_code: promoCode,
      order_amount: orderAmount,
    }),

  // Toggle promotion status
  toggleStatus: (id: string, isActive: boolean) =>
    api.put(`/promotions/${id}`, { is_active: isActive }),
};

export default api;
