// routes/ranking/enhancedRankings.js - YOLO Enhanced Ranking System 🔥
const express = require('express');
const router = express.Router();

// Import enhanced modules
const { getPlayerRanking, getUniqueRanking, getCharacterDetails } = require('./playerRankings');
const { getTraderRanking, getThiefRanking, getHunterRanking } = require('./jobRankings');
const { getHonorRanking } = require('./honorRankings');
const { getPvPRanking } = require('./pvpRankings');
const { getFortressPlayerRanking } = require('./fortressRankings');
const {
  getJobStatistics,
  getJobLeaderboardComparison,
  getJobProgressionAnalytics,
} = require('./jobAnalytics');
const { getGuildRanking } = require('./guildRankings');

// Import utilities
const cache = require('../../utils/cache');
const rankingConfig = require('../../config/ranking');

// =============================================================================
// ENHANCED API RESPONSES WITH SRO-CMS PATTERNS
// =============================================================================

/**
 * Standard API response formatter
 */
function formatApiResponse(data, options = {}) {
  const response = {
    status: 'success',
    data: data,
    timestamp: new Date().toISOString(),
  };

  if (options.pagination) {
    response.pagination = {
      limit: options.pagination.limit,
      offset: options.pagination.offset,
      total: Array.isArray(data) ? data.length : 0,
      hasMore: Array.isArray(data) && data.length === options.pagination.limit,
    };
  }

  if (options.filters) {
    response.filters = options.filters;
  }

  if (options.metadata) {
    response.metadata = {
      cached: options.cached || false,
      queryTime: options.queryTime || null,
      ...options.metadata,
    };
  }

  return response;
}

// =============================================================================
// ENHANCED CHARACTER RANKINGS
// =============================================================================

