/**
 * Menu Saga Service - Saga pattern for menu operations
 * 
 * Operations:
 * 1. Create Category - Create a new category
 * 2. Create Menu Item - Create a new menu item with optional pricing
 * 3. Update Menu Item - Update menu item details
 * 4. Delete Menu Item - Delete menu item with cleanup
 * 5. Toggle Availability - Toggle item availability
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { createSaga } = require('./sagaOrchestrator');
const { WARNINGS } = require('../utils/warnings');

/**
 * Create Category Saga
 */
const createCategory = async (payload) => {
  const { name, description, image_url, sort_order = 0 } = payload;
  const sagaId = generateId();

  // Check for duplicate name
  const checkDuplicate = async (p) => {
    const [existing] = await pool.execute(
      'SELECT id FROM categories WHERE name = ?',
      [p.name]
    );

    if (existing.length > 0) {
      throw new Error('Category with this name already exists');
    }

    return { success: true, data: { name: p.name } };
  };

  const compensateCheckDuplicate = async () => ({ success: true });

  // Create category
  const createCategoryDB = async (p) => {
    const id = generateId();
    await pool.execute(
      'INSERT INTO categories (id, name, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [id, p.name, p.description, p.image_url, p.sort_order]
    );

    return {
      success: true,
      data: { id, name: p.name },
      compensation: { category_id: id }
    };
  };


  const saga = createSaga('category_create', sagaId)
    .addStep('check_duplicate', checkDuplicate, compensateCheckDuplicate, payload)
    .addStep('create_category', createCategoryDB, compensateCreateCategory, { dependsOn: 'check_duplicate' });

  return await saga.execute(payload);
};

/**
 * Create Menu Item Saga
 */
