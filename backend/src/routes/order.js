/**
 * Order API Routes
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.post('/saga', orderController.createOrderSaga);
router.put('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.cancelOrder);

module.exports = router;