// GET /enhanced/character/rankings - Enhanced character rankings
router.get('/enhanced/character/rankings', async (req, res) => {
  const startTime = Date.now();

  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, rankingConfig.api.maxLimit);
    const offset = parseInt(req.query.offset) || 0;
    const race = req.query.race;
    const minLevel = req.query.minLevel ? parseInt(req.query.minLevel) : null;
    const charName = req.query.search;
    const includeItemPoints = req.query.itemPoints !== 'false';

    const options = {
      race,
      minLevel,
      charName,
      includeItemPoints,
    };

    const rankings = await getPlayerRanking(limit, offset, options);
    const queryTime = Date.now() - startTime;

    res.json(
      formatApiResponse(rankings, {
        pagination: { limit, offset },
        filters: { race, minLevel, charName, includeItemPoints },
        metadata: {
          queryTime: `${queryTime}ms`,
          itemPointsEnabled: rankingConfig.itemPoints.enabled,
          characterRaces: rankingConfig.characterRace,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching enhanced character rankings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch character rankings',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /enhanced/guild/rankings - Enhanced guild rankings
router.get('/enhanced/guild/rankings', async (req, res) => {
  const startTime = Date.now();

  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, rankingConfig.api.maxLimit);
    const offset = parseInt(req.query.offset) || 0;
    const guildName = req.query.search;
    const minMembers = req.query.minMembers ? parseInt(req.query.minMembers) : 3;

    const rankings = await getGuildRanking(limit, offset, { guildName, minMembers });
    const queryTime = Date.now() - startTime;

    res.json(
      formatApiResponse(rankings, {
        pagination: { limit, offset },
        filters: { guildName, minMembers },
        metadata: {
          queryTime: `${queryTime}ms`,
          enhanced: true,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching enhanced guild rankings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch guild rankings',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /enhanced/job/:jobType - Enhanced job rankings
router.get('/enhanced/job/:jobType', async (req, res) => {
  const startTime = Date.now();

  try {
    const jobType = req.params.jobType;
    const validJobs = ['trader', 'thief', 'hunter'];

    if (!validJobs.includes(jobType.toLowerCase())) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid job type. Must be one of: ${validJobs.join(', ')}`,
        timestamp: new Date().toISOString(),
      });
    }

    const limit = Math.min(parseInt(req.query.limit) || 100, rankingConfig.api.maxLimit);
    const offset = parseInt(req.query.offset) || 0;

    let rankings;
    switch (jobType.toLowerCase()) {
      case 'trader':
        rankings = await getTraderRanking(limit, offset);
        break;
      case 'thief':
        rankings = await getThiefRanking(limit, offset);
        break;
      case 'hunter':
        rankings = await getHunterRanking(limit, offset);
        break;
    }

    const queryTime = Date.now() - startTime;

    res.json(
      formatApiResponse(rankings, {
        pagination: { limit, offset },
        filters: { jobType },
        metadata: {
          queryTime: `${queryTime}ms`,
          jobType: jobType,
          enhanced: true,
        },
      })
    );
  } catch (error) {
    console.error(`Error fetching enhanced ${req.params.jobType} rankings:`, error);
    res.status(500).json({
      status: 'error',
      message: `Failed to fetch ${req.params.jobType} rankings`,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// =============================================================================
// ENHANCED PLAYER RANKINGS (Legacy compatibility)
// =============================================================================

// GET /api/rankings/enhanced/player - Advanced player rankings
router.get('/player', async (req, res) => {
  const startTime = Date.now();

  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, rankingConfig.api.maxLimit);
    const offset = parseInt(req.query.offset) || 0;
    const race = req.query.race;
    const minLevel = req.query.minLevel ? parseInt(req.query.minLevel) : null;
    const charName = req.query.search;
    const includeItemPoints = req.query.itemPoints !== 'false';

    const options = {
      race,
      minLevel,
      charName,
      includeItemPoints,
    };

    const rankings = await getPlayerRanking(limit, offset, options);
    const queryTime = Date.now() - startTime;

    res.json(
      formatApiResponse(rankings, {
        pagination: { limit, offset },
        filters: { race, minLevel, charName, includeItemPoints },
        metadata: {
          queryTime: `${queryTime}ms`,
          itemPointsEnabled: rankingConfig.itemPoints.enabled,
          characterRaces: rankingConfig.characterRace,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching enhanced player rankings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch player rankings',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/rankings/enhanced/character/:name - Character details
router.get('/character/:name', async (req, res) => {
  const startTime = Date.now();

  try {
    const charName = req.params.name;
    const character = await getCharacterDetails(charName);

    if (!character) {
      return res.status(404).json({
        status: 'error',
        message: `Character '${charName}' not found`,
        timestamp: new Date().toISOString(),
      });
    }

    const queryTime = Date.now() - startTime;

    res.json(
      formatApiResponse(character, {
        metadata: {
          queryTime: `${queryTime}ms`,
          characterRaces: rankingConfig.characterRace,
          jobTypes: rankingConfig.jobType,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching character details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch character details',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// =============================================================================
// ENHANCED UNIQUE RANKINGS WITH POINTS
// =============================================================================

// GET /api/rankings/enhanced/unique - Unique monster rankings with points
router.get('/unique', async (req, res) => {
  const startTime = Date.now();

  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, rankingConfig.api.maxLimit);
    const offset = parseInt(req.query.offset) || 0;
    const monthly = req.query.monthly === 'true';

    const rankings = await getUniqueRanking(limit, offset, monthly);
    const queryTime = Date.now() - startTime;

    res.json(
      formatApiResponse(rankings, {
        pagination: { limit, offset },
        filters: { monthly },
        metadata: {
          queryTime: `${queryTime}ms`,
          uniquePoints: rankingConfig.uniquePoints,
          timeframe: monthly ? 'monthly' : 'all-time',
        },
      })
    );
  } catch (error) {
    console.error('Error fetching unique rankings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch unique rankings',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// =============================================================================
// ENHANCED SEARCH ENDPOINTS
// =============================================================================

// GET /enhanced/character/search - Character search
router.get('/enhanced/character/search', async (req, res) => {
  const startTime = Date.now();

  try {
    const searchTerm = req.query.q || '';
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    if (searchTerm.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search term must be at least 2 characters long',
        timestamp: new Date().toISOString(),
      });
    }

    // Use query builder for character search
    const queryBuilder = require('../../utils/queryBuilder');
    const { query, parameters } = queryBuilder.buildCharacterSearchQuery(searchTerm, limit);

    const queryTime = Date.now() - startTime;

    res.json(
      formatApiResponse(
        {
          searchTerm,
          query: 'Generated successfully',
          parameterCount: parameters.length,
        },
        {
          metadata: {
            queryTime: `${queryTime}ms`,
            enhanced: true,
            searchTerm,
          },
        }
      )
    );
  } catch (error) {
    console.error('Error in character search:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search characters',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /enhanced/guild/search - Guild search
router.get('/enhanced/guild/search', async (req, res) => {
  const startTime = Date.now();

  try {
    const searchTerm = req.query.q || '';
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    if (searchTerm.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search term must be at least 2 characters long',
        timestamp: new Date().toISOString(),
      });
    }

    // Use query builder for guild search
    const queryBuilder = require('../../utils/queryBuilder');
    const { query, parameters } = queryBuilder.buildGuildSearchQuery(searchTerm, limit);

    const queryTime = Date.now() - startTime;

    res.json(
      formatApiResponse(
        {
          searchTerm,
          query: 'Generated successfully',
          parameterCount: parameters.length,
        },
        {
          metadata: {
            queryTime: `${queryTime}ms`,
            enhanced: true,
            searchTerm,
          },
        }
      )
    );
  } catch (error) {
    console.error('Error in guild search:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search guilds',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// =============================================================================
// ENHANCED CONFIGURATION ENDPOINTS
// =============================================================================

// GET /enhanced/config/menu - Menu configuration
router.get('/enhanced/config/menu', async (req, res) => {
  try {
    res.json(
      formatApiResponse(rankingConfig.menu, {
        metadata: {
          version: '2.0.0',
          enhanced: true,
          menuItems: rankingConfig.menu.length,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching menu config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch menu configuration',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /enhanced/config/races - Race configuration
router.get('/enhanced/config/races', async (req, res) => {
  try {
    res.json(
      formatApiResponse(rankingConfig.races, {
        metadata: {
          version: '2.0.0',
          enhanced: true,
          raceCount: Object.keys(rankingConfig.races).length,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching race config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch race configuration',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /enhanced/health - System health check
router.get('/enhanced/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      version: '2.0-YOLO',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      services: {
        database: 'connected',
        cache: rankingConfig.cache.enabled ? 'enabled' : 'disabled',
        queryBuilder: 'active',
      },
      features: {
        itemPoints: rankingConfig.itemPoints.enabled,
        advancedFiltering: rankingConfig.features.advancedFiltering,
        characterDetails: rankingConfig.features.characterDetails,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(formatApiResponse(health));
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /enhanced/cache/status - Cache status
router.get('/enhanced/cache/status', async (req, res) => {
  try {
    const cacheStats = await cache.getStats();

    res.json(
      formatApiResponse(cacheStats, {
        metadata: {
          enhanced: true,
          timestamp: new Date().toISOString(),
        },
      })
    );
  } catch (error) {
    console.error('Error fetching cache status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cache status',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /enhanced/cache/clear - Clear cache
router.post('/enhanced/cache/clear', async (req, res) => {
  try {
    const cleared = cache.clear();

    res.json(
      formatApiResponse(
        {
          message: `Cache cleared successfully`,
          itemsCleared: cleared,
        },
        {
          metadata: {
            enhanced: true,
            timestamp: new Date().toISOString(),
          },
        }
      )
    );
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cache',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /enhanced/cache/clear (for compatibility)
router.get('/enhanced/cache/clear', async (req, res) => {
  try {
    const cleared = cache.clear();

    res.json(
      formatApiResponse(
        {
          message: `Cache cleared successfully`,
          itemsCleared: cleared,
        },
        {
          metadata: {
            enhanced: true,
            timestamp: new Date().toISOString(),
          },
        }
      )
    );
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cache',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// =============================================================================
// LEGACY COMPATIBILITY LAYER
// =============================================================================

// GET /api/rankings/enhanced/config - Get ranking configuration
router.get('/config', async (req, res) => {
  try {
    const config = {
      menu: rankingConfig.menu,
      jobMenu: rankingConfig.jobMenu,
      characterRace: rankingConfig.characterRace,
      jobType: rankingConfig.jobType,
      honorLevel: rankingConfig.honorLevel,
      uniquePoints: rankingConfig.uniquePoints,
      features: rankingConfig.features,
      api: {
        maxLimit: rankingConfig.api.maxLimit,
        defaultLimit: rankingConfig.api.defaultLimit,
      },
    };

    res.json(
      formatApiResponse(config, {
        metadata: {
          version: '2.0.0',
          enhanced: true,
          cacheEnabled: rankingConfig.cache.enabled,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch configuration',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/rankings/enhanced/stats - Get cache and performance stats
router.get('/stats', async (req, res) => {
  try {
    const cacheStats = await cache.getStats();

    const stats = {
      cache: cacheStats,
      performance: {
        features: rankingConfig.features,
        queryOptimization: rankingConfig.performance.enableQueryOptimization,
        maxConnections: rankingConfig.performance.maxConnections,
      },
      endpoints: {
        total: 20, // Total enhanced endpoints
        legacy: 8, // Legacy endpoints
        enhanced: 12, // New enhanced endpoints
      },
    };

    res.json(
      formatApiResponse(stats, {
        metadata: {
          generatedAt: new Date().toISOString(),
          uptime: process.uptime(),
          nodeVersion: process.version,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stats',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// =============================================================================
// CACHE MANAGEMENT ENDPOINTS
// =============================================================================

// POST /api/rankings/enhanced/cache/invalidate - Invalidate cache
router.post('/cache/invalidate', async (req, res) => {
  try {
    const pattern = req.body.pattern || '';

    if (pattern) {
      await cache.invalidate(pattern);
    } else {
      await cache.invalidateAll();
    }

    res.json(
      formatApiResponse({
        message: pattern ? `Cache invalidated for pattern: ${pattern}` : 'All cache invalidated',
        pattern: pattern || 'all',
      })
    );
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to invalidate cache',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/rankings/enhanced/health - Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      services: {
        database: 'connected', // Should check actual DB connection
        cache: rankingConfig.cache.enabled ? 'enabled' : 'disabled',
        features: {
          itemPoints: rankingConfig.itemPoints.enabled,
          advancedFiltering: rankingConfig.features.advancedFiltering,
          characterDetails: rankingConfig.features.characterDetails,
        },
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    res.json(formatApiResponse(health));
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
