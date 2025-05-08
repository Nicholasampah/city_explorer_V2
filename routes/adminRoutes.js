const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

// All routes already protected by isAuthenticated middleware in app.js
// Additional isAdmin middleware to ensure only admins can access these routes

router.get('/', isAdmin, adminController.getDashboard);

// User management routes
router.get('/users', isAdmin, adminController.getUsers);
router.get('/users/add', isAdmin, adminController.getAddUserForm);
router.post('/users', isAdmin, adminController.addUser);
router.get('/users/:id/edit', isAdmin, adminController.getEditUserForm);
router.put('/users/:id', isAdmin, adminController.updateUser);
router.delete('/users/:id', isAdmin, adminController.deleteUser);

// City management routes
router.get('/cities', isAdmin, adminController.getCities);
router.get('/cities/add', isAdmin, adminController.getAddCityForm);

module.exports = router;