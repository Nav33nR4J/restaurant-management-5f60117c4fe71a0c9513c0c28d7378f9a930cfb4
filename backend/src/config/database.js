/**
 * Database Configuration - MySQL Connection
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'delivery_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test Connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize Database Schema
const initDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    // Users Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('customer', 'admin', 'driver') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Categories Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Menu Items Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id VARCHAR(36),
        image_url VARCHAR(500),
        is_available BOOLEAN DEFAULT true,
        is_vegetarian BOOLEAN DEFAULT false,
        is_special BOOLEAN DEFAULT false,
        is_seasonal BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    // Branch Pricing Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS branch_pricing (
        id VARCHAR(36) PRIMARY KEY,
        menu_item_id VARCHAR(36) NOT NULL,
        branch_code VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
        UNIQUE KEY unique_branch_item (menu_item_id, branch_code)
      )
    `);

    // Cart Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS carts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        session_id VARCHAR(255),
        menu_item_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      )
    `);

    // Orders Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        session_id VARCHAR(255),
        status ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        delivery_address TEXT,
        delivery_phone VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Order Items Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        menu_item_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        notes TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      )
    `);

    // Promotions Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS promotions (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type ENUM('percentage', 'fixed') NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_order_amount DECIMAL(10,2) DEFAULT 0,
        max_discount DECIMAL(10,2),
        code VARCHAR(50) UNIQUE,
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Promotion Items Table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS promotion_items (
        id VARCHAR(36) PRIMARY KEY,
        promotion_id VARCHAR(36) NOT NULL,
        menu_item_id VARCHAR(36),
        category_id VARCHAR(36),
        FOREIGN KEY (promotion_id) REFERENCES promotions(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);

    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  } finally {
    connection.release();
  }
};

module.exports = { pool, testConnection, initDatabase };
