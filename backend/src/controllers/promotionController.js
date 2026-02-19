/**
 * Promotion Controller - Business Logic
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { WARNINGS } = require('../utils/warnings');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

/**
 * Get All Promotions
 */
const getPromotions = async (req, res, next) => {
  try {
    const { active_only = 'true', page = 1, limit = 20 } = req.query;
    
    // Ensure proper integer conversion for pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM promotions';
    const params = [];

    if (active_only === 'true') {
      query += ' WHERE is_active = true AND (start_date IS NULL OR start_date <= CURDATE()) AND (end_date IS NULL OR end_date >= CURDATE())';
    }

    query += ' ORDER BY created_at DESC';
    
    // For MySQL2 prepared statements with LIMIT/OFFSET, we need to use query() instead of execute()
    // or cast the values to integers in the query
    const [promotions] = await pool.query(
      query + ' LIMIT ? OFFSET ?',
      [limitNum, offset]
    );

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM promotions';
    if (active_only === 'true') {
      countQuery += ' WHERE is_active = true AND (start_date IS NULL OR start_date <= CURDATE()) AND (end_date IS NULL OR end_date >= CURDATE())';
    }
    const [countResult] = await pool.execute(countQuery);

    return paginatedResponse(res, promotions, pageNum, limitNum, countResult[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Promotion by ID
 */
const getPromotionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [promotions] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [id]);

    if (promotions.length === 0) {
      throw new NotFoundError(WARNINGS.PROMOTION.NOT_FOUND);
    }

    // Get promotion items
    const [items] = await pool.execute(
      `SELECT pi.*, m.name as item_name, c.name as category_name
       FROM promotion_items pi
       LEFT JOIN menu_items m ON pi.menu_item_id = m.id
       LEFT JOIN categories c ON pi.category_id = c.id
       WHERE pi.promotion_id = ?`,
      [id]
    );

    const promotion = promotions[0];
    promotion.items = items;

    return successResponse(res, promotion);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Promotion
 */
const createPromotion = async (req, res, next) => {
  try {
    const { title, description, discount_type, discount_value, min_order_amount, max_discount, code, start_date, end_date, is_active = true, menu_item_ids, category_ids } = req.body;

    if (!title || !discount_type || !discount_value) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Title, discount_type, and discount_value are required'));
    }

    if (!['percentage', 'fixed'].includes(discount_type)) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Invalid discount_type'));
    }

    // Check for duplicate code
    if (code) {
      const [existing] = await pool.execute('SELECT id FROM promotions WHERE code = ?', [code]);
      if (existing.length > 0) {
        throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Promotion code already exists'));
      }
    }

    const id = generateId();

    await pool.execute(
      `INSERT INTO promotions (id, title, description, discount_type, discount_value, min_order_amount, max_discount, code, start_date, end_date, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, discount_type, discount_value, min_order_amount || 0, max_discount, code, start_date, end_date, is_active]
    );

    // Add promotion items if provided
    if (menu_item_ids?.length > 0 || category_ids?.length > 0) {
      for (const itemId of menu_item_ids || []) {
        const itemIdGenerated = generateId();
        await pool.execute(
          'INSERT INTO promotion_items (id, promotion_id, menu_item_id) VALUES (?, ?, ?)',
          [itemIdGenerated, id, itemId]
        );
      }
      for (const catId of category_ids || []) {
        const catIdGenerated = generateId();
        await pool.execute(
          'INSERT INTO promotion_items (id, promotion_id, category_id) VALUES (?, ?, ?)',
          [catIdGenerated, id, catId]
        );
      }
    }

    return createdResponse(res, { id, title, code }, 'Promotion created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Promotion
 */
const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, discount_type, discount_value, min_order_amount, max_discount, code, start_date, end_date, is_active } = req.body;

    const [existing] = await pool.execute('SELECT id FROM promotions WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.PROMOTION.NOT_FOUND);
    }

    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (discount_type) { updates.push('discount_type = ?'); params.push(discount_type); }
    if (discount_value) { updates.push('discount_value = ?'); params.push(discount_value); }
    if (min_order_amount !== undefined) { updates.push('min_order_amount = ?'); params.push(min_order_amount); }
    if (max_discount !== undefined) { updates.push('max_discount = ?'); params.push(max_discount); }
    if (code) { updates.push('code = ?'); params.push(code); }
    if (start_date !== undefined) { updates.push('start_date = ?'); params.push(start_date); }
    if (end_date !== undefined) { updates.push('end_date = ?'); params.push(end_date); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

    if (updates.length > 0) {
      params.push(id);
      await pool.execute(`UPDATE promotions SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return successResponse(res, { id }, 'Promotion updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Promotion
 */
const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT id FROM promotions WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.PROMOTION.NOT_FOUND);
    }

    // Delete promotion items first
    await pool.execute('DELETE FROM promotion_items WHERE promotion_id = ?', [id]);
    await pool.execute('DELETE FROM promotions WHERE id = ?', [id]);

    return successResponse(res, null, 'Promotion deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Validate Promotion Code
 */
const validatePromotion = async (req, res, next) => {
  try {
    const { code, order_amount } = req.body;

    if (!code) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Promotion code is required'));
    }

    const [promotions] = await pool.execute(
      `SELECT * FROM promotions 
       WHERE code = ? AND is_active = true 
       AND (start_date IS NULL OR start_date <= CURDATE())
       AND (end_date IS NULL OR end_date >= CURDATE())`,
      [code]
    );

    if (promotions.length === 0) {
      throw new ValidationError(WARNINGS.PROMOTION.CODE_INVALID);
    }

    const promo = promotions[0];

    if (order_amount && order_amount < promo.min_order_amount) {
      throw new ValidationError(WARNINGS.PROMOTION.MIN_ORDER_NOT_MET);
    }

    return successResponse(res, {
      valid: true,
      promotion: {
        id: promo.id,
        title: promo.title,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: parseFloat(promo.discount_value),
        min_order_amount: parseFloat(promo.min_order_amount),
        max_discount: promo.max_discount ? parseFloat(promo.max_discount) : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion
};
