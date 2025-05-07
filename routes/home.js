// routes/home.js
const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('home',{ 
    title: 'City Explorer - Discover Cities Around the World',
    user: req.session.user
  });  
});

module.exports = router;
