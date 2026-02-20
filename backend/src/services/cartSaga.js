/**
 * Cart Saga Service - Saga pattern for cart operations
 * 
 * Operations:
 * 1. Add to Cart - Add item with validation
 * 2. Update Cart - Modify item quantity
 * 3. Remove from Cart - Delete item
 * 4. Clear Cart - Remove all items
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { createSaga } = require('./sagaOrchestrator');
const { WARNINGS } = require('../utils/warnings');

const MAX_QUANTITY = 99;

/**
 * Add to Cart Saga
 */
const addToCart = async (payload) => {
  const { menu_item_id, quantity = 1, notes, userId, sessionId } = payload;
  const sagaId = generateId();

  // Validate item step
  const validateItem = async (p) => {
    const [menuItems] = await pool.execute(
      'SELECT id, name, is_available, price FROM menu_items WHERE id = ?',
      [p.menu_item_id]
    );

    if (menuItems.length === 0) {
      throw new Error(WARNINGS.MENU.ITEM_NOT_FOUND);
    }

    if (!menuItems[0].is_available) {
      throw new Error(WARNINGS.MENU.ITEM_UNAVAILABLE);
    }

    return {
      success: true,
      data: { menuItem: menuItems[0] },
      compensation: { menu_item_id: p.menu_item_id }
    };
  };

  const compensateValidateItem = async (compData) => {
    return { success: true, message: 'Validation reversed' };
  };

  // Check existing cart item
  const checkExisting = async (p) => {
    const [existing] = await pool.execute(
      `SELECT id, quantity FROM carts 
       WHERE (user_id = ? OR session_id = ?) AND menu_item_id = ?`,
      [p.userId || null, p.sessionId, p.menu_item_id]
    );

    return {
      success: true,
      data: { existing: existing[0] || null },
      compensation: { existing: existing[0] || null }
    };
  };

  const compensateCheckExisting = async () => {
    return { success: true };
  };

  // Add/Update cart
  const addToCartDB = async (p) => {
    const connection = await pool.getConnection();
    try {
      let cartId;
      let newQuantity;
      const existingItem = p.checkExisting?.existing;

      if (existingItem) {
        newQuantity = Math.min(existingItem.quantity + p.quantity, MAX_QUANTITY);
        cartId = existingItem.id;
        await connection.execute(
          'UPDATE carts SET quantity = ?, notes = ? WHERE id = ?',
          [newQuantity, p.notes || null, cartId]
        );
      } else {
        cartId = generateId();
        newQuantity = Math.min(p.quantity, MAX_QUANTITY);
        await connection.execute(
          'INSERT INTO carts (id, user_id, session_id, menu_item_id, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [cartId, p.userId || null, p.sessionId, p.menu_item_id, newQuantity, p.notes || null]
        );
      }

      return {
        success: true,
        data: { cart_id: cartId, quantity: newQuantity },
        compensation: { cart_id: cartId }
      };
    } finally {
      connection.release();
    }
  };

  const compensateAddToCart = async (compData) => {
    if (compData.cart_id) {
      await pool.execute('DELETE FROM carts WHERE id = ?', [compData.cart_id]);
    }
    return { success: true, message: 'Cart item removed' };
  };

  const saga = createSaga('cart_add', sagaId)
    .addStep('validate_item', validateItem, compensateValidateItem, payload)
    .addStep('check_existing', checkExisting, compensateCheckExisting, { dependsOn: 'validate_item' })
    .addStep('add_to_cart', addToCartDB, compensateAddToCart, { dependsOn: 'check_existing' });

  return await saga.execute(payload);
};

/**
 * Update Cart Item Saga
 */
