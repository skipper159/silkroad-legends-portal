const express = require('express');
const router = express.Router();
const QueryBuilder = require('../../utils/queryBuilder');
const { authenticateToken } = require('../../middleware/auth');
const { getCharDb } = require('../../db');

/**
 * GET /api/character/public/:characterName
 * Get public character information
 * Requires authentication to view
 */
router.get('/public/:characterName', authenticateToken, async (req, res) => {
  try {
    const { characterName } = req.params;

    if (!characterName) {
      return res.status(400).json({
        success: false,
        message: 'Character name is required',
      });
    }

    const pool = await getCharDb();
    const { query, parameters } = QueryBuilder.buildPublicCharacterQuery(characterName);
    const finalQuery = QueryBuilder.applyParameters(query, parameters);

    const result = await pool.request().query(finalQuery);

    if (!result || !result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Character not found',
      });
    }

    const character = result.recordset[0];

    // Format the response data
    const publicCharacterData = {
      id: character.CharID, // Add character ID for equipment/inventory loading
      CharName: character.CharName,
      Level: character.Level,
      Race: character.Race,
      JobType: character.JobType,
      JobClass: character.JobClass,
      JobLevel: character.JobLevel,
      PromotionPhase: character.PromotionPhase,
      GuildName: character.GuildName === 'DummyGuild' ? '-' : character.GuildName,
      ItemPoints: character.ItemPoints || 0,
      RemainGold: character.RemainGold || 0,
      LastLoginTime: character.LastLoginTime || null,
      Strength: character.Strength || null,
      Intellect: character.Intellect || null,
      HP: character.HP || null,
      MP: character.MP || null,
    };

    res.json({
      success: true,
      data: publicCharacterData,
    });
  } catch (error) {
    console.error('Error fetching public character data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch character information',
    });
  }
});

module.exports = router;
