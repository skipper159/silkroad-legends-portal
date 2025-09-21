// ranking/playerRankings.js
const { getCharDb, sql } = require('../../db');
const cache = require('../../utils/cache');
const queryBuilder = require('../../utils/queryBuilder');
const rankingConfig = require('../../config/ranking');

/**
 * Get top player rankings by level and experience with advanced features
 */
async function getPlayerRanking(limit = 100, offset = 0, options = {}) {
  // Validate and sanitize parameters
  const validatedLimit = isNaN(limit) ? 100 : Math.min(Math.max(parseInt(limit), 1), 1000);
  const validatedOffset = isNaN(offset) ? 0 : Math.max(parseInt(offset), 0);

  const cacheKey = cache.generateKey('player_ranking', {
    limit: validatedLimit,
    offset: validatedOffset,
    ...options,
  });

  return await cache.remember(cacheKey, async () => {
    const pool = await getCharDb();
    const { query, parameters } = queryBuilder.buildPlayerRankingQuery({
      limit: validatedLimit,
      offset: validatedOffset,
      charId: options.charId,
      charName: options.charName,
      race: options.race,
      minLevel: options.minLevel,
      includeItemPoints: options.includeItemPoints !== false,
    });

    const request = queryBuilder.applyParameters(pool.request(), parameters);
    const result = await request.query(query);

    return result.recordset.map((player) => ({
      ...player,
      raceInfo: rankingConfig.characterRace[player.Race] || null,
      jobInfo: rankingConfig.jobType[player.JobType] || null,
      formattedGold: formatNumber(player.RemainGold),
      itemPointsFormatted: player.ItemPoints ? formatNumber(player.ItemPoints) : null,
    }));
  });
}

/**
 * Get unique monster kill rankings with points system
 */
async function getUniqueRanking(limit = 100, offset = 0, monthly = false) {
  const cacheKey = cache.generateKey('unique_ranking', {
    limit,
    offset,
    monthly,
  });

  return await cache.remember(cacheKey, async () => {
    const pool = await getCharDb();
    const type = monthly ? 'unique-monthly' : 'unique';
    const query = queryBuilder.buildUniqueRankingQuery(type, limit, offset);

    const result = await pool.request().query(query);

    if (!result || !result.recordset) {
      return [];
    }

    return result.recordset.map((player) => ({
      ...player,
      raceInfo: rankingConfig.characterRace[player.Race] || null,
      pointsFormatted: formatNumber(player.Points),
      killsFormatted: formatNumber(player.UniqueKills),
    }));
  });
}

/**
 * Get monthly unique monster kill rankings
 */
async function getUniqueMonthlyRanking(limit = 100, offset = 0) {
  return await getUniqueRanking(limit, offset, true);
}

/**
 * Get character details by name
 */
async function getCharacterDetails(charName) {
  const cacheKey = cache.generateKey('character_details', { charName });

  return await cache.remember(
    cacheKey,
    async () => {
      const pool = await getCharDb();
      const { query, parameters } = queryBuilder.buildCharacterDetailQuery(charName);

      const request = queryBuilder.applyParameters(pool.request(), parameters);
      const result = await request.query(query);

      if (result.recordset.length === 0) {
        return null;
      }

      const character = result.recordset[0];
      return {
        ...character,
        raceInfo: rankingConfig.characterRace[character.Race] || null,
        jobInfo: rankingConfig.jobType[character.JobType] || null,
        currentJobInfo: rankingConfig.jobType[character.CurrentJob] || null,
        formattedGold: formatNumber(character.RemainGold),
        lastSeen: null, // LogOutTime not available in current schema
      };
    },
    300
  ); // 5 minute cache for character details
}

/**
 * Utility function to format numbers
 */
function formatNumber(num) {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

module.exports = {
  getPlayerRanking,
  getUniqueRanking,
  getUniqueMonthlyRanking,
  getCharacterDetails,
};
