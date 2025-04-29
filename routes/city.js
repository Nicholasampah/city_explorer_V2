const express = require('express');
const router  = express.Router();

// define your routes
router.get('/', (req, res) => {
  res.render('cities/search', { title: 'City' });
});

module.exports = router;   // ← make sure you export the router itself