const createMenuItem = async (payload) => {
  const { name, description, price, category_id, image_url, is_vegetarian, is_special, is_seasonal, branch_price } = payload;
  const sagaId = generateId();

  // Validate category if provided
  const validateCategory = async (p) => {
    if (p.category_id) {
      const [categories] = await pool.execute(
        'SELECT id FROM categories WHERE id = ?',
        [p.category_id]
      );
      if (categories.length === 0) {
        throw new Error('Category not found');
      }
    }
    return { success: true, data: { category_id: p.category_id } };
  };

  const compensateValidateCategory = async () => ({ success: true });

  // Check for duplicate name
  const checkDuplicate = async (p) => {
    const [existing] = await pool.execute(
      'SELECT id FROM menu_items WHERE name = ?',
      [p.name]
    );
    if (existing.length > 0) {
      throw new Error('Menu item with this name already exists');
    }
    return { success: true, data: { name: p.name } };
  };

  const compensateCheckDuplicate = async () => ({ success: true });

  // Create menu item
  const createMenuItemDB = async (p) => {
    const id = generateId();
    await pool.execute(
      `INSERT INTO menu_items (id, name, description, price, category_id, image_url, is_vegetarian, is_special, is_seasonal) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, p.name, p.description, p.price, p.category_id, p.image_url, p.is_vegetarian || false, p.is_special || false, p.is_seasonal || false]
    );

    return {
      success: true,
      data: { id, name: p.name, price: p.price },
      compensation: { menu_item_id: id, has_pricing: !!p.branch_price }
    };
  };

  const compensateCreateMenuItem = async (compData) => {
    await pool.execute('DELETE FROM menu_items WHERE id = ?', [compData.menu_item_id]);
    if (compData.has_pricing) {
      await pool.execute('DELETE FROM branch_pricing WHERE menu_item_id = ?', [compData.menu_item_id]);
    }
    return { success: true, message: 'Menu item deleted' };
  };

  // Add branch pricing if provided
  const addBranchPricing = async (p) => {
    if (!p.branch_price) {
      return { success: true, data: { pricing_added: false } };
    }

    await pool.execute(
      'INSERT INTO branch_pricing (id, menu_item_id, branch_code, price) VALUES (?, ?, ?, ?)',
      [generateId(), p.menu_item_id || p.createMenuItem?.id, 'default', p.branch_price]
    );

    return {
      success: true,
      data: { pricing_added: true },
      compensation: { menu_item_id: p.menu_item_id || p.createMenuItem?.id }
    };
  };

  const compensateAddBranchPricing = async (compData) => {
    if (compData.menu_item_id) {
      await pool.execute('DELETE FROM branch_pricing WHERE menu_item_id = ?', [compData.menu_item_id]);
    }
    return { success: true };
  };

  const saga = createSaga('menu_item_create', sagaId)
    .addStep('validate_category', validateCategory, compensateValidateCategory, payload)
    .addStep('check_duplicate', checkDuplicate, compensateCheckDuplicate, { dependsOn: 'validate_category' })
    .addStep('create_menu_item', createMenuItemDB, compensateCreateMenuItem, { dependsOn: 'check_duplicate' })
    .addStep('add_branch_pricing', addBranchPricing, compensateAddBranchPricing, { dependsOn: 'create_menu_item' });

  return await saga.execute(payload);
};

/**
 * Update Menu Item Saga
 */
const updateMenuItem = async (payload) => {
  const { menu_item_id, name, description, price, category_id, image_url, is_vegetarian, is_special, is_seasonal } = payload;
  const sagaId = generateId();

  // Get current state
  const getCurrentState = async (p) => {
    const [existing] = await pool.execute('SELECT * FROM menu_items WHERE id = ?', [p.menu_item_id]);
    if (existing.length === 0) {
      throw new Error(WARNINGS.MENU.ITEM_NOT_FOUND);
    }
    return {
      success: true,
      data: { current: existing[0] },
      compensation: { menu_item_id: p.menu_item_id, original: existing[0] }
    };
  };

  const compensateGetCurrentState = async () => ({ success: true });

  // Update menu item
  const updateMenuItemDB = async (p) => {
    const updates = [];
    const params = [];

    if (p.name) { updates.push('name = ?'); params.push(p.name); }
    if (p.description !== undefined) { updates.push('description = ?'); params.push(p.description); }
    if (p.price) { updates.push('price = ?'); params.push(p.price); }
    if (p.category_id) { updates.push('category_id = ?'); params.push(p.category_id); }
    if (p.image_url !== undefined) { updates.push('image_url = ?'); params.push(p.image_url); }
    if (p.is_vegetarian !== undefined) { updates.push('is_vegetarian = ?'); params.push(p.is_vegetarian); }
    if (p.is_special !== undefined) { updates.push('is_special = ?'); params.push(p.is_special); }
    if (p.is_seasonal !== undefined) { updates.push('is_seasonal = ?'); params.push(p.is_seasonal); }

    if (updates.length > 0) {
      params.push(p.menu_item_id);
      await pool.execute(`UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return {
      success: true,
      data: { updated: true },
      compensation: { menu_item_id: p.menu_item_id }
    };
  };

  const compensateUpdateMenuItem = async (compData) => {
    const orig = compData.original;
    if (orig) {
      await pool.execute(
        `UPDATE menu_items SET name = ?, description = ?, price = ?, category_id = ?, 
         image_url = ?, is_vegetarian = ?, is_special = ?, is_seasonal = ? WHERE id = ?`,
        [orig.name, orig.description, orig.price, orig.category_id, orig.image_url, 
         orig.is_vegetarian, orig.is_special, orig.is_seasonal, compData.menu_item_id]
      );
    }
    return { success: true, message: 'Menu item restored' };
  };

  const saga = createSaga('menu_item_update', sagaId)
    .addStep('get_current_state', getCurrentState, compensateGetCurrentState, payload)
    .addStep('update_menu_item', updateMenuItemDB, compensateUpdateMenuItem, { dependsOn: 'get_current_state' });

  return await saga.execute(payload);
};

/**
 * Delete Menu Item Saga
 */
const deleteMenuItem = async (payload) => {
  const { menu_item_id } = payload;
  const sagaId = generateId();

  // Get current state for potential restoration
  const getCurrentState = async (p) => {
    const [existing] = await pool.execute('SELECT * FROM menu_items WHERE id = ?', [p.menu_item_id]);
    if (existing.length === 0) {
      throw new Error(WARNINGS.MENU.ITEM_NOT_FOUND);
    }

    // Get related pricing
    const [pricing] = await pool.execute('SELECT * FROM branch_pricing WHERE menu_item_id = ?', [p.menu_item_id]);

    return {
      success: true,
      data: { menu_item: existing[0], pricing },
      compensation: { menu_item: existing[0], pricing }
    };
  };

  const compensateGetCurrentState = async () => ({ success: true });

  // Check if item is in orders
  const checkOrders = async (p) => {
    const [orderItems] = await pool.execute(
      'SELECT COUNT(*) as count FROM order_items WHERE menu_item_id = ?',
      [p.menu_item_id]
    );

    return {
      success: true,
      data: { order_count: orderItems[0].count },
      compensation: {}
    };
  };

  const compensateCheckOrders = async () => ({ success: true });

  // Delete menu item (cascade will handle order_items if needed)
  const deleteMenuItemDB = async (p) => {
    // First remove pricing
    await pool.execute('DELETE FROM branch_pricing WHERE menu_item_id = ?', [p.menu_item_id]);
    // Then delete item
    await pool.execute('DELETE FROM menu_items WHERE id = ?', [p.menu_item_id]);

    return {
      success: true,
      data: { deleted: true },
      compensation: { menu_item_id: p.menu_item_id }
    };
  };

  const compensateDeleteMenuItem = async (compData) => {
    const item = compData.menu_item;
    if (item) {
      await pool.execute(
        `INSERT INTO menu_items (id, name, description, price, category_id, image_url, is_vegetarian, is_special, is_seasonal) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.name, item.description, item.price, item.category_id, item.image_url, item.is_vegetarian, item.is_special, item.is_seasonal]
      );
      
      // Restore pricing
      if (compData.pricing && compData.pricing.length > 0) {
        for (const price of compData.pricing) {
          await pool.execute(
            'INSERT INTO branch_pricing (id, menu_item_id, branch_code, price) VALUES (?, ?, ?, ?)',
            [price.id, price.menu_item_id, price.branch_code, price.price]
          );
        }
      }
    }
    return { success: true, message: 'Menu item restored' };
  };

  const saga = createSaga('menu_item_delete', sagaId)
    .addStep('get_current_state', getCurrentState, compensateGetCurrentState, payload)
    .addStep('check_orders', checkOrders, compensateCheckOrders, { dependsOn: 'get_current_state' })
    .addStep('delete_menu_item', deleteMenuItemDB, compensateDeleteMenuItem, { dependsOn: 'check_orders' });

  return await saga.execute(payload);
};

/**
 * Toggle Availability Saga
 */
const toggleAvailability = async (payload) => {
  const { menu_item_id, is_available } = payload;
  const sagaId = generateId();

  // Get current state
  const getCurrentState = async (p) => {
    const [existing] = await pool.execute(
      'SELECT id, is_available FROM menu_items WHERE id = ?',
      [p.menu_item_id]
    );
    if (existing.length === 0) {
      throw new Error(WARNINGS.MENU.ITEM_NOT_FOUND);
    }
    return {
      success: true,
      data: { current_availability: existing[0].is_available },
      compensation: { menu_item_id: p.menu_item_id, original_availability: existing[0].is_available }
    };
  };

  const compensateGetCurrentState = async () => ({ success: true });

  // Toggle availability
  const toggleAvailabilityDB = async (p) => {
    await pool.execute(
      'UPDATE menu_items SET is_available = ? WHERE id = ?',
      [p.is_available, p.menu_item_id]
    );

    return {
      success: true,
      data: { id: p.menu_item_id, is_available: p.is_available },
      compensation: { menu_item_id: p.menu_item_id }
    };
  };

  const compensateToggleAvailability = async (compData) => {
    await pool.execute(
      'UPDATE menu_items SET is_available = ? WHERE id = ?',
      [compData.original_availability, compData.menu_item_id]
    );
    return { success: true, message: 'Availability restored' };
  };

  const saga = createSaga('menu_toggle_availability', sagaId)
    .addStep('get_current_state', getCurrentState, compensateGetCurrentState, payload)
    .addStep('toggle_availability', toggleAvailabilityDB, compensateToggleAvailability, { dependsOn: 'get_current_state' });

  return await saga.execute(payload);
};

module.exports = {
  createCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
};
