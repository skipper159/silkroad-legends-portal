const express = require('express');
const router = express.Router();
const QueryBuilder = require('../utils/queryBuilder');
const { getCharDb } = require('../db');

/**
 * GET /api/unique-kills/recent
 * Get recent unique monster kills from all players (last 10)
 * Public endpoint - no authentication required
 */
router.get('/recent', async (req, res) => {
  try {
    const pool = await getCharDb();
    const { query } = QueryBuilder.buildRecentUniqueKillsQuery();

    const result = await pool.request().query(query);

    const recentKills = result.recordset || [];

    // Format the recent kills data
    const formattedKills = recentKills.map((kill) => ({
      mobId: kill.MobID,
      charId: kill.CharID,
      characterName: kill.CharacterName,
      eventDate: kill.EventDate,
      monsterCodeName: kill.MonsterCodeName,
      monsterName: kill.MonsterName,
    }));

    res.json({
      success: true,
      data: formattedKills,
    });
  } catch (error) {
    console.error('Error fetching recent unique kills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent unique kills',
    });
  }
});

module.exports = router;
