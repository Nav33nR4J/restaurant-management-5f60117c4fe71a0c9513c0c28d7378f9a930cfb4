/**
 * Order Controller - Business Logic
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { WARNINGS } = require('../utils/warnings');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { successResponse, createdResponse, paginatedResponse } = require('../utils/response');

const CANCELLABLE_STATUSES = ['pending', 'confirmed'];
const VALID_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

const getUserIdentifier = (req) => {
  return req.user?.id || req.session_id || req.ip;
};

/**
 * Get Orders
 */
const getOrders = async (req, res, next) => {
  try {
    const userId = getUserIdentifier(req);
    const { page = 1, limit = 20, status } = req.query;
    // Ensure proper integer conversion for pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM orders WHERE (user_id = ? OR session_id = ?)';
    const params = [userId || null, req.session_id || req.ip];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';
    
    // Use pool.query() instead of pool.execute() for LIMIT/OFFSET with prepared statements
    const [orders] = await pool.query(
      query + ' LIMIT ? OFFSET ?',
      [...params, limitNum, offset]
    );

    // Get order items for each order
    for (let order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, m.name, m.image_url 
         FROM order_items oi 
         JOIN menu_items m ON oi.menu_item_id = m.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE (user_id = ? OR session_id = ?)';
    const countParams = [userId || null, req.session_id || req.ip];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const [countResult] = await pool.execute(countQuery, countParams);

    return paginatedResponse(res, orders, pageNum, limitNum, countResult[0].total);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Order by ID
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getUserIdentifier(req);

    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND (user_id = ? OR session_id = ?)',
      [id, userId || null, req.session_id || req.ip]
    );

    if (orders.length === 0) {
      throw new NotFoundError(WARNINGS.ORDER.ORDER_NOT_FOUND);
    }

    const order = orders[0];
    const [items] = await pool.execute(
      `SELECT oi.*, m.name, m.image_url 
       FROM order_items oi 
       JOIN menu_items m ON oi.menu_item_id = m.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;

    return successResponse(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Order from Cart
 */
const createOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const userId = getUserIdentifier(req);
    const sessionId = req.session_id || req.ip;
    const { delivery_address, delivery_phone, notes, promotion_code } = req.body;

    await connection.beginTransaction();

    // Get cart items
    const [cartItems] = await connection.execute(
      `SELECT c.*, m.name, m.price as unit_price,
              COALESCE(bp.price, m.price) as final_price
       FROM carts c
       JOIN menu_items m ON c.menu_item_id = m.id
       LEFT JOIN branch_pricing bp ON m.id = bp.menu_item_id AND bp.branch_code = 'default'
       WHERE (c.user_id = ? OR c.session_id = ?)`,
      [userId || null, sessionId]
    );

    if (cartItems.length === 0) {
      throw new ValidationError(WARNINGS.CART.EMPTY_CART);
    }

    // Calculate totals
    let subtotal = cartItems.reduce((sum, item) => sum + (item.final_price * item.quantity), 0);
    let discount = 0;
    let promotion = null;

    // Apply promotion if provided
    if (promotion_code) {
      const [promotions] = await connection.execute(
        `SELECT * FROM promotions 
         WHERE code = ? AND is_active = true 
         AND (start_date IS NULL OR start_date <= CURDATE())
         AND (end_date IS NULL OR end_date >= CURDATE())`,
        [promotion_code]
      );

      if (promotions.length > 0) {
        const promo = promotions[0];
        if (subtotal >= promo.min_order_amount) {
          if (promo.discount_type === 'percentage') {
            discount = (subtotal * promo.discount_value) / 100;
            if (promo.max_discount && discount > promo.max_discount) {
              discount = promo.max_discount;
            }
          } else {
            discount = promo.discount_value;
          }
          promotion = { code: promo.code, title: promo.title, discount };
        }
      }
    }

    const total_amount = Math.max(0, subtotal - discount);

    // Create order
    const orderId = generateId();
    await connection.execute(
      `INSERT INTO orders (id, user_id, session_id, status, total_amount, delivery_address, delivery_phone, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, userId || null, sessionId, 'pending', total_amount, delivery_address, delivery_phone, notes]
    );

    // Create order items
    for (const item of cartItems) {
      const itemId = generateId();
      const itemSubtotal = item.final_price * item.quantity;
      await connection.execute(
        `INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, subtotal, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [itemId, orderId, item.menu_item_id, item.quantity, item.final_price, itemSubtotal, item.notes]
      );
    }

    // Clear cart
    await connection.execute(
      'DELETE FROM carts WHERE user_id = ? OR session_id = ?',
      [userId || null, sessionId]
    );

    await connection.commit();

    return createdResponse(res, {
      order_id: orderId,
      subtotal,
      discount,
      total_amount,
      promotion,
      status: 'pending'
    }, 'Order created successfully');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update Order Status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError(WARNINGS.ORDER.INVALID_STATUS);
    }

    const [existing] = await pool.execute('SELECT status FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.ORDER.ORDER_NOT_FOUND);
    }

    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    return successResponse(res, { id, status }, 'Order status updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Order
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = getUserIdentifier(req);

    const [existing] = await pool.execute(
      'SELECT status FROM orders WHERE id = ? AND (user_id = ? OR session_id = ?)',
      [id, userId || null, req.session_id || req.ip]
    );

    if (existing.length === 0) {
      throw new NotFoundError(WARNINGS.ORDER.ORDER_NOT_FOUND);
    }

    if (!CANCELLABLE_STATUSES.includes(existing[0].status)) {
      throw new ForbiddenError(WARNINGS.ORDER.CANNOT_CANCEL);
    }

    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);

    return successResponse(res, { id, status: 'cancelled' }, 'Order cancelled');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder
};
