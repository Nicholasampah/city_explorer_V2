const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

// Public routes
router.get('/', cityController.getCities); // list of all cities
router.get('/search', cityController.getSearchPage); //Displays the search page 
router.get('/:id', cityController.getCityById); // Gets a single city

module.exports = router;

