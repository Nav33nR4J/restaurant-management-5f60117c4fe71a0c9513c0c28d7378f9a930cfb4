import * as SQLite from 'expo-sqlite';
import { Loggers } from '../utils/logger';

// Re-export from modular structure
export * from './menuItems';
export * from './seasonalMenus';
export * from './stock';

// ============================================================================
// Database Instance and Initialization (kept in main file)
// ============================================================================

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the SQLite database
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  try {
    Loggers.database.info("Initializing database...");
    db = SQLite.openDatabaseSync('restaurant.db');
    Loggers.database.info("Database opened successfully");

    // Create tables
    await createTables();
    Loggers.database.info("Database tables created successfully");

    return db;
  } catch (error) {
    Loggers.database.error("Failed to initialize database:", error);
    // Return a mock database to prevent app crash
    // The app will use sample data instead
    throw error;
  }
}

/**
 * Create all required tables
 */
export async function createTables(): Promise<void> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    // Menu items table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        basePrice REAL NOT NULL,
        image TEXT,
        category TEXT NOT NULL,
        isAvailable INTEGER DEFAULT 1,
        inStock INTEGER DEFAULT 1,
        seasonalMenuId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Seasonal menus table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS seasonal_menus (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Menu schedules table (time-based switching)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS menu_schedules (
        id TEXT PRIMARY KEY,
        seasonalMenuId TEXT NOT NULL,
        dayOfWeek INTEGER NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        isActive INTEGER DEFAULT 1,
        FOREIGN KEY (seasonalMenuId) REFERENCES seasonal_menus(id)
      );
    `);

    // Stock management table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS stock (
        id TEXT PRIMARY KEY,
        menuItemId TEXT NOT NULL,
        branchId TEXT NOT NULL,
        quantity INTEGER DEFAULT 0,
        lastUpdated TEXT NOT NULL,
        FOREIGN KEY (menuItemId) REFERENCES menu_items(id)
      );
    `);

    Loggers.database.info("All database tables created successfully");
  } catch (error) {
    Loggers.database.error("Failed to create database tables:", error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Close the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    db.closeAsync();
    db = null;
  }
}

/**
 * Clear all data from tables (useful for testing)
 */
export async function clearAllData(): Promise<void> {
  const database = getDatabase();
  
  await database.runAsync('DELETE FROM stock');
  await database.runAsync('DELETE FROM menu_schedules');
  await database.runAsync('DELETE FROM menu_items');
  await database.runAsync('DELETE FROM seasonal_menus');
}

