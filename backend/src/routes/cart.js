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

module.exports = router;
