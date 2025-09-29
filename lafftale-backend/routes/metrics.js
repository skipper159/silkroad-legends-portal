const express = require('express');
const router = express.Router();
const cache = require('../utils/cache');

/**
 * GET /api/metrics/players-online
 * Returns a small object with the current online player count.
 * Currently reads from cache if available, otherwise returns 0 as placeholder.
 */
router.get('/players-online', async (req, res) => {
  try {
    // Try to read a cached value (integration with game-server metrics or cache service expected)
    const cached = cache.get('players_online_count');
    const count = typeof cached === 'number' ? cached : 0; // placeholder fallback

    res.json({ success: true, data: { count }, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error fetching players-online metric:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch players online' });
  }
});

module.exports = router;
