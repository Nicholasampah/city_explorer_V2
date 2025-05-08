const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Public routes
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// Protected routes
router.get('/profile', isAuthenticated, authController.getProfile);
router.post('/favourites/:cityId', isAuthenticated, authController.addTofavourites);
router.delete('/favourites/:cityId', isAuthenticated, authController.removeFromfavourites);
router.get('/profile/edit', isAuthenticated, authController.getEditProfilePage);
router.post('/profile/edit', isAuthenticated, authController.updateProfile);
router.get('/profile/change-password', isAuthenticated, authController.getChangePasswordPage);
router.post('/profile/change-password', isAuthenticated, authController.changePassword);

module.exports = router;