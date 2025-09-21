const express = require('express');
const router = express.Router();

// Import modular ranking system
const rankingRoutes = require('./ranking/index');

// Mount all ranking routes from the modular system
router.use('/', rankingRoutes);

module.exports = router;
