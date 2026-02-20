/**
 * Order Saga Service - Defines saga steps for order processing
 * 
 * The order saga includes:
 * 1. Validate Order - Check cart and order data
 * 2. Reserve Inventory - Check and reserve stock
 * 3. Process Payment - Process payment (mock)
 * 4. Create Order - Create the order in database
 * 5. Clear Cart - Clear the user's cart
 * 6. Send Notification - Send order confirmation (mock)
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');
const { createSaga } = require('./sagaOrchestrator');
const { WARNINGS } = require('../utils/warnings');

/**
 * Step 1: Validate Order
 * Validates cart items and order data
 */
const validateOrder = async (payload) => {
  const { userId, sessionId, delivery_address, delivery_phone } = payload;
  const connection = await pool.getConnection();
  
  try {
    // Get cart items
    const [cartItems] = await connection.execute(
      `SELECT c.*, m.name, m.price as unit_price, m.is_available,
              COALESCE(bp.price, m.price) as final_price
       FROM carts c
       JOIN menu_items m ON c.menu_item_id = m.id
       LEFT JOIN branch_pricing bp ON m.id = bp.menu_item_id AND bp.branch_code = 'default'
       WHERE (c.user_id = ? OR c.session_id = ?)`,
      [userId || null, sessionId]
    );

    if (cartItems.length === 0) {
      throw new Error(WARNINGS.CART.EMPTY_CART);
    }

    // Check availability
    const unavailable = cartItems.filter(item => !item.is_available);
    if (unavailable.length > 0) {
      throw new Error(`Some items are not available: ${unavailable.map(i => i.name).join(', ')}`);
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.final_price * item.quantity), 0);

    return {
      success: true,
      data: {
        cartItems,
        subtotal,
        itemCount: cartItems.length
      },
      compensation: null
    };
  } finally {
    connection.release();
  }
};

/**
 * Compensate: Validate Order (no compensation needed)
 */
const compensateValidateOrder = async () => {
  return { success: true, message: 'Validation reversed' };
};

/**
 * Step 2: Reserve Inventory
 * Checks and reserves stock for order items
 */
