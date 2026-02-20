/**
 * Cart Controller - Business Logic
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { WARNINGS } = require('../utils/warnings');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { successResponse } = require('../utils/response');
const { addToCart: cartAddToCart, updateCartItem: cartUpdateCartItem, removeFromCart: cartRemoveFromCart, clearCart: cartClearCart } = require('../services/cartSaga');

const MAX_QUANTITY = 99;

const getUserIdentifier = (req) => {
  return req.user?.id || req.session_id || req.ip;
};

/**
 * Get Cart Items
 */
const getCart = async (req, res, next) => {
  try {
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    const [items] = await pool.execute(
      `SELECT c.*, m.name, m.description, m.image_url, m.price as unit_price,
              COALESCE(bp.price, m.price) as final_price
       FROM carts c
       JOIN menu_items m ON c.menu_item_id = m.id
       LEFT JOIN branch_pricing bp ON m.id = bp.menu_item_id AND bp.branch_code = ?
       WHERE (c.user_id = ? OR c.session_id = ?)
       AND m.is_available = true`,
      ['default', userId || null, sessionId]
    );

    const subtotal = items.reduce((sum, item) => sum + (item.final_price * item.quantity), 0);

    return successResponse(res, {
      items,
      item_count: items.length,
      subtotal: parseFloat(subtotal.toFixed(2))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Item to Cart
 */
const addToCart = async (req, res, next) => {
  try {
    const { menu_item_id, quantity = 1, notes } = req.body;
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    if (!menu_item_id) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('menu_item_id is required'));
    }

    // Check if item exists and is available
    const [menuItems] = await pool.execute(
      'SELECT id, is_available FROM menu_items WHERE id = ?',
      [menu_item_id]
    );

    if (menuItems.length === 0) {
      throw new NotFoundError(WARNINGS.MENU.ITEM_NOT_FOUND);
    }

    if (!menuItems[0].is_available) {
      throw new ValidationError(WARNINGS.MENU.ITEM_UNAVAILABLE);
    }

    // Check if item already in cart
    const [existing] = await pool.execute(
      `SELECT id, quantity FROM carts 
       WHERE (user_id = ? OR session_id = ?) AND menu_item_id = ?`,
      [userId || null, sessionId, menu_item_id]
    );

    let cartId;
    let newQuantity;

    if (existing.length > 0) {
      newQuantity = Math.min(existing[0].quantity + quantity, MAX_QUANTITY);
      cartId = existing[0].id;
      await pool.execute(
        'UPDATE carts SET quantity = ?, notes = ? WHERE id = ?',
        [newQuantity, notes || null, cartId]
      );
    } else {
      cartId = generateId();
      await pool.execute(
        'INSERT INTO carts (id, user_id, session_id, menu_item_id, quantity, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [cartId, userId || null, sessionId, menu_item_id, Math.min(quantity, MAX_QUANTITY), notes || null]
      );
      newQuantity = quantity;
    }

    return successResponse(res, { cart_id: cartId, quantity: newQuantity }, 'Item added to cart');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Cart Item
 */
const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    if (!quantity || quantity < 1) {
      throw new ValidationError(WARNINGS.CART.INVALID_QUANTITY);
    }

    const [existing] = await pool.execute(
      `SELECT id FROM carts 
       WHERE id = ? AND (user_id = ? OR session_id = ?)`,
      [id, userId || null, sessionId]
    );

    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.CART.ITEM_NOT_IN_CART);
    }

    const newQuantity = Math.min(quantity, MAX_QUANTITY);
    await pool.execute('UPDATE carts SET quantity = ? WHERE id = ?', [newQuantity, id]);

    return successResponse(res, { id, quantity: newQuantity }, 'Cart updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove Item from Cart
 */
const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    const [existing] = await pool.execute(
      `SELECT id FROM carts 
       WHERE id = ? AND (user_id = ? OR session_id = ?)`,
      [id, userId || null, sessionId]
    );

    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.CART.ITEM_NOT_IN_CART);
    }

    await pool.execute('DELETE FROM carts WHERE id = ?', [id]);

    return successResponse(res, null, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

/**
 * Clear Cart
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    await pool.execute(
      'DELETE FROM carts WHERE user_id = ? OR session_id = ?',
      [userId || null, sessionId]
    );

    return successResponse(res, null, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};

/**
 * Apply Promotion to Cart
 */
const applyPromotion = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    if (!code) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Promotion code is required'));
    }

    // Get cart items with prices
    const [items] = await pool.execute(
      `SELECT c.*, m.price as unit_price,
              COALESCE(bp.price, m.price) as final_price
       FROM carts c
       JOIN menu_items m ON c.menu_item_id = m.id
       LEFT JOIN branch_pricing bp ON m.id = bp.menu_item_id AND bp.branch_code = 'default'
       WHERE (c.user_id = ? OR c.session_id = ?)`,
      [userId || null, sessionId]
    );

    if (items.length === 0) {
      throw new ValidationError(WARNINGS.CART.EMPTY_CART);
    }

    // Get promotion
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
    const subtotal = items.reduce((sum, item) => sum + (item.final_price * item.quantity), 0);

    if (subtotal < promo.min_order_amount) {
      throw new ValidationError(WARNINGS.PROMOTION.MIN_ORDER_NOT_MET);
    }

    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = (subtotal * promo.discount_value) / 100;
      if (promo.max_discount && discount > promo.max_discount) {
        discount = promo.max_discount;
      }
    } else {
      discount = promo.discount_value;
    }

    return successResponse(res, {
      promotion: {
        code: promo.code,
        title: promo.title,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value
      },
      subtotal,
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat((subtotal - discount).toFixed(2))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add to Cart using Saga
 */
const addToCartSaga = async (req, res, next) => {
  try {
    const { menu_item_id, quantity = 1, notes } = req.body;
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    if (!menu_item_id) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('menu_item_id is required'));
    }

    const result = await cartAddToCart({ menu_item_id, quantity, notes, userId, sessionId });
    const data = result.data || result;

    return successResponse(res, { cart_id: data.cart_id, quantity: data.quantity }, 'Item added to cart via saga');
  } catch (error) {
    next(error);
  }
};

/**
 * Update Cart Item using Saga
 */
const updateCartItemSaga = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    if (!quantity || quantity < 1) {
      throw new ValidationError(WARNINGS.CART.INVALID_QUANTITY);
    }

    const result = await cartUpdateCartItem({ cart_item_id: id, quantity, userId, sessionId });
    const data = result.data || result;

    return successResponse(res, { id, quantity: data.quantity }, 'Cart updated via saga');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove from Cart using Saga
 */
const removeFromCartSaga = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    await cartRemoveFromCart({ cart_item_id: id, userId, sessionId });

    return successResponse(res, null, 'Item removed from cart via saga');
  } catch (error) {
    next(error);
  }
};

/**
 * Clear Cart using Saga
 */
const clearCartSaga = async (req, res, next) => {
  try {
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;

    await cartClearCart({ userId, sessionId });

    return successResponse(res, null, 'Cart cleared via saga');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyPromotion,
  // Saga endpoints
  addToCartSaga,
  updateCartItemSaga,
  removeFromCartSaga,
  clearCartSaga
};
