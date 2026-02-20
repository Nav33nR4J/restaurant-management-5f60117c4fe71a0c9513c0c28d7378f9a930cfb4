/**
 * Menu Async Thunks
 * Async operations for menu management
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { MenuItem, SeasonalMenu } from '../../config/config';
import {
  assignMenuItemToSeasonalMenu,
  addMenuItem as dbAddMenuItem,
  addSeasonalMenu as dbAddSeasonalMenu,
  deleteMenuItem as dbDeleteMenuItem,
  deleteSeasonalMenu as dbDeleteSeasonalMenu,
  updateMenuItem as dbUpdateMenuItem,
  updateSeasonalMenu as dbUpdateSeasonalMenu,
  getAllMenuItems,
  getAllSeasonalMenus,
  initDatabase,
  removeMenuItemFromSeasonalMenu,
} from '../../database/db';
import { Loggers } from '../../utils/logger';
import { menuApi } from '../../utils/promotions/api';

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Initialize the menu database
 */
export const initializeMenuDatabase = createAsyncThunk(
  'menu/initializeDatabase',
  async () => {
    await initDatabase();
    Loggers.menu.info('Menu database initialized');
  }
);

/**
 * Transform backend menu item to frontend format
 */
const transformBackendMenuItem = (backendItem: any): MenuItem => {
  const now = new Date().toISOString();
  return {
    id: backendItem.id,
    name: backendItem.name,
    description: backendItem.description || '',
    price: parseFloat(backendItem.final_price || backendItem.price || 0),
    basePrice: parseFloat(backendItem.price || 0),
    image: backendItem.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    category: backendItem.category_name || backendItem.category || 'Uncategorized',
    isAvailable: backendItem.is_available !== false,
    inStock: backendItem.is_available !== false,
    seasonalMenuId: undefined,
    createdAt: backendItem.created_at || now,
    updatedAt: backendItem.updated_at || now,
  };
};

/**
 * Load all menu items - tries backend API first, falls back to local DB
 */
export const loadMenuItems = createAsyncThunk(
  'menu/loadItems',
  async (_, { rejectWithValue }) => {
    try {
      // Try to fetch ALL items from backend API (use high limit to get all)
      const response = await menuApi.getAll();
      if (response.data && response.data.success) {
        // Handle both paginated and non-paginated responses
        const backendItems = response.data.data || [];
        const transformedItems = backendItems.map(transformBackendMenuItem);
        
        // Try to sync to local DB for offline use (best effort)
        try {
          await initDatabase();
          for (const item of transformedItems) {
            try {
              await dbAddMenuItem(item);
            } catch (e) {
              // Item might already exist, ignore
            }
          }
          Loggers.menu.info(`Loaded ${transformedItems.length} menu items from backend API`);
        } catch (dbError) {
          Loggers.menu.warn('Failed to sync to local DB, using backend data only');
        }
        
        return transformedItems;
      }
    } catch (error: any) {
      Loggers.menu.warn('Failed to fetch from backend API, falling back to local DB:', error.message);
    }
    
    // Fallback to local SQLite database
    try {
      const localItems = await getAllMenuItems();
      Loggers.menu.info(`Loaded ${localItems.length} menu items from local DB`);
      return localItems;
    } catch (localError: any) {
      Loggers.menu.error('Failed to load from local DB:', localError);
      return rejectWithValue('Failed to load menu items from both API and local DB');
    }
  }
);

/**
 * Add a new menu item (HQ only) - saves to backend API
 */
export const addMenuItemAsync = createAsyncThunk(
  'menu/addItem',
  async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      // Try to create on backend API first
      const response = await menuApi.create({
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: item.category, // Backend expects category_id, frontend uses category name
        image_url: item.image,
        is_vegetarian: false,
        is_special: false,
        is_seasonal: false,
      });
      
      if (response.data && response.data.success) {
        const now = new Date().toISOString();
        const newItem: MenuItem = {
          ...item,
          id: response.data.data?.id || generateId(),
          createdAt: now,
          updatedAt: now,
        };
        Loggers.menu.info(`Added menu item to backend: ${item.name}`);
        return newItem;
      }
    } catch (error: any) {
      Loggers.menu.warn('Failed to add to backend, falling back to local DB:', error.message);
    }
    
    // Fallback to local SQLite if backend fails
    try {
      const now = new Date().toISOString();
      const newItem: MenuItem = {
        ...item,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      
      await dbAddMenuItem(newItem);
      Loggers.menu.info(`Added menu item to local DB: ${newItem.name}`);
      return newItem;
    } catch (error) {
      Loggers.menu.error('Failed to add menu item', error);
      return rejectWithValue('Failed to add menu item');
    }
  }
);

/**
 * Update an existing menu item (HQ only) - updates backend API
 */
export const updateMenuItemAsync = createAsyncThunk(
  'menu/updateItem',
  async (item: MenuItem, { rejectWithValue }) => {
    try {
      // Try to update on backend API first
      await menuApi.update(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        category_id: item.category,
        image_url: item.image,
        is_available: item.isAvailable,
      });
      Loggers.menu.info(`Updated menu item on backend: ${item.name}`);
    } catch (error: any) {
      Loggers.menu.warn('Failed to update on backend, updating local DB only:', error.message);
    }
    
    // Also update local SQLite
    try {
      const updatedItem = {
        ...item,
        updatedAt: new Date().toISOString(),
      };
      
      await dbUpdateMenuItem(updatedItem);
      Loggers.menu.info(`Updated menu item on local DB: ${updatedItem.name}`);
      return updatedItem;
    } catch (error) {
      Loggers.menu.error('Failed to update menu item', error);
      return rejectWithValue('Failed to update menu item');
    }
  }
);

