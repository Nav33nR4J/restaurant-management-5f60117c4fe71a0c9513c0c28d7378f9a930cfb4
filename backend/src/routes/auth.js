/**
 * Auth API Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authController.getCurrentUser);
router.put('/profile', authController.updateProfile);
router.post('/logout', authController.logout);

// Saga endpoints
router.post('/register/saga', authController.registerSaga);
router.put('/profile/saga', authController.updateProfileSaga);

module.exports = router;
