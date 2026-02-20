/**
 * Promotion Saga Service - Saga pattern for promotion operations
 * 
 * Operations:
 * 1. Create Promotion - Create a new promotion
 * 2. Update Promotion - Update promotion details
 * 3. Delete Promotion - Delete promotion with cleanup
 * 4. Toggle Status - Activate/deactivate promotion
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { createSaga } = require('./sagaOrchestrator');
const { WARNINGS } = require('../utils/warnings');

/**
 * Helper to format date for MySQL
 */
const formatDateForMySQL = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
    return dateInput;
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Create Promotion Saga
 */
const createPromotion = async (payload) => {
  const { title, description, type, value, min_order_amount, max_discount_amount, promo_code, start_at, end_at, is_active, custom_items } = payload;
  const sagaId = generateId();

  // Validate dates
  const validateDates = async (p) => {
    if (p.start_at && p.end_at) {
      const start = new Date(p.start_at);
      const end = new Date(p.end_at);
      if (end < start) {
        throw new Error('End date must be after start date');
      }
    }
    return { success: true, data: { dates_valid: true } };
  };

  const compensateValidateDates = async () => ({ success: true });

  // Check for duplicate promo code
  const checkDuplicate = async (p) => {
    if (p.promo_code) {
      const [existing] = await pool.execute(
        'SELECT id FROM promotions WHERE promo_code = ?',
        [p.promo_code]
      );
      if (existing.length > 0) {
        throw new Error('Promotion code already exists');
      }
    }
    return { success: true, data: { promo_code: p.promo_code } };
  };

  const compensateCheckDuplicate = async () => ({ success: true });

  // Create promotion
  const createPromotionDB = async (p) => {
    const id = generateId();
    const discountType = p.type === 'PERCENTAGE' ? 'percentage' : (p.type === 'FIXED' ? 'fixed' : 'custom');
    
    let customItemsJson = null;
    if (p.type === 'CUSTOM_ITEMS' && p.custom_items) {
      customItemsJson = JSON.stringify({ items: p.custom_items, combos: [] });
    }

    await pool.execute(
      `INSERT INTO promotions (id, title, description, type, value, min_order_amount, max_discount_amount, promo_code, start_at, end_at, is_active, custom_items) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, p.title, p.description, p.type, p.value || 0, p.min_order_amount || 0, p.max_discount_amount, p.promo_code, 
       formatDateForMySQL(p.start_at), formatDateForMySQL(p.end_at), p.is_active !== false, customItemsJson]
    );

    return {
      success: true,
      data: { id, title: p.title, promo_code: p.promo_code },
      compensation: { promotion_id: id }
    };
  };

  const compensateCreatePromotion = async (compData) => {
    await pool.execute('DELETE FROM promotions WHERE id = ?', [compData.promotion_id]);
    return { success: true, message: 'Promotion deleted' };
  };

  const saga = createSaga('promotion_create', sagaId)
    .addStep('validate_dates', validateDates, compensateValidateDates, payload)
    .addStep('check_duplicate', checkDuplicate, compensateCheckDuplicate, { dependsOn: 'validate_dates' })
    .addStep('create_promotion', createPromotionDB, compensateCreatePromotion, { dependsOn: 'check_duplicate' });

  return await saga.execute(payload);
};

/**
 * Update Promotion Saga
 */
const updatePromotion = async (payload) => {
  const { promotion_id, title, description, type, value, min_order_amount, max_discount_amount, promo_code, start_at, end_at, is_active, custom_items } = payload;
  const sagaId = generateId();

  // Get current state
  const getCurrentState = async (p) => {
    const [existing] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [p.promotion_id]);
    if (existing.length === 0) {
      throw new Error(WARNINGS.PROMOTION.NOT_FOUND);
    }
    return {
      success: true,
      data: { current: existing[0] },
      compensation: { promotion_id: p.promotion_id, original: existing[0] }
    };
  };

  const compensateGetCurrentState = async () => ({ success: true });

  // Validate dates if provided
  const validateDates = async (p) => {
    if (p.start_at && p.end_at) {
      const start = new Date(p.start_at);
      const end = new Date(p.end_at);
      if (end < start) {
        throw new Error('End date must be after start date');
      }
    }
    return { success: true, data: { dates_valid: true } };
  };

  const compensateValidateDates = async () => ({ success: true });

  // Update promotion
  const updatePromotionDB = async (p) => {
    const updates = [];
    const params = [];

    if (p.title) { updates.push('title = ?'); params.push(p.title); }
    if (p.description !== undefined) { updates.push('description = ?'); params.push(p.description); }
    if (p.type) { 
      const discountType = p.type === 'PERCENTAGE' ? 'percentage' : (p.type === 'FIXED' ? 'fixed' : 'custom');
      updates.push('type = ?'); 
      params.push(discountType); 
    }
    if (p.value !== undefined) { updates.push('value = ?'); params.push(p.value); }
    if (p.min_order_amount !== undefined) { updates.push('min_order_amount = ?'); params.push(p.min_order_amount); }
    if (p.max_discount_amount !== undefined) { updates.push('max_discount_amount = ?'); params.push(p.max_discount_amount); }
    if (p.promo_code) { updates.push('promo_code = ?'); params.push(p.promo_code); }
    if (p.start_at !== undefined) { 
      updates.push('start_at = ?'); 
      params.push(formatDateForMySQL(p.start_at)); 
    }
    if (p.end_at !== undefined) { 
      updates.push('end_at = ?'); 
      params.push(formatDateForMySQL(p.end_at)); 
    }
    if (p.is_active !== undefined) { updates.push('is_active = ?'); params.push(p.is_active); }
    if (p.custom_items !== undefined) {
      const customItemsJson = JSON.stringify({ items: p.custom_items, combos: [] });
      updates.push('custom_items = ?');
      params.push(customItemsJson);
    }

    if (updates.length > 0) {
      params.push(p.promotion_id);
      await pool.execute(`UPDATE promotions SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return {
      success: true,
      data: { updated: true },
      compensation: { promotion_id: p.promotion_id }
    };
  };

  const compensateUpdatePromotion = async (compData) => {
    const orig = compData.original;
    if (orig) {
      await pool.execute(
        `UPDATE promotions SET title = ?, description = ?, type = ?, value = ?, 
         min_order_amount = ?, max_discount_amount = ?, promo_code = ?, start_at = ?, 
         end_at = ?, is_active = ?, custom_items = ? WHERE id = ?`,
        [orig.title, orig.description, orig.type, orig.value, orig.min_order_amount, 
         orig.max_discount_amount, orig.promo_code, orig.start_at, orig.end_at, orig.is_active, orig.custom_items, compData.promotion_id]
      );
    }
    return { success: true, message: 'Promotion restored' };
  };

  const saga = createSaga('promotion_update', sagaId)
    .addStep('get_current_state', getCurrentState, compensateGetCurrentState, payload)
    .addStep('validate_dates', validateDates, compensateValidateDates, { dependsOn: 'get_current_state' })
    .addStep('update_promotion', updatePromotionDB, compensateUpdatePromotion, { dependsOn: 'validate_dates' });

  return await saga.execute(payload);
};

/**
 * Delete Promotion Saga
 */
const deletePromotion = async (payload) => {
  const { promotion_id } = payload;
  const sagaId = generateId();

  // Get current state
  const getCurrentState = async (p) => {
    const [existing] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [p.promotion_id]);
    if (existing.length === 0) {
      throw new Error(WARNINGS.PROMOTION.NOT_FOUND);
    }

    const [items] = await pool.execute('SELECT * FROM promotion_items WHERE promotion_id = ?', [p.promotion_id]);

    return {
      success: true,
      data: { promotion: existing[0], items },
      compensation: { promotion: existing[0], items }
    };
  };

  const compensateGetCurrentState = async () => ({ success: true });

  // Delete promotion
  const deletePromotionDB = async (p) => {
    // Delete related items first
    await pool.execute('DELETE FROM promotion_items WHERE promotion_id = ?', [p.promotion_id]);
    // Then delete promotion
    await pool.execute('DELETE FROM promotions WHERE id = ?', [p.promotion_id]);

    return {
      success: true,
      data: { deleted: true },
      compensation: { promotion_id: p.promotion_id }
    };
  };

  const compensateDeletePromotion = async (compData) => {
    const promo = compData.promotion;
    if (promo) {
      await pool.execute(
        `INSERT INTO promotions (id, title, description, type, value, min_order_amount, max_discount_amount, promo_code, start_at, end_at, is_active, custom_items, usage_limit, usage_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [promo.id, promo.title, promo.description, promo.type, promo.value, promo.min_order_amount, 
         promo.max_discount_amount, promo.promo_code, promo.start_at, promo.end_at, promo.is_active, promo.custom_items, promo.usage_limit, promo.usage_count]
      );
      
      // Restore items
      if (compData.items && compData.items.length > 0) {
        for (const item of compData.items) {
          await pool.execute(
            'INSERT INTO promotion_items (id, promotion_id, menu_item_id, category_id) VALUES (?, ?, ?, ?)',
            [item.id, item.promotion_id, item.menu_item_id, item.category_id]
          );
        }
      }
    }
    return { success: true, message: 'Promotion restored' };
  };

  const saga = createSaga('promotion_delete', sagaId)
    .addStep('get_current_state', getCurrentState, compensateGetCurrentState, payload)
    .addStep('delete_promotion', deletePromotionDB, compensateDeletePromotion, { dependsOn: 'get_current_state' });

  return await saga.execute(payload);
};

/**
 * Toggle Promotion Status Saga
 */
const toggleStatus = async (payload) => {
  const { promotion_id } = payload;
  const sagaId = generateId();

  // Get current state
  const getCurrentState = async (p) => {
    const [existing] = await pool.execute('SELECT * FROM promotions WHERE id = ?', [p.promotion_id]);
    if (existing.length === 0) {
      throw new Error(WARNINGS.PROMOTION.NOT_FOUND);
    }
    return {
      success: true,
      data: { current: existing[0] },
      compensation: { promotion_id: p.promotion_id, original: existing[0] }
    };
  };

  const compensateGetCurrentState = async () => ({ success: true });

  // Toggle status
  const toggleStatusDB = async (p) => {
    const currentPromo = p.getCurrentState?.current;
    const currentIsActive = currentPromo ? (currentPromo.is_active === 1 || currentPromo.is_active === true) : true;
    const newIsActive = !currentIsActive;

    // If activating, check if end_date needs extension
    let newEndDate = null;
    if (newIsActive === true) {
      const currentEndDate = currentPromo?.end_at;
      const endDate = currentEndDate ? new Date(currentEndDate) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (!endDate || (endDate < today)) {
        const newEnd = new Date();
        newEnd.setDate(newEnd.getDate() + 30);
        newEndDate = newEnd.toISOString().slice(0, 19).replace('T', ' ');
      }
    }

    if (newEndDate) {
      await pool.execute(
        'UPDATE promotions SET is_active = ?, end_at = ? WHERE id = ?',
        [true, newEndDate, p.promotion_id]
      );
    } else {
      await pool.execute(
        'UPDATE promotions SET is_active = ? WHERE id = ?',
        [newIsActive, p.promotion_id]
      );
    }

    return {
      success: true,
      data: { id: p.promotion_id, is_active: newIsActive },
      compensation: { promotion_id: p.promotion_id }
    };
  };

  const compensateToggleStatus = async (compData) => {
    const orig = compData.original;
    if (orig) {
      await pool.execute(
        'UPDATE promotions SET is_active = ?, end_at = ? WHERE id = ?',
        [orig.is_active, orig.end_at, compData.promotion_id]
      );
    }
    return { success: true, message: 'Status restored' };
  };

  const saga = createSaga('promotion_toggle_status', sagaId)
    .addStep('get_current_state', getCurrentState, compensateGetCurrentState, payload)
    .addStep('toggle_status', toggleStatusDB, compensateToggleStatus, { dependsOn: 'get_current_state' });

  return await saga.execute(payload);
};

module.exports = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  toggleStatus
};
