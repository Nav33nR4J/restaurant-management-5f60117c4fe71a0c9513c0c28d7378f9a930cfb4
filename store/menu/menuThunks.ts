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
 * Load all menu items from database
 */
export const loadMenuItems = createAsyncThunk(
  'menu/loadItems',
  async () => {
    const items = await getAllMenuItems();
    Loggers.menu.info(`Loaded ${items.length} menu items`);
    return items;
  }
);

/**
 * Add a new menu item (HQ only)
 */
export const addMenuItemAsync = createAsyncThunk(
  'menu/addItem',
  async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      const newItem: MenuItem = {
        ...item,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      
      await dbAddMenuItem(newItem);
      Loggers.menu.info(`Added menu item: ${newItem.name}`);
      return newItem;
    } catch (error) {
      Loggers.menu.error('Failed to add menu item', error);
      return rejectWithValue('Failed to add menu item');
    }
  }
);

/**
 * Update an existing menu item (HQ only)
 */
export const updateMenuItemAsync = createAsyncThunk(
  'menu/updateItem',
  async (item: MenuItem, { rejectWithValue }) => {
    try {
      const updatedItem = {
        ...item,
        updatedAt: new Date().toISOString(),
      };
      
      await dbUpdateMenuItem(updatedItem);
      Loggers.menu.info(`Updated menu item: ${updatedItem.name}`);
      return updatedItem;
    } catch (error) {
      Loggers.menu.error('Failed to update menu item', error);
      return rejectWithValue('Failed to update menu item');
    }
  }
);

/**
 * Delete a menu item (HQ only)
 */
export const deleteMenuItemAsync = createAsyncThunk(
  'menu/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await dbDeleteMenuItem(id);
      Loggers.menu.info(`Deleted menu item: ${id}`);
      return id;
    } catch (error) {
      Loggers.menu.error('Failed to delete menu item', error);
      return rejectWithValue('Failed to delete menu item');
    }
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

