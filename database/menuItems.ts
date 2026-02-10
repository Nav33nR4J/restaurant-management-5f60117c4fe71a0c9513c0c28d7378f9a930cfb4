/**
 * Menu Items Database Operations
 * CRUD operations for menu items
 */

import * as SQLite from 'expo-sqlite';
import { MenuItem } from '../config/config';

// Get database instance
function getDatabase(): SQLite.SQLiteDatabase {
  // Dynamic import to avoid circular dependency
  const { getDatabase: dbGetter } = require('./db');
  return dbGetter();
}

// Menu item row type (internal to this module)
interface MenuItemRow {
  id: string;
  name: string;
  description: string;
  price: number;
  basePrice: number;
  image: string;
  category: string;
  isAvailable: number;
  inStock: number;
  seasonalMenuId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add a new menu item
 */
export async function addMenuItem(item: MenuItem): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    `INSERT INTO menu_items (id, name, description, price, basePrice, image, category, isAvailable, inStock, seasonalMenuId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.name,
      item.description,
      item.price,
      item.basePrice,
      item.image,
      item.category,
      item.isAvailable ? 1 : 0,
      item.inStock ? 1 : 0,
      item.seasonalMenuId || null,
      item.createdAt,
      item.updatedAt,
    ]
  );
}

/**
 * Get all menu items
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<MenuItemRow>(
    'SELECT * FROM menu_items ORDER BY category, name'
  );
  
  return result.map(row => ({
    ...row,
    isAvailable: Boolean(row.isAvailable),
    inStock: Boolean(row.inStock),
    seasonalMenuId: row.seasonalMenuId || undefined,
  }));
}

/**
 * Get menu item by ID
 */
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const database = getDatabase();
  
  const result = await database.getFirstAsync<MenuItemRow>(
    'SELECT * FROM menu_items WHERE id = ?',
    [id]
  );
  
  if (!result) return null;
  
  return {
    ...result,
    isAvailable: Boolean(result.isAvailable),
    inStock: Boolean(result.inStock),
    seasonalMenuId: result.seasonalMenuId || undefined,
  };
}

/**
 * Update a menu item
 */
export async function updateMenuItem(item: MenuItem): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    `UPDATE menu_items SET 
      name = ?, description = ?, price = ?, basePrice = ?, image = ?, 
      category = ?, isAvailable = ?, inStock = ?, seasonalMenuId = ?, updatedAt = ?
     WHERE id = ?`,
    [
      item.name,
      item.description,
      item.price,
      item.basePrice,
      item.image,
      item.category,
      item.isAvailable ? 1 : 0,
      item.inStock ? 1 : 0,
      item.seasonalMenuId || null,
      item.updatedAt,
      item.id,
    ]
  );
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync('DELETE FROM menu_items WHERE id = ?', [id]);
}

/**
 * Assign a menu item to a seasonal menu
 */
export async function assignMenuItemToSeasonalMenu(
  menuItemId: string,
  seasonalMenuId: string
): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    'UPDATE menu_items SET seasonalMenuId = ?, updatedAt = ? WHERE id = ?',
    [seasonalMenuId, new Date().toISOString(), menuItemId]
  );
}

/**
 * Remove a menu item from a seasonal menu (make it a regular item)
 */
export async function removeMenuItemFromSeasonalMenu(menuItemId: string): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync(
    'UPDATE menu_items SET seasonalMenuId = NULL, updatedAt = ? WHERE id = ?',
    [new Date().toISOString(), menuItemId]
  );
}

/**
 * Get menu items by seasonal menu ID
 */
export async function getMenuItemsBySeasonalMenu(seasonalMenuId: string): Promise<MenuItem[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<MenuItemRow>(
    'SELECT * FROM menu_items WHERE seasonalMenuId = ?',
    [seasonalMenuId]
  );
  
  return result.map(row => ({
    ...row,
    isAvailable: Boolean(row.isAvailable),
    inStock: Boolean(row.inStock),
    seasonalMenuId: row.seasonalMenuId || undefined,
  }));
}

/**
 * Get menu items by category
 */
export async function getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
  const database = getDatabase();
  
  const result = await database.getAllAsync<MenuItemRow>(
    'SELECT * FROM menu_items WHERE category = ? ORDER BY name',
    [category]
  );
  
  return result.map(row => ({
    ...row,
    isAvailable: Boolean(row.isAvailable),
    inStock: Boolean(row.inStock),
    seasonalMenuId: row.seasonalMenuId || undefined,
  }));
}

export type { MenuItemRow };
