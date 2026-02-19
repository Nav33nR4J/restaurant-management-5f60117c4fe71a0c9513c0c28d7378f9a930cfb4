/**
 * Menu Controller - Business Logic
 * All menu-related operations
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { WARNINGS } = require('../utils/warnings');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

/**
 * Get All Categories
 */
const getCategories = async (req, res, next) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC'
    );
    return successResponse(res, categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Menu Items with optional filtering
 */
const getMenuItems = async (req, res, next) => {
  try {
    const { category_id, page = 1, limit = 20, branch_code } = req.query;
    // Ensure proper integer conversion for pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT m.*, c.name as category_name,
             COALESCE(bp.price, m.price) as final_price
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN branch_pricing bp ON m.id = bp.menu_item_id AND bp.branch_code = ?
      WHERE m.is_available = true
    `;
    const params = [branch_code || 'default'];

    if (category_id) {
      query += ' AND m.category_id = ?';
      params.push(category_id);
    }

    query += ' ORDER BY m.created_at DESC';
    
    // Use pool.query() instead of pool.execute() for LIMIT/OFFSET with prepared statements
    const [items] = await pool.query(
      query + ' LIMIT ? OFFSET ?',
      [...params, limitNum, offset]
    );

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM menu_items WHERE is_available = true';
    const countParams = [];
    if (category_id) {
      countQuery += ' AND category_id = ?';
      countParams.push(category_id);
    }
    const [countResult] = await pool.execute(countQuery, countParams);

    return paginatedResponse(res, items, pageNum, limitNum, countResult[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Menu Item by ID
 */
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { branch_code } = req.query;

    const [items] = await pool.execute(
      `SELECT m.*, c.name as category_name,
              COALESCE(bp.price, m.price) as final_price
       FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       LEFT JOIN branch_pricing bp ON m.id = bp.menu_item_id AND bp.branch_code = ?
       WHERE m.id = ?`,
      [branch_code || 'default', id]
    );

    if (items.length === 0) {
      throw new NotFoundError(WARNINGS.MENU.ITEM_NOT_FOUND);
    }

    return successResponse(res, items[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Search Menu Items
 */
const searchMenuItems = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    const [items] = await pool.execute(
      `SELECT * FROM menu_items 
       WHERE is_available = true 
       AND (name LIKE ? OR description LIKE ?)
       LIMIT ?`,
      [`%${q}%`, `%${q}%`, parseInt(limit)]
    );

    return successResponse(res, items);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Seasonal Items
 */
const getSeasonalItems = async (req, res, next) => {
  try {
    const [items] = await pool.execute(
      `SELECT * FROM menu_items 
       WHERE is_seasonal = true AND is_available = true`
    );

    return successResponse(res, items);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Special Items
 */
const getSpecialItems = async (req, res, next) => {
  try {
    const [items] = await pool.execute(
      `SELECT * FROM menu_items 
       WHERE is_special = true AND is_available = true`
    );

    return successResponse(res, items);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Category (Admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image_url, sort_order = 0 } = req.body;
    const id = generateId();

    await pool.execute(
      'INSERT INTO categories (id, name, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [id, name, description, image_url, sort_order]
    );

    return createdResponse(res, { id, name }, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create Menu Item (Admin)
 */
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category_id, image_url, is_vegetarian, is_special, is_seasonal } = req.body;
    
    if (!name || !price) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Name and price are required'));
    }

    const id = generateId();

    await pool.execute(
      `INSERT INTO menu_items (id, name, description, price, category_id, image_url, is_vegetarian, is_special, is_seasonal) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, description, price, category_id, image_url, is_vegetarian || false, is_special || false, is_seasonal || false]
    );

    return createdResponse(res, { id, name, price }, 'Menu item created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Menu Item (Admin)
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, image_url, is_vegetarian, is_special, is_seasonal } = req.body;

    const [existing] = await pool.execute('SELECT id FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.MENU.ITEM_NOT_FOUND);
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (price) { updates.push('price = ?'); params.push(price); }
    if (category_id) { updates.push('category_id = ?'); params.push(category_id); }
    if (image_url !== undefined) { updates.push('image_url = ?'); params.push(image_url); }
    if (is_vegetarian !== undefined) { updates.push('is_vegetarian = ?'); params.push(is_vegetarian); }
    if (is_special !== undefined) { updates.push('is_special = ?'); params.push(is_special); }
    if (is_seasonal !== undefined) { updates.push('is_seasonal = ?'); params.push(is_seasonal); }

    if (updates.length > 0) {
      params.push(id);
      await pool.execute(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return successResponse(res, { id }, 'Menu item updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Menu Item (Admin)
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT id FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.MENU.ITEM_NOT_FOUND);
    }

    await pool.execute('DELETE FROM menu_items WHERE id = ?', [id]);

    return successResponse(res, null, 'Menu item deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Item Availability (Admin)
 */
const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;

    const [existing] = await pool.execute('SELECT id FROM menu_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.MENU.ITEM_NOT_FOUND);
    }

    await pool.execute('UPDATE menu_items SET is_available = ? WHERE id = ?', [is_available, id]);

    return successResponse(res, { id, is_available }, 'Availability toggled successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getMenuItems,
  getMenuItemById,
  searchMenuItems,
  getSeasonalItems,
  getSpecialItems,
  createCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
};
