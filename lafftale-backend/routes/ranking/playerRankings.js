// ranking/playerRankings.js
const { getCharDb, sql } = require('../../db');
const cache = require('../../utils/cache');
const QueryBuilder = require('../../utils/queryBuilder');
const rankingConfig = require('../../config/ranking');

/**
 * Get top player rankings by level and experience with advanced features
 */
async function getPlayerRanking(limit = 100, offset = 0, options = {}) {
  // Validate and sanitize parameters
  const validatedLimit = isNaN(limit) ? 100 : Math.min(Math.max(parseInt(limit), 1), 1000);
  const validatedOffset = isNaN(offset) ? 0 : Math.max(parseInt(offset), 0);

  // For search results, don't use cache as we need to calculate real-time global ranks
  if (options.charName) {
    return await getPlayerRankingWithGlobalRank(validatedLimit, validatedOffset, options);
  }

  const cacheKey = cache.generateKey('player_ranking', {
    limit: validatedLimit,
    offset: validatedOffset,
    ...options,
  });

  return await cache.remember(cacheKey, async () => {
    const pool = await getCharDb();
    const { query, parameters } = QueryBuilder.buildPlayerRankingQuery({
      limit: validatedLimit,
      offset: validatedOffset,
      charId: options.charId,
      charName: options.charName,
      race: options.race,
      minLevel: options.minLevel,
      includeItemPoints: true, // Always include Item Points for top player rankings
    });

    const finalQuery = QueryBuilder.applyParameters(query, parameters);
    const result = await pool.request().query(finalQuery);

    // GM filtering is now done in SQL query, no need for additional filtering
    const filteredResults = result.recordset;

    // For non-search results, calculate rank based on offset + position
    return filteredResults.map((player, index) => ({
      ...player,
      GlobalRank: validatedOffset + index + 1,
      GuildName: player.GuildName === 'DummyGuild' ? '-' : player.GuildName,
      raceInfo: rankingConfig.characterRace[player.Race] || null,
      jobInfo: rankingConfig.jobType[player.JobType] || null,
      formattedGold: formatNumber(player.RemainGold),
      itemPointsFormatted: player.ItemPoints ? formatNumber(player.ItemPoints) : null,
    }));
  });
}

/**
 * Get player rankings with real-time global rank calculation for search results
 */
async function getPlayerRankingWithGlobalRank(limit = 100, offset = 0, options = {}) {
  const pool = await getCharDb();
  const { query, parameters } = QueryBuilder.buildPlayerRankingQuery({
    limit,
    offset,
    charId: options.charId,
    charName: options.charName,
    race: options.race,
    minLevel: options.minLevel,
    includeItemPoints: true,
  });

  const finalQuery = QueryBuilder.applyParameters(query, parameters);
  const result = await pool.request().query(finalQuery);

  let rankedResults = result.recordset.map((player) => ({
    ...player,
    GuildName: player.GuildName === 'DummyGuild' ? '-' : player.GuildName,
    raceInfo: rankingConfig.characterRace[player.Race] || null,
    jobInfo: rankingConfig.jobType[player.JobType] || null,
    formattedGold: formatNumber(player.RemainGold),
    itemPointsFormatted: player.ItemPoints ? formatNumber(player.ItemPoints) : null,
  }));

  // Calculate global ranks for each result
  for (let i = 0; i < rankedResults.length; i++) {
    const player = rankedResults[i];
    try {
      const { query: rankQuery, parameters: rankParams } = QueryBuilder.buildGlobalRankQuery(
        player.CharID,
        true
      );
      const rankQueryFinal = QueryBuilder.applyParameters(rankQuery, rankParams);
      const rankResult = await pool.request().query(rankQueryFinal);

      if (rankResult.recordset.length > 0) {
        rankedResults[i].GlobalRank = rankResult.recordset[0].GlobalRank;
      } else {
        rankedResults[i].GlobalRank = 999999; // Fallback rank
      }
    } catch (error) {
      console.error(`Error calculating global rank for ${player.CharName}:`, error);
      rankedResults[i].GlobalRank = 999999; // Fallback rank
    }
  }

  return rankedResults;
}

/**
 * Get player rankings with optimized global rank calculation for search results
 */
async function getPlayerRankingOptimized(limit = 100, offset = 0, options = {}) {
  const cacheKey = cache.generateKey('player_ranking_optimized', { limit, offset, ...options });

  return await cache.remember(
    cacheKey,
    async () => {
      const pool = await getCharDb();
      const { query, parameters } = QueryBuilder.buildPlayerRankingWithGlobalRankQuery({
        limit,
        offset,
        charId: options.charId,
        charName: options.charName,
        race: options.race,
        minLevel: options.minLevel,
        includeItemPoints: true,
      });

      const finalQuery = QueryBuilder.applyParameters(query, parameters);
      const result = await pool.request().query(finalQuery);

      return result.recordset.map((player) => ({
        ...player,
        GuildName: player.GuildName === 'DummyGuild' ? '-' : player.GuildName,
        raceInfo: rankingConfig.characterRace[player.Race] || null,
        jobInfo: rankingConfig.jobType[player.JobType] || null,
        formattedGold: formatNumber(player.RemainGold),
        itemPointsFormatted: player.ItemPoints ? formatNumber(player.ItemPoints) : null,
      }));
    },
    60
  ); // 1 minute cache for search results
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
    const query = QueryBuilder.buildUniqueRankingQuery(type, limit, offset);

    const result = await pool.request().query(query);

    if (!result || !result.recordset) {
      return [];
    }

    return result.recordset.map((player, index) => ({
      rank: offset + index + 1,
      CharName16: player.playerName,
      Level: player.level,
      GuildName: player.guildName || null,
      Race: player.Race,
      UniqueCount: player.UniqueKills,
      TotalKills: player.UniqueKills, // Alias für Kompatibilität
      TotalPoints: player.TotalPoints,
      LastKill: player.LastKill,
      raceInfo: rankingConfig.characterRace[player.Race] || null,
      pointsFormatted: formatNumber(player.TotalPoints),
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
      const { query, parameters } = QueryBuilder.buildCharacterDetailQuery(charName);

      const finalQuery = QueryBuilder.applyParameters(query, parameters);
      const result = await pool.request().query(finalQuery);

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
  getPlayerRankingWithGlobalRank,
  getPlayerRankingOptimized,
  getUniqueRanking,
  getUniqueMonthlyRanking,
  getCharacterDetails,
};
