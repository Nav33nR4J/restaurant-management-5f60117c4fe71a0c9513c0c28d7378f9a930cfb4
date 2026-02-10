import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { stockInitialState } from './stock/stockSelectors';
import * as thunks from './stock/stockThunks';

// Re-export thunks
export const {
  loadStock,
  updateStockItem,
  toggleStockStatus,
  setInStockStatus,
  setOutOfStockStatus,
} = thunks;

// Re-export selectors for backward compatibility
export * from './stock/stockSelectors';

// Stock slice
const stockSlice = createSlice({
  name: 'stock',
  initialState: stockInitialState,
  reducers: {
    setStockItems: (state, action: PayloadAction<import('./stock/stockSelectors').StockItem[]>) => {
      state.items = action.payload;
    },
    clearStockError: (state) => {
      state.error = null;
    },
    resetStock: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Load stock
    builder
      .addCase(thunks.loadStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.loadStock.fulfilled, (state, action) => {
        state.loading = false;
        // Convert stock data to StockItem format
        state.items = action.payload.map(item => ({
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          menuItemId: item.menuItemId,
          menuItemName: '', // Will be populated when syncing with menu items
          quantity: item.quantity,
          inStock: item.quantity > 0,
          lastUpdated: new Date().toISOString(),
        }));
      })
      .addCase(thunks.loadStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load stock';
      });

    // Update stock item
    builder
      .addCase(thunks.updateStockItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.updateStockItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.menuItemId === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(thunks.updateStockItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle stock status
    builder
      .addCase(thunks.toggleStockStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.toggleStockStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.menuItemId === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(thunks.toggleStockStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Set in stock
    builder
      .addCase(thunks.setInStockStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.setInStockStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.menuItemId === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(thunks.setInStockStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Set out of stock
    builder
      .addCase(thunks.setOutOfStockStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.setOutOfStockStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.menuItemId === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(thunks.setOutOfStockStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setStockItems,
  clearStockError,
  resetStock,
} = stockSlice.actions;

// Export reducer
export default stockSlice.reducer;

// Export state type
export type { StockState } from './stock/stockSelectors';

