const express = require('express');
const router = express.Router();
const MetricsService = require('../services/metricsService');

/**
 * GET /api/metrics/players-online
 * Returns a small object with the current online player count.
 * Currently reads from cache if available, otherwise returns 0 as placeholder.
 */
router.get('/players-online', async (req, res) => {
  try {
    // Get cached value using the MetricsService
    const count = await MetricsService.getPlayersOnline();
    const playerCount = typeof count === 'number' ? count : 0; // fallback to 0

    res.json({ success: true, data: { count: playerCount }, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching players-online metric:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch players online' });
  }
});

module.exports = router;