const updateCartItem = async (payload) => {
  const { cart_item_id, quantity, userId, sessionId } = payload;
  const sagaId = generateId();

  // Validate cart item
  const validateCartItem = async (p) => {
    const [existing] = await pool.execute(
      `SELECT id, quantity FROM carts 
       WHERE id = ? AND (user_id = ? OR session_id = ?)`,
      [p.cart_item_id, p.userId || null, p.sessionId]
    );

    if (existing.length === 0) {
      throw new Error(WARNINGS.CART.ITEM_NOT_IN_CART);
    }

    return {
      success: true,
      data: { oldQuantity: existing[0].quantity },
      compensation: { cart_item_id: p.cart_item_id, oldQuantity: existing[0].quantity }
    };
  };

  const compensateValidateCartItem = async (compData) => {
    return { success: true };
  };

  // Update quantity
  const updateQuantity = async (p) => {
    const newQuantity = Math.min(p.quantity, MAX_QUANTITY);
    await pool.execute(
      'UPDATE carts SET quantity = ? WHERE id = ?',
      [newQuantity, p.cart_item_id]
    );

    return {
      success: true,
      data: { id: p.cart_item_id, quantity: newQuantity },
      compensation: { cart_item_id: p.cart_item_id }
    };
  };

  const compensateUpdateQuantity = async (compData) => {
    await pool.execute(
      'UPDATE carts SET quantity = ? WHERE id = ?',
      [compData.oldQuantity, compData.cart_item_id]
    );
    return { success: true, message: 'Quantity restored' };
  };

  const saga = createSaga('cart_update', sagaId)
    .addStep('validate_cart_item', validateCartItem, compensateValidateCartItem, payload)
    .addStep('update_quantity', updateQuantity, compensateUpdateQuantity, { dependsOn: 'validate_cart_item' });

  return await saga.execute(payload);
};

/**
 * Remove from Cart Saga
 */
const removeFromCart = async (payload) => {
  const { cart_item_id, userId, sessionId } = payload;
  const sagaId = generateId();

  // Validate and get item
  const validateCartItem = async (p) => {
    const [existing] = await pool.execute(
      `SELECT * FROM carts 
       WHERE id = ? AND (user_id = ? OR session_id = ?)`,
      [p.cart_item_id, p.userId || null, p.sessionId]
    );

    if (existing.length === 0) {
      throw new Error(WARNINGS.CART.ITEM_NOT_IN_CART);
    }

    return {
      success: true,
      data: { item: existing[0] },
      compensation: { item: existing[0] }
    };
  };

  const compensateValidateCartItem = async () => {
    return { success: true };
  };

  // Remove item
  const removeItem = async (p) => {
    await pool.execute('DELETE FROM carts WHERE id = ?', [p.cart_item_id]);

    return {
      success: true,
      data: { removed: true },
      compensation: { cart_item_id: p.cart_item_id }
    };
  };

  const compensateRemoveItem = async (compData) => {
    const item = compData.item;
    if (item) {
      await pool.execute(
        'INSERT INTO carts (id, user_id, session_id, menu_item_id, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [item.id, item.user_id, item.session_id, item.menu_item_id, item.quantity, item.notes]
      );
    }
    return { success: true, message: 'Cart item restored' };
  };

  const saga = createSaga('cart_remove', sagaId)
    .addStep('validate_cart_item', validateCartItem, compensateValidateCartItem, payload)
    .addStep('remove_item', removeItem, compensateRemoveItem, { dependsOn: 'validate_cart_item' });

  return await saga.execute(payload);
};

/**
 * Clear Cart Saga
 */
const clearCart = async (payload) => {
  const { userId, sessionId } = payload;
  const sagaId = generateId();

  // Get all cart items
  const getCartItems = async (p) => {
    const [items] = await pool.execute(
      'SELECT * FROM carts WHERE user_id = ? OR session_id = ?',
      [p.userId || null, p.sessionId]
    );

    return {
      success: true,
      data: { items, count: items.length },
      compensation: { items }
    };
  };

  const compensateGetCartItems = async () => {
    return { success: true };
  };

  // Clear cart
  const clearCartDB = async (p) => {
    await pool.execute(
      'DELETE FROM carts WHERE user_id = ? OR session_id = ?',
      [p.userId || null, p.sessionId]
    );

    return {
      success: true,
      data: { cleared: true },
      compensation: { userId: p.userId, sessionId: p.sessionId }
    };
  };

  const compensateClearCart = async (compData) => {
    if (compData.items && compData.items.length > 0) {
      for (const item of compData.items) {
        await pool.execute(
          'INSERT INTO carts (id, user_id, session_id, menu_item_id, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [item.id, item.user_id, item.session_id, item.menu_item_id, item.quantity, item.notes]
        );
      }
    }
    return { success: true, message: 'Cart restored' };
  };

  const saga = createSaga('cart_clear', sagaId)
    .addStep('get_cart_items', getCartItems, compensateGetCartItems, payload)
    .addStep('clear_cart', clearCartDB, compensateClearCart, { dependsOn: 'get_cart_items' });

  return await saga.execute(payload);
};

module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
