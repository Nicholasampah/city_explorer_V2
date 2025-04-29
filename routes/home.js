// routes/home.js
const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('home');  // make sure you also have views/home.hbs
});

module.exports = router;
