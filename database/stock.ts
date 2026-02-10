/**
 * Stock Database Operations
 * CRUD operations for stock management
 */

import * as SQLite from 'expo-sqlite';
import { Loggers } from '../utils/logger';

// Get database instance with lazy initialization
let _db: SQLite.SQLiteDatabase | null = null;

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    // Try to initialize the database if not already done
    try {
      const { initDatabase } = require('./db');
      const db = await initDatabase();
      _db = db;
    } catch (error) {
      Loggers.database.error("Failed to initialize database:", error);
      throw new Error('Database not initialized. Call initDatabase() first.');
    }
  }
  return _db!;
}

// Stock row type
export interface StockRow {
  id: string;
  menuItemId: string;
  branchId: string;
  quantity: number;
  lastUpdated: string;
}

/**
 * Update stock for a menu item
 */
export async function updateStock(menuItemId: string, branchId: string, quantity: number): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  
  // Upsert stock record
  await database.runAsync(
    `INSERT OR REPLACE INTO stock (id, menuItemId, branchId, quantity, lastUpdated)
     VALUES (?, ?, ?, ?, ?)`,
    [`${branchId}_${menuItemId}`, menuItemId, branchId, quantity, now]
  );
}

/**
 * Get stock for a menu item in a branch
 */
export async function getStock(menuItemId: string, branchId: string): Promise<number> {
  const database = await getDatabase();
  
  const result = await database.getFirstAsync<StockRow>(
    'SELECT quantity FROM stock WHERE menuItemId = ? AND branchId = ?',
    [menuItemId, branchId]
  );
  
  return result?.quantity ?? 0;
}

/**
 * Get all stock for a branch
 */
export async function getAllStock(branchId: string): Promise<{ menuItemId: string; quantity: number }[]> {
  const database = await getDatabase();
  
  const result = await database.getAllAsync<StockRow>(
    'SELECT menuItemId, quantity FROM stock WHERE branchId = ?',
    [branchId]
  );
  
  return result.map((row: StockRow) => ({
    menuItemId: row.menuItemId,
    quantity: row.quantity,
  }));
}

/**
 * Set menu item as in stock
 */
export async function setInStock(menuItemId: string, branchId: string): Promise<void> {
  return updateStock(menuItemId, branchId, 100); // Default in-stock quantity
}

/**
 * Set menu item as out of stock
 */
export async function setOutOfStock(menuItemId: string, branchId: string): Promise<void> {
  return updateStock(menuItemId, branchId, 0);
}

/**
 * Check if menu item is in stock
 */
export async function isInStock(menuItemId: string, branchId: string): Promise<boolean> {
  const quantity = await getStock(menuItemId, branchId);
  return quantity > 0;
}

/**
 * Delete all stock records for a menu item
 */
export async function deleteStockByMenuItem(menuItemId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM stock WHERE menuItemId = ?', [menuItemId]);
}

/**
 * Delete all stock records for a branch
 */
export async function deleteStockByBranch(branchId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM stock WHERE branchId = ?', [branchId]);
}

export default {
  updateStock,
  getStock,
  getAllStock,
  setInStock,
  setOutOfStock,
  isInStock,
  deleteStockByMenuItem,
  deleteStockByBranch,
};

