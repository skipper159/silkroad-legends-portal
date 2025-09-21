// ranking/index.js
const express = require('express');
const router = express.Router();

// Import all ranking modules
const {
  getPlayerRanking,
  getUniqueRanking,
  getUniqueMonthlyRanking,
  getCharacterDetails,
} = require('./playerRankings');
const {
  getTraderRanking,
  getThiefRanking,
  getHunterRanking,
  getJobKDRanking,
} = require('./jobRankings');
const { getHonorRanking } = require('./honorRankings');
const { getPvPRanking } = require('./pvpRankings');
const { getFortressPlayerRanking, getFortressGuildRanking } = require('./fortressRankings');
const {
  getJobStatistics,
  getJobLeaderboardComparison,
  getJobProgressionAnalytics,
} = require('./jobAnalytics');
const { getGuildRanking } = require('./guildRankings');
const {
  getItemEnhancementRanking,
  getItemDropRanking,
  router: itemRouter,
} = require('./itemRankings');

// Import enhanced features
const enhancedRankings = require('./enhancedRankings');
const rankingConfig = require('../../config/ranking');

// =============================================================================
// ENHANCED API V2 ENDPOINTS (SRO-CMS INSPIRED) 🔥
// =============================================================================

// Mount enhanced rankings under /enhanced path
router.use('/enhanced', enhancedRankings);

// Mount item rankings
router.use('/', itemRouter);

// =============================================================================
// NEW SRO-CMS COMPATIBLE ENDPOINTS
// =============================================================================

// Job Kill/Death Rankings
router.get('/job-kd', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;
    const jobType = req.query.jobType ? parseInt(req.query.jobType) : null;

    let data = await getJobKDRanking(limit, offset, jobType);
    if (!Array.isArray(data)) data = [];

    res.json({
      success: true,
      data: data,
      pagination: {
        currentPage: page,
        pageSize: limit,
        hasMore: data.length === limit,
      },
      metadata: {
        type: 'job-kd',
        jobType: jobType || 'all',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Job K/D ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

// Fortress Guild Rankings
router.get('/fortress-guild', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;

    let data = await getFortressGuildRanking(limit, offset);
    if (!Array.isArray(data)) data = [];

    res.json({
      success: true,
      data: data,
      pagination: {
        currentPage: page,
        pageSize: limit,
        hasMore: data.length === limit,
      },
      metadata: {
        type: 'fortress-guild',
        period: 'current',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Fortress guild ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

// =============================================================================
// PHASE 3: Advanced Job Analytics Endpoints (ENHANCED)
// =============================================================================

// GET /api/rankings/job-statistics - Comprehensive job statistics
router.get('/job-statistics', async (req, res) => {
  try {
    const statistics = await getJobStatistics();

    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job statistics',
      error: error.message,
    });
  }
});

// GET /api/rankings/job-leaderboard-comparison - Job leaderboard comparison
router.get('/job-leaderboard-comparison', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboards = await getJobLeaderboardComparison(limit);

    // Group by job type for better presentation
    const groupedData = leaderboards.reduce((acc, player) => {
      if (!acc[player.JobType]) {
        acc[player.JobType] = [];
      }
      acc[player.JobType].push(player);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching job leaderboard comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job leaderboard comparison',
      error: error.message,
    });
  }
});

// GET /api/rankings/job-progression - Job progression analytics
router.get('/job-progression', async (req, res) => {
  try {
    const analytics = await getJobProgressionAnalytics();

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching job progression analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job progression analytics',
      error: error.message,
    });
  }
});

// =============================================================================
// PHASE 1: Basic Rankings (ENHANCED)
// =============================================================================

// GET /api/rankings/trader - Trader rankings
router.get('/trader', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const rankings = await getTraderRanking(limit, offset);

    res.json({
      success: true,
      data: Array.isArray(rankings) ? rankings : [],
      pagination: {
        limit,
        offset,
        total: Array.isArray(rankings) ? rankings.length : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching trader rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trader rankings',
      error: error.message,
    });
  }
});

// GET /api/rankings/honor - Honor rankings with filtering
router.get('/honor', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const race = req.query.race;
    const minHonor = req.query.minHonor ? parseInt(req.query.minHonor) : null;
    const minKills = req.query.minKills ? parseInt(req.query.minKills) : null;

    const rankings = await getHonorRanking(limit, offset, race, minHonor, minKills);

    res.json({
      success: true,
      data: rankings,
      pagination: {
        limit,
        offset,
        total: rankings.length,
      },
      filters: {
        race,
        minHonor,
        minKills,
      },
    });
  } catch (error) {
    console.error('Error fetching honor rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch honor rankings',
      error: error.message,
    });
  }
});

// GET /api/rankings/fortress-players - Fortress player rankings with filtering
router.get('/fortress-players', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const race = req.query.race;
    const minLevel = req.query.minLevel ? parseInt(req.query.minLevel) : null;
    const guild = req.query.guild;

    const rankings = await getFortressPlayerRanking(limit, offset, race, minLevel, guild);

    res.json({
      success: true,
      data: rankings,
      pagination: {
        limit,
        offset,
        total: rankings.length,
      },
      filters: {
        race,
        minLevel,
        guild,
      },
    });
  } catch (error) {
    console.error('Error fetching fortress player rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fortress player rankings',
      error: error.message,
    });
  }
});

// GET /api/rankings/pvp - PvP rankings with filtering
router.get('/pvp', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const race = req.query.race;
    const minKills = req.query.minKills ? parseInt(req.query.minKills) : null;
    const maxDeaths = req.query.maxDeaths ? parseInt(req.query.maxDeaths) : null;

    const rankings = await getPvPRanking(limit, offset, race, minKills, maxDeaths);

    res.json({
      success: true,
      data: rankings,
      pagination: {
        limit,
        offset,
        total: rankings.length,
      },
      filters: {
        race,
        minKills,
        maxDeaths,
      },
    });
  } catch (error) {
    console.error('Error fetching PvP rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PvP rankings',
      error: error.message,
    });
  }
});

// =============================================================================
// Generic Rankings Handler (Fallback for backwards compatibility)
// =============================================================================

// GET /api/rankings/:type - Generic rankings endpoint
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    let rankings;

    switch (type) {
      case 'top-player':
        rankings = await getPlayerRanking(limit, offset);
        break;
      case 'unique':
        rankings = await getUniqueRanking(limit, offset);
        break;
      case 'unique-monthly':
        rankings = await getUniqueMonthlyRanking(limit, offset);
        break;
      case 'thief':
        rankings = await getThiefRanking(limit, offset);
        break;
      case 'hunter':
        rankings = await getHunterRanking(limit, offset);
        break;
      case 'guild':
        rankings = await getGuildRanking(limit, offset);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown ranking type: ${type}`,
          availableTypes: [
            'top-player',
            'unique',
            'unique-monthly',
            'trader',
            'thief',
            'hunter',
            'guild',
            'honor',
            'fortress-players',
            'pvp',
          ],
        });
    }

    res.json({
      success: true,
      data: Array.isArray(rankings) ? rankings : [],
      pagination: {
        limit,
        offset,
        total: Array.isArray(rankings) ? rankings.length : 0,
      },
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.type} rankings:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch ${req.params.type} rankings`,
      error: error.message,
    });
  }
});

module.exports = router;
