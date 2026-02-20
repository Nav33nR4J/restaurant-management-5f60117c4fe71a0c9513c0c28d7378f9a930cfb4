/**
 * Cart API Routes
 */
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items/:id', cartController.updateCartItem);
router.delete('/items/:id', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.post('/apply-promo', cartController.applyPromotion);

// Saga endpoints
router.post('/items/saga', cartController.addToCartSaga);
router.put('/items/:id/saga', cartController.updateCartItemSaga);
router.delete('/items/:id/saga', cartController.removeFromCartSaga);
router.delete('/clear/saga', cartController.clearCartSaga);

module.exports = router;