/**
 * Delete a menu item (HQ only) - deletes from backend API
 */
export const deleteMenuItemAsync = createAsyncThunk(
  'menu/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      // Try to delete from backend API first
      await menuApi.delete(id);
      Loggers.menu.info(`Deleted menu item from backend: ${id}`);
    } catch (error: any) {
      Loggers.menu.warn('Failed to delete from backend, trying local DB:', error.message);
    }
    
    // Also delete from local SQLite
    try {
      await dbDeleteMenuItem(id);
      Loggers.menu.info(`Deleted menu item from local DB: ${id}`);
    } catch (error) {
      Loggers.menu.error('Failed to delete menu item from local DB', error);
      return rejectWithValue('Failed to delete menu item');
    }
    
    return id;
  }
);

/**
 * Load all seasonal menus from database
 */
export const loadSeasonalMenus = createAsyncThunk(
  'menu/loadSeasonalMenus',
  async () => {
    const menus = await getAllSeasonalMenus();
    Loggers.menu.info(`Loaded ${menus.length} seasonal menus`);
    return menus;
  }
);

/**
 * Add a new seasonal menu (HQ only)
 */
export const addSeasonalMenuAsync = createAsyncThunk(
  'menu/addSeasonalMenu',
  async (
    menu: Omit<SeasonalMenu, 'id' | 'createdAt' | 'updatedAt' | 'items'>,
    { rejectWithValue }
  ) => {
    try {
      const now = new Date().toISOString();
      const newMenu: SeasonalMenu = {
        ...menu,
        id: generateId(),
        items: [],
        createdAt: now,
        updatedAt: now,
      };
      
      await dbAddSeasonalMenu(newMenu);
      Loggers.menu.info(`Added seasonal menu: ${newMenu.name}`);
      return newMenu;
    } catch (error) {
      Loggers.menu.error('Failed to add seasonal menu', error);
      return rejectWithValue('Failed to add seasonal menu');
    }
  }
);

/**
 * Update an existing seasonal menu (HQ only)
 */
export const updateSeasonalMenuAsync = createAsyncThunk(
  'menu/updateSeasonalMenu',
  async (menu: SeasonalMenu, { rejectWithValue }) => {
    try {
      const updatedMenu = {
        ...menu,
        updatedAt: new Date().toISOString(),
      };
      
      await dbUpdateSeasonalMenu(updatedMenu);
      Loggers.menu.info(`Updated seasonal menu: ${updatedMenu.name}`);
      return updatedMenu;
    } catch (error) {
      Loggers.menu.error('Failed to update seasonal menu', error);
      return rejectWithValue('Failed to update seasonal menu');
    }
  }
);

/**
 * Delete a seasonal menu (HQ only)
 */
export const deleteSeasonalMenuAsync = createAsyncThunk(
  'menu/deleteSeasonalMenu',
  async (id: string, { rejectWithValue }) => {
    try {
      await dbDeleteSeasonalMenu(id);
      Loggers.menu.info(`Deleted seasonal menu: ${id}`);
      return id;
    } catch (error) {
      Loggers.menu.error('Failed to delete seasonal menu', error);
      return rejectWithValue('Failed to delete seasonal menu');
    }
  }
);

/**
 * Refresh current seasonal menu based on time
 */
export const refreshCurrentSeasonalMenu = createAsyncThunk(
  'menu/refreshCurrentSeasonalMenu',
  async (_, { getState }) => {
    // Properly type the state access to avoid issues with incomplete state
    const state = getState() as { menu: { seasonalMenus: import('../../config/config').SeasonalMenu[] } };
    const seasonalMenus = state.menu?.seasonalMenus || [];
    
    // Create manager locally for computation (not stored in Redux)
    const { createSeasonalMenuManager } = await import('../../utils/seasonalMenu');
    const manager = createSeasonalMenuManager(seasonalMenus);
    const currentMenu = manager.getCurrentSeasonalMenu();
    const activeMenus = manager.getAllCurrentlyActiveMenus();
    
    return { currentMenu, activeMenus };
  }
);

/**
 * Assign a menu item to a seasonal menu (HQ only)
 */
export const assignItemToSeasonalMenuAsync = createAsyncThunk(
  'menu/assignItemToSeasonalMenu',
  async (
    { menuItemId, seasonalMenuId }: { menuItemId: string; seasonalMenuId: string },
    { rejectWithValue }
  ) => {
    try {
      await assignMenuItemToSeasonalMenu(menuItemId, seasonalMenuId);
      
      Loggers.menu.info(`Assigned item ${menuItemId} to seasonal menu`);
      
      return { menuItemId, seasonalMenuId };
    } catch (error) {
      Loggers.menu.error('Failed to assign item to seasonal menu', error);
      return rejectWithValue('Failed to assign item to seasonal menu');
    }
  }
);

/**
 * Remove a menu item from a seasonal menu (HQ only)
 */
export const removeItemFromSeasonalMenuAsync = createAsyncThunk(
  'menu/removeItemFromSeasonalMenu',
  async (menuItemId: string, { rejectWithValue }) => {
    try {
      await removeMenuItemFromSeasonalMenu(menuItemId);
      Loggers.menu.info(`Removed item ${menuItemId} from seasonal menu`);
      return menuItemId;
    } catch (error) {
      Loggers.menu.error('Failed to remove item from seasonal menu', error);
      return rejectWithValue('Failed to remove item from seasonal menu');
    }
  }
);

