// Shared constants to avoid duplication across components

// Category to icon mapping for food type icons
export const CATEGORY_ICONS: Record<string, string> = {
  "All": "apps",
  "Main Course": "restaurant",
  "Appetizer": "fast-food",
  "Dessert": "ice-cream",
  "Beverages": "wine",
  "Drinks": "wine",
  "Special": "star",
  "Snacks": "restaurant",
};

// Sample menu items for initial display (fallback when no database)
export const SAMPLE_MENU_ITEMS = [
  {
    id: "1",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon with herbs",
    price: 24.99,
    basePrice: 24.99,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    category: "Main Course",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Caesar Salad",
    description: "Crisp romaine with parmesan",
    price: 12.99,
    basePrice: 12.99,
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400",
    category: "Appetizer",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Beef Burger",
    description: "Premium beef with cheddar",
    price: 16.99,
    basePrice: 16.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    category: "Main Course",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Margherita Pizza",
    description: "Fresh tomatoes and mozzarella",
    price: 14.99,
    basePrice: 14.99,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
    category: "Main Course",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate with vanilla ice cream",
    price: 8.99,
    basePrice: 8.99,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    category: "Dessert",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Spring Rolls",
    description: "Crispy vegetable rolls",
    price: 7.99,
    basePrice: 7.99,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Appetizer",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Pasta Carbonara",
    description: "Creamy pasta with bacon",
    price: 18.99,
    basePrice: 18.99,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400",
    category: "Main Course",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Tiramisu",
    description: "Classic Italian dessert",
    price: 9.99,
    basePrice: 9.99,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
    category: "Dessert",
    isAvailable: true,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Default image for menu items
export const DEFAULT_MENU_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";

// Database timeout
export const DB_INIT_TIMEOUT = 5000;

// Menu refresh interval for time-based filtering (in milliseconds)
// This determines how often the menu is refreshed to check for time-based changes
export const MENU_REFRESH_INTERVAL = 60000; // 60 seconds

