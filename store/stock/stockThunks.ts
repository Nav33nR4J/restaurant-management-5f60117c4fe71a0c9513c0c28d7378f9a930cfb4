/**
 * Stock Thunks
 * Async operations for stock management
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCurrentFlavor } from '../../config/config';
import { updateStock as dbUpdateStock, getAllStock, setInStock, setOutOfStock } from '../../database/stock';
import { Loggers } from '../../utils/logger';

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Load all stock for the current branch
 */
export const loadStock = createAsyncThunk(
  'stock/loadStock',
  async () => {
    const branchId = getCurrentFlavor(); // Use flavor as branch identifier
    const stockData = await getAllStock(branchId);
    Loggers.menu.info(`Loaded stock for branch: ${branchId}`);
    return stockData;
  }
);

/**
 * Update stock for a menu item (Branch only)
 */
export const updateStockItem = createAsyncThunk(
  'stock/updateStock',
  async (
    { menuItemId, menuItemName, quantity, inStock }: {
      menuItemId: string;
      menuItemName: string;
      quantity: number;
      inStock: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      await dbUpdateStock(menuItemId, branchId, quantity);
      
      const now = new Date().toISOString();
      
      Loggers.menu.info(`Updated stock for ${menuItemName}: ${inStock ? 'In Stock' : 'Out of Stock'}`);
      
      return {
        id: generateId(),
        menuItemId,
        menuItemName,
        quantity,
        inStock,
        lastUpdated: now,
      };
    } catch (error) {
      Loggers.menu.error('Failed to update stock', error);
      return rejectWithValue('Failed to update stock');
    }
  }
);

/**
 * Toggle stock status (in stock/out of stock)
 */
export const toggleStockStatus = createAsyncThunk(
  'stock/toggleStatus',
  async (
    { menuItemId, menuItemName, currentStatus }: {
      menuItemId: string;
      menuItemName: string;
      currentStatus: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      const newStatus = !currentStatus;
      const quantity = newStatus ? 100 : 0; // Default quantity based on status
      
      await dbUpdateStock(menuItemId, branchId, quantity);
      
      const now = new Date().toISOString();
      
      Loggers.menu.info(`Toggled stock for ${menuItemName}: ${newStatus ? 'In Stock' : 'Out of Stock'}`);
      
      return {
        id: generateId(),
        menuItemId,
        menuItemName,
        quantity,
        inStock: newStatus,
        lastUpdated: now,
      };
    } catch (error) {
      Loggers.menu.error('Failed to toggle stock status', error);
      return rejectWithValue('Failed to toggle stock status');
    }
  }
);

/**
 * Set stock status to in stock
 */
export const setInStockStatus = createAsyncThunk(
  'stock/setInStock',
  async (
    { menuItemId, menuItemName }: { menuItemId: string; menuItemName: string },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      await setInStock(menuItemId, branchId);
      
      const now = new Date().toISOString();
      
      Loggers.menu.info(`Set ${menuItemName} as in stock`);
      
      return {
        id: generateId(),
        menuItemId,
        menuItemName,
        quantity: 100,
        inStock: true,
        lastUpdated: now,
      };
    } catch (error) {
      Loggers.menu.error('Failed to set in stock', error);
      return rejectWithValue('Failed to set in stock');
    }
  }
);

/**
 * Set stock status to out of stock
 */
export const setOutOfStockStatus = createAsyncThunk(
  'stock/setOutOfStock',
  async (
    { menuItemId, menuItemName }: { menuItemId: string; menuItemName: string },
    { rejectWithValue }
  ) => {
    try {
      const branchId = getCurrentFlavor();
      await setOutOfStock(menuItemId, branchId);
      
      const now = new Date().toISOString();
      
      Loggers.menu.info(`Set ${menuItemName} as out of stock`);
      
      return {
        id: generateId(),
        menuItemId,
        menuItemName,
        quantity: 0,
        inStock: false,
        lastUpdated: now,
      };
    } catch (error) {
      Loggers.menu.error('Failed to set out of stock', error);
      return rejectWithValue('Failed to set out of stock');
    }
  }
);

