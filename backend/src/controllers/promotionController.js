/**
 * Promotion Controller - Business Logic
 * Fixed to match frontend expectations (promo_code, start_at, end_at, status, type, value)
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { WARNINGS } = require('../utils/warnings');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

/**
 * Map database fields to API response fields
 */
const mapPromotionFromDB = (promo) => {
  if (!promo) return null;
  
  return {
    id: promo.id,
    promo_code: promo.promo_code || promo.code,
    title: promo.title,
    description: promo.description,
    type: promo.type || (promo.discount_type === 'percentage' ? 'PERCENTAGE' : (promo.discount_type === 'fixed' ? 'FIXED' : 'CUSTOM_ITEMS')),
    value: promo.value !== undefined ? promo.value : promo.discount_value,
    start_at: promo.start_at || promo.start_date,
    end_at: promo.end_at || promo.end_date,
    status: promo.is_active === true ? 'ACTIVE' : (promo.is_active === false ? 'INACTIVE' : (promo.status || 'INACTIVE')),
    is_active: promo.is_active,
    usage_limit: promo.usage_limit,
    usage_count: promo.usage_count || 0,
    min_order_amount: promo.min_order_amount || 0,
    max_discount_amount: promo.max_discount_amount || promo.max_discount,
    custom_items: promo.custom_items,
    created_at: promo.created_at,
    updated_at: promo.updated_at
  };
};

/**
 * Format date for MySQL storage - handles both ISO and local datetime formats
 */
const formatDateForMySQL = (dateInput) => {
  if (!dateInput) return null;
  
  // If it's already in 'YYYY-MM-DD HH:MM:SS' format, return as-is
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
    return dateInput;
  }
  
  // Try to parse as date
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Get All Promotions
 */
