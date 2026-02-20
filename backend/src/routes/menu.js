/**
 * Menu API Routes
 * All business logic is in controller functions
 */
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Public Routes
router.get('/categories', menuController.getCategories);
router.get('/items', menuController.getMenuItems);
router.get('/items/:id', menuController.getMenuItemById);
router.get('/search', menuController.searchMenuItems);
router.get('/seasonal', menuController.getSeasonalItems);
router.get('/specials', menuController.getSpecialItems);

// Protected Routes (Admin)
router.post('/categories', menuController.createCategory);
router.post('/items', menuController.createMenuItem);
router.put('/items/:id', menuController.updateMenuItem);
router.delete('/items/:id', menuController.deleteMenuItem);
router.put('/items/:id/availability', menuController.toggleAvailability);

// Saga endpoints
router.post('/categories/saga', menuController.createCategorySaga);
router.post('/items/saga', menuController.createMenuItemSaga);
router.put('/items/:id/saga', menuController.updateMenuItemSaga);
router.delete('/items/:id/saga', menuController.deleteMenuItemSaga);
router.put('/items/:id/availability/saga', menuController.toggleAvailabilitySaga);

module.exports = router;
