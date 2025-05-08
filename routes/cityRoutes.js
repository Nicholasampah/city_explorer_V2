const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const adminCityController = require('../controllers/adminCityController');

// Public routes
router.get('/', cityController.getCities); // list of all cities
router.get('/search', cityController.getSearchPage); //Displays the search page 
router.get('/:id', cityController.getCityById); // Gets a single city

// Admin routes
router.get('/admin/add', isAdmin, adminCityController.getAddCityForm); // Gets the add city form
router.post('/', isAdmin, adminCityController.createCity);  // creates a new city
router.get('/:id/edit', isAdmin, adminCityController.getEditCityForm); // Gets edit city form
router.put('/:id', isAdmin, adminCityController.updateCity); // updates city data
router.delete('/:id', isAdmin, adminCityController.deleteCity); // Deletes a city

module.exports = router;