const reserveInventory = async (payload) => {
  const connection = await pool.getConnection();
  
  try {
    const { cartItems } = payload;
    const reservedItems = [];

    await connection.beginTransaction();

    for (const item of cartItems) {
      // Check current stock (using menu_items is_available as proxy)
      const [menuItems] = await connection.execute(
        'SELECT id, is_available FROM menu_items WHERE id = ?',
        [item.menu_item_id]
      );

      if (menuItems.length === 0 || !menuItems[0].is_available) {
        throw new Error(`Item ${item.name} is no longer available`);
      }

      // In a real system, we would update stock here
      // For now, we just mark the item as reserved
      reservedItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        reserved: true
      });
    }

    await connection.commit();

    return {
      success: true,
      data: {
        reservedItems
      },
      compensation: {
        reservedItems
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Compensate: Release Inventory
 */
const compensateReserveInventory = async (compensationData) => {
  // In a real system, we would release the reserved stock
  console.log('[Compensate] Inventory released');
  return { success: true, message: 'Inventory reservation released' };
};

/**
 * Step 3: Process Payment
 * Processes the payment (mock implementation)
 */
const processPayment = async (payload) => {
  const { subtotal, promotion_code } = payload;
  const connection = await pool.getConnection();
  
  try {
    let discount = 0;
    let promotion = null;

    // Apply promotion if provided
    if (promotion_code) {
      const [promotions] = await connection.execute(
        `SELECT * FROM promotions 
         WHERE promo_code = ? AND is_active = true 
         AND (start_at IS NULL OR start_at <= NOW())
         AND (end_at IS NULL OR end_at >= NOW())`,
        [promotion_code]
      );

      if (promotions.length > 0) {
        const promo = promotions[0];
        if (subtotal >= (promo.min_order_amount || 0)) {
          if (promo.type === 'percentage') {
            discount = (subtotal * promo.value) / 100;
            if (promo.max_discount_amount && discount > promo.max_discount_amount) {
              discount = promo.max_discount_amount;
            }
          } else {
            discount = promo.value;
          }
          promotion = { code: promo.promo_code, title: promo.title, discount };
        }
      }
    }

    const total_amount = Math.max(0, subtotal - discount);

    // Mock payment processing
    const paymentResult = {
      success: true,
      transaction_id: generateId(),
      subtotal,
      discount,
      total_amount,
      promotion,
      payment_method: 'mock',
      payment_status: 'completed'
    };

    return {
      success: true,
      data: paymentResult,
      compensation: {
        transaction_id: paymentResult.transaction_id,
        refund_amount: total_amount
      }
    };
  } finally {
    connection.release();
  }
};

/**
 * Compensate: Process Refund
 */
const compensateProcessPayment = async (compensationData) => {
  // In a real system, we would process a refund
  console.log(`[Compensate] Refund of ${compensationData.refund_amount} initiated`);
  return { 
    success: true, 
    message: 'Refund processed',
    refund_id: generateId()
  };
};

/**
 * Step 4: Create Order
 * Creates the order in the database
 */
const createOrder = async (payload) => {
  const { userId, sessionId, delivery_address, delivery_phone, notes } = payload;
  const { cartItems, subtotal, discount, total_amount, promotion, transaction_id } = payload.payment || payload;
  
  const connection = await pool.getConnection();
  const orderId = generateId();
  
  try {
    await connection.beginTransaction();

    // Create order
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

    await connection.commit();

    return {
      success: true,
      data: {
        order_id: orderId,
        subtotal,
        discount,
        total_amount,
        promotion,
        transaction_id,
        status: 'pending'
      },
      compensation: {
        order_id: orderId
      }
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Compensate: Cancel Order
 */
const compensateCreateOrder = async (compensationData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['cancelled', compensationData.order_id]
    );
    
    return { success: true, message: 'Order cancelled' };
  } finally {
    connection.release();
  }
};

/**
 * Step 5: Clear Cart
 * Removes items from the user's cart
 */
const clearCart = async (payload) => {
  const { userId, sessionId } = payload;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.execute(
      'DELETE FROM carts WHERE user_id = ? OR session_id = ?',
      [userId || null, sessionId]
    );

    return {
      success: true,
      data: { cleared: true },
      compensation: null
    };
  } finally {
    connection.release();
  }
};

/**
 * Compensate: Clear Cart (restore items)
 */
const compensateClearCart = async (compensationData) => {
  // In a real system, we would restore cart items
  console.log('[Compensate] Cart restoration not implemented');
  return { success: true, message: 'Cart restoration not needed' };
};

/**
 * Step 6: Send Notification
 * Sends order confirmation (mock implementation)
 */
const sendNotification = async (payload) => {
  const { delivery_phone, delivery_address } = payload;
  const { order_id, total_amount } = payload.order || {};
  
  // Mock notification sending
  const notificationId = generateId();
  
  console.log(`[Notification] Order ${order_id} confirmed - Total: $${total_amount}`);
  console.log(`[Notification] Sending SMS to ${delivery_phone}`);
  console.log(`[Notification] Delivery to ${delivery_address}`);

  return {
    success: true,
    data: {
      notification_id: notificationId,
      order_id,
      sent_to: delivery_phone,
      type: 'order_confirmation'
    },
    compensation: {
      notification_id: notificationId
    }
  };
};

/**
 * Compensate: Send Cancellation Notification
 */
const compensateSendNotification = async (compensationData) => {
  console.log(`[Compensate] Cancellation notification sent for ${compensationData.notification_id}`);
  return { success: true, message: 'Cancellation notification sent' };
};

/**
 * Execute the complete order saga
 */
const executeOrderSaga = async (orderData) => {
  const { userId, sessionId, delivery_address, delivery_phone, notes, promotion_code } = orderData;
  
  const sagaId = generateId();
  
  const saga = createSaga('order_creation', sagaId)
    .addStep('validate_order', validateOrder, compensateValidateOrder, {
      userId,
      sessionId,
      delivery_address,
      delivery_phone
    })
    .addStep('reserve_inventory', reserveInventory, compensateReserveInventory, {
      dependsOn: 'validate_order'
    })
    .addStep('process_payment', processPayment, compensateProcessPayment, {
      dependsOn: 'reserve_inventory',
      promotion_code
    })
    .addStep('create_order', createOrder, compensateCreateOrder, {
      dependsOn: 'process_payment'
    })
    .addStep('clear_cart', clearCart, compensateClearCart, {
      dependsOn: 'create_order'
    })
    .addStep('send_notification', sendNotification, compensateSendNotification, {
      dependsOn: 'create_order'
    });

  // Execute with initial payload
  return await saga.execute({
    userId,
    sessionId,
    delivery_address,
    delivery_phone,
    notes,
    promotion_code
  });
};

/**
 * Cancel Order Saga - Handles order cancellation with compensation
 */
const executeCancelSaga = async (orderId, userId, sessionId) => {
  const sagaId = generateId();
  
  // Get order details
  const [orders] = await pool.execute(
    'SELECT * FROM orders WHERE id = ?',
    [orderId]
  );
  
  if (orders.length === 0) {
    throw new Error('Order not found');
  }
  
  const order = orders[0];
  
  // Only allow cancellation for certain statuses
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new Error('Order cannot be cancelled in current status');
  }

  const cancelOrder = async (payload) => {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['cancelled', orderId]
      );
      return { success: true, data: { order_id: orderId, status: 'cancelled' } };
    } finally {
      connection.release();
    }
  };

  const sendCancellationNotification = async (payload) => {
    console.log(`[Notification] Cancellation confirmed for order ${orderId}`);
    return { success: true, data: { notification_sent: true } };
  };

  const saga = createSaga('order_cancellation', sagaId)
    .addStep('cancel_order', cancelOrder, async () => ({ success: true }), {
      orderId,
      userId,
      sessionId
    })
    .addStep('notify_cancellation', sendCancellationNotification, async () => ({ success: true }), {
      dependsOn: 'cancel_order'
    });

  return await saga.execute({ orderId, userId, sessionId });
};

module.exports = {
  executeOrderSaga,
  executeCancelSaga,
  // Export individual steps for testing
  validateOrder,
  reserveInventory,
  processPayment,
  createOrder,
  clearCart,
  sendNotification
};