const getPromotions = async (req, res, next) => {
  try {
    const { filter } = req.query;
    
    let query = 'SELECT * FROM promotions';
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
    
    // Handle filter parameter from frontend
    if (filter === 'active') {
      // Active: is_active = true AND within date range
      query += ` WHERE is_active = true AND (start_at IS NULL OR start_at <= '${nowStr}') AND (end_at IS NULL OR end_at >= '${nowStr}')`;
    } else if (filter === 'upcoming') {
      // Upcoming: starts in the future
      query += ` WHERE start_at > '${nowStr}'`;
    } else if (filter === 'expired') {
      // Expired: end_date has passed OR is inactive
      query += ` WHERE (is_active = false OR end_at < '${nowStr}')`;
    }

    query += ' ORDER BY created_at DESC';
    
    const [promotions] = await pool.query(query);

    // Map promotions to frontend format
    const mappedPromotions = promotions.map(mapPromotionFromDB);

    return successResponse(res, mappedPromotions);
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

    const promotion = mapPromotionFromDB(promotions[0]);

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
    const { 
      title, 
      description, 
      type, 
      value, 
      min_order_amount, 
      max_discount_amount, 
      promo_code, 
      start_at, 
      end_at, 
      is_active = true,
      custom_items
    } = req.body;

    // Validate required fields
    if (!title || !type) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Title and type are required'));
    }

    // Validate type
    const validTypes = ['PERCENTAGE', 'FIXED', 'CUSTOM_ITEMS'];
    if (!validTypes.includes(type)) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Invalid type. Must be PERCENTAGE, FIXED, or CUSTOM_ITEMS'));
    }

    // Validate start_at and end_at
    if (start_at && end_at) {
      const start = new Date(start_at);
      const end = new Date(end_at);
      
      if (isNaN(start.getTime())) {
        throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Invalid start date format'));
      }
      
      if (isNaN(end.getTime())) {
        throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Invalid end date format'));
      }
      
      if (end < start) {
        throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('End date must be after start date'));
      }
    } else if (start_at && !end_at) {
      const start = new Date(start_at);
      if (isNaN(start.getTime())) {
        throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Invalid start date format'));
      }
    } else if (!start_at && end_at) {
      const end = new Date(end_at);
      if (isNaN(end.getTime())) {
        throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Invalid end date format'));
      }
    }

    // Check for duplicate promo_code
    if (promo_code) {
      const [existing] = await pool.execute('SELECT id FROM promotions WHERE promo_code = ?', [promo_code]);
      if (existing.length > 0) {
        throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Promotion code already exists'));
      }
    }

    const id = generateId();

    // Convert type to lowercase for database
    const discountType = type === 'PERCENTAGE' ? 'percentage' : (type === 'FIXED' ? 'fixed' : 'custom');

    // Format dates for MySQL using helper function
    const startDateStr = formatDateForMySQL(start_at);
    const endDateStr = formatDateForMySQL(end_at);

    // For CUSTOM_ITEMS type, store custom_items as JSON
    let customItemsJson = null;
    if (type === 'CUSTOM_ITEMS' && custom_items) {
      customItemsJson = JSON.stringify({ items: custom_items, combos: [] });
    }

    await pool.execute(
      `INSERT INTO promotions (id, title, description, type, value, min_order_amount, max_discount_amount, promo_code, start_at, end_at, is_active, custom_items) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, type, value || 0, min_order_amount || 0, max_discount_amount, promo_code, startDateStr, endDateStr, is_active, customItemsJson]
    );

    return createdResponse(res, { 
      id, 
      title, 
      promo_code,
      type,
      status: is_active ? 'ACTIVE' : 'INACTIVE'
    }, 'Promotion created successfully');
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
    const { 
      title, 
      description, 
      type, 
      value, 
      min_order_amount, 
      max_discount_amount, 
      promo_code, 
      start_at, 
      end_at, 
      is_active,
      custom_items
    } = req.body;

    const [existing] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.PROMOTION.NOT_FOUND);
    }

    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (type) { 
      const discountType = type === 'PERCENTAGE' ? 'percentage' : (type === 'FIXED' ? 'fixed' : 'custom');
      updates.push('type = ?'); 
      params.push(discountType); 
    }
    if (value !== undefined) { updates.push('value = ?'); params.push(value); }
    if (min_order_amount !== undefined) { updates.push('min_order_amount = ?'); params.push(min_order_amount); }
    if (max_discount_amount !== undefined) { updates.push('max_discount_amount = ?'); params.push(max_discount_amount); }
    if (promo_code) { updates.push('promo_code = ?'); params.push(promo_code); }
    if (start_at !== undefined) { 
      const startDateStr = formatDateForMySQL(start_at);
      updates.push('start_at = ?'); 
      params.push(startDateStr); 
    }
    if (end_at !== undefined) { 
      const endDateStr = formatDateForMySQL(end_at);
      updates.push('end_at = ?'); 
      params.push(endDateStr); 
    }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }
    
    // Handle custom_items for CUSTOM_ITEMS type
    if (custom_items !== undefined) {
      const customItemsJson = JSON.stringify({ items: custom_items, combos: [] });
      updates.push('custom_items = ?');
      params.push(customItemsJson);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.execute(`UPDATE promotions SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Fetch updated promotion
    const [updated] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [id]);
    const mappedPromotion = mapPromotionFromDB(updated[0]);

    return successResponse(res, mappedPromotion, 'Promotion updated successfully');
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
    const { promo_code, order_amount, check_only } = req.body;

    if (!promo_code) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Promotion code is required'));
    }

    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');

    const [promotions] = await pool.execute(
      `SELECT * FROM promotions 
       WHERE promo_code = ? AND is_active = true 
       AND (start_at IS NULL OR start_at <= '${nowStr}')
       AND (end_at IS NULL OR end_at >= '${nowStr}')`,
      [promo_code]
    );

    if (promotions.length === 0) {
      throw new ValidationError(WARNINGS.PROMOTION.CODE_INVALID);
    }

    const promo = promotions[0];

    if (order_amount && promo.min_order_amount && order_amount < promo.min_order_amount) {
      throw new ValidationError(WARNINGS.PROMOTION.MIN_ORDER_NOT_MET);
    }

    // Check usage limit
    if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
      throw new ValidationError("Promotion usage limit exceeded");
    }

    const mappedPromo = mapPromotionFromDB(promo);

    return successResponse(res, {
      valid: true,
      promotion: {
        id: mappedPromo.id,
        title: mappedPromo.title,
        type: mappedPromo.type,
        value: mappedPromo.value,
        min_order_amount: mappedPromo.min_order_amount,
        max_discount_amount: mappedPromo.max_discount_amount,
        custom_items: mappedPromo.custom_items
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Promotion Status
 * When activating an expired promotion, extends the end_date automatically
 */
const togglePromotionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.PROMOTION.NOT_FOUND);
    }

    const currentPromo = existing[0];
    const currentIsActive = currentPromo.is_active === 1 || currentPromo.is_active === true;
    const newIsActive = !currentIsActive;
    
    // Get the end_at date (handle both column names)
    const currentEndDate = currentPromo.end_at || currentPromo.end_date;

    // If activating a promotion with an expired or missing end_date, set it to 30 days from today
    if (newIsActive === true) {
      const endDate = currentEndDate ? new Date(currentEndDate) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const needsExtension = !endDate || (endDate < today);
      
      if (needsExtension) {
        // Set end_date to 30 days from today
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 30);
        const formattedEndDate = newEndDate.toISOString().slice(0, 19).replace('T', ' ');
        
        await pool.execute(
          'UPDATE promotions SET is_active = ?, end_at = ? WHERE id = ?',
          [true, formattedEndDate, id]
        );
        
        // Fetch updated promotion
        const [updated] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [id]);
        const mappedPromotion = mapPromotionFromDB(updated[0]);
        
        return successResponse(res, mappedPromotion, 'Promotion activated and extended successfully');
      }
    }

    await pool.execute('UPDATE promotions SET is_active = ? WHERE id = ?', [newIsActive, id]);

    // Fetch updated promotion
    const [updated] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [id]);
    const mappedPromotion = mapPromotionFromDB(updated[0]);

    return successResponse(res, mappedPromotion, newIsActive ? 'Promotion activated successfully' : 'Promotion deactivated successfully');
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
  validatePromotion,
  togglePromotionStatus
};
