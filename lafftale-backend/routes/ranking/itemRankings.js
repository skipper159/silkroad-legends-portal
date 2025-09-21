// routes/ranking/itemRankings.js - Item Enhancement & Drop Rankings
const express = require('express');
const router = express.Router();
const { getCharDb } = require('../../db');
const sql = require('mssql');
const cache = require('../../utils/cache');
const rankingConfig = require('../../config/ranking');

const PAGE_SIZE = 25; // Standard page size for rankings

// =============================================================================
// ITEM ENHANCEMENT FUNCTIONS
// =============================================================================

/**
 * Get item enhancement ranking (Plus levels)
 * Simulated data based on character wealth and level
 */
async function getItemEnhancementRanking(limit = PAGE_SIZE, offset = 0, minPlus = 8) {
  const cacheKey = `item_enhancement_ranking_${limit}_${offset}_${minPlus}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  try {
    const pool = await getCharDb();
    const result = await pool
      .request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .input('minPlus', sql.Int, minPlus).query(`
        WITH EnhancementData AS (
          SELECT
            ROW_NUMBER() OVER (ORDER BY c.RemainGold DESC, c.CurLevel DESC) as rank,
            c.CharName16,
            c.CurLevel as Level,
            c.RefObjID,
            CASE WHEN c.RefObjID % 2 = 0 THEN 'Chinese' ELSE 'European' END as Race,
            ISNULL(g.Name, '') as GuildName,
            -- Simulated enhancement data based on character wealth
            CASE 
              WHEN c.RemainGold >= 5000000000 THEN FLOOR(RAND() * 25) + 15  -- Rich players: 15-40 total plus
              WHEN c.RemainGold >= 1000000000 THEN FLOOR(RAND() * 20) + 10  -- Wealthy: 10-30
              WHEN c.RemainGold >= 100000000 THEN FLOOR(RAND() * 15) + 5    -- Medium: 5-20
              ELSE FLOOR(RAND() * 10) + 1                                   -- Poor: 1-10
            END as TotalPlus,
            CASE 
              WHEN c.RemainGold >= 5000000000 THEN FLOOR(RAND() * 5) + @minPlus + 2  -- Rich: minPlus+2 to minPlus+7
              WHEN c.RemainGold >= 1000000000 THEN FLOOR(RAND() * 4) + @minPlus + 1  -- Wealthy: minPlus+1 to minPlus+5
              WHEN c.RemainGold >= 100000000 THEN FLOOR(RAND() * 3) + @minPlus       -- Medium: minPlus to minPlus+3
              ELSE FLOOR(RAND() * 2) + (@minPlus - 1)                               -- Poor: minPlus-1 to minPlus+1
            END as HighestPlus,
            CASE 
              WHEN c.CurLevel >= 100 THEN FLOOR(RAND() * 8) + 5  -- High level: 5-12 items
              WHEN c.CurLevel >= 80 THEN FLOOR(RAND() * 6) + 3   -- Mid level: 3-8 items
              ELSE FLOOR(RAND() * 4) + 1                         -- Low level: 1-4 items
            END as ItemCount,
            c.LastLogout as LastEnhancement
          FROM _Char c
          LEFT JOIN _GuildMember gm ON c.CharID = gm.CharID
          LEFT JOIN _Guild g ON gm.GuildID = g.ID
          WHERE c.Deleted = 0 AND c.CurLevel >= 50
        ),
        RankedData AS (
          SELECT ROW_NUMBER() OVER (ORDER BY TotalPlus DESC, HighestPlus DESC) AS rank,
                 *
          FROM EnhancementData
          WHERE HighestPlus >= @minPlus
        )
        SELECT *
        FROM RankedData
        WHERE rank > @offset AND rank <= (@offset + @limit)
        ORDER BY rank
      `);

    const data = result.recordset;

    // Cache for 1 hour
    cache.set(cacheKey, data, rankingConfig.cache.ranking_item * 60);

    return data;
  } catch (error) {
    console.error('Error fetching item enhancement ranking:', error);
    throw error;
  }
}

// =============================================================================
// ITEM DROP FUNCTIONS
// =============================================================================

/**
 * Get rare item drop ranking
 * Simulated data based on character level and activity
 */
async function getItemDropRanking(limit = PAGE_SIZE, offset = 0) {
  const cacheKey = `item_drop_ranking_${limit}_${offset}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  try {
    const pool = await getCharDb();
    const result = await pool
      .request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit).query(`
        SELECT * FROM (
          SELECT
            ROW_NUMBER() OVER (ORDER BY c.RemainGold DESC, c.CurLevel DESC) as rank,
          c.CharName16,
          c.CurLevel as Level,
          c.RefObjID,
          CASE WHEN c.RefObjID % 2 = 0 THEN 'Chinese' ELSE 'European' END as Race,
          ISNULL(g.Name, '') as GuildName,
          -- Simulated drop data based on character stats
          CASE 
            WHEN c.CurLevel >= 100 THEN FLOOR(RAND() * 50) + 20
            WHEN c.CurLevel >= 80 THEN FLOOR(RAND() * 30) + 10
            ELSE FLOOR(RAND() * 15) + 5
          END as SealOfSunDrops,
          CASE 
            WHEN c.CurLevel >= 100 THEN FLOOR(RAND() * 30) + 10
            WHEN c.CurLevel >= 80 THEN FLOOR(RAND() * 20) + 5
            ELSE FLOOR(RAND() * 10) + 1
          END as SealOfMoonDrops,
          CASE 
            WHEN c.CurLevel >= 100 THEN FLOOR(RAND() * 20) + 5
            ELSE FLOOR(RAND() * 10) + 1
          END as SealOfStarDrops,
          CASE 
            WHEN c.CurLevel >= 100 THEN FLOOR(RAND() * 10) + 1
            ELSE 0
          END as SealOfNovaDrops,
          c.LastLogout as LastDrop
        FROM _Char c
        LEFT JOIN _GuildMember gm ON c.CharID = gm.CharID
        LEFT JOIN _Guild g ON gm.GuildID = g.ID
        WHERE c.Deleted = 0 AND c.CurLevel >= 50
      ) AS ranked
      WHERE rank > @offset AND rank <= (@offset + @limit)
      ORDER BY rank
      `);

    const data = result.recordset;

    // Cache for 1 hour
    cache.set(cacheKey, data, rankingConfig.cache.ranking_item * 60);

    return data;
  } catch (error) {
    console.error('Error fetching item drop ranking:', error);
    throw error;
  }
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

// Item Enhancement Rankings
router.get('/item-plus', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const minPlus = parseInt(req.query.minPlus) || 8;
    const offset = (page - 1) * PAGE_SIZE;

    let data = await getItemEnhancementRanking(PAGE_SIZE, offset, minPlus);
    if (!Array.isArray(data)) data = [];

    res.json({
      success: true,
      data: data,
      pagination: {
        currentPage: page,
        pageSize: PAGE_SIZE,
        hasMore: data.length === PAGE_SIZE,
      },
      metadata: {
        type: 'item-enhancement',
        minPlus: minPlus,
        period: 'last-6-months',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Item enhancement ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

// Drop Item Rankings
router.get('/item-drop', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * PAGE_SIZE;

    let data = await getItemDropRanking(PAGE_SIZE, offset);
    if (!Array.isArray(data)) data = [];

    res.json({
      success: true,
      data: data,
      pagination: {
        currentPage: page,
        pageSize: PAGE_SIZE,
        hasMore: data.length === PAGE_SIZE,
      },
      metadata: {
        type: 'item-drop',
        period: 'simulated-data',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Item drop ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = router;
