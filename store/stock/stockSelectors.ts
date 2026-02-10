/**
 * Stock Selectors
 * Memoized selectors for stock state
 */

// Stock item interface
export interface StockItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  inStock: boolean;
  lastUpdated: string;
}

// Stock state interface
export interface StockState {
  items: StockItem[];
  loading: boolean;
  error: string | null;
}

// Initial state
export const stockInitialState: StockState = {
  items: [],
  loading: false,
  error: null,
};

/**
 * Get all stock items
 */
export const selectAllStockItems = (state: { stock: StockState }) => state.stock.items;

/**
 * Get stock status for a specific menu item
 */
export const selectStockByMenuItemId = (menuItemId: string) => (state: { stock: StockState }) =>
  state.stock.items.find(item => item.menuItemId === menuItemId);

/**
 * Check if a menu item is in stock
 */
export const selectIsInStock = (menuItemId: string) => (state: { stock: StockState }) => {
  const stockItem = state.stock.items.find(item => item.menuItemId === menuItemId);
  return stockItem ? stockItem.inStock : true; // Default to true if no stock record
};

/**
 * Get loading state
 */
export const selectStockLoading = (state: { stock: StockState }) => state.stock.loading;

/**
 * Get stock error
 */
export const selectStockError = (state: { stock: StockState }) => state.stock.error;

/**
 * Get out of stock items
 */
export const selectOutOfStockItems = (state: { stock: StockState }) =>
  state.stock.items.filter(item => !item.inStock);

/**
 * Get in stock items count
 */
export const selectInStockCount = (state: { stock: StockState }) =>
  state.stock.items.filter(item => item.inStock).length;

/**
 * Get total stock items count
 */
export const selectTotalStockItems = (state: { stock: StockState }) =>
  state.stock.items.length;

