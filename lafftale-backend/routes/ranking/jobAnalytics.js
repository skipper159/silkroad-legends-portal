// ranking/jobAnalytics.js
const { getCharDb, sql } = require('../../db');

/**
 * Get comprehensive job statistics with population, level distribution, and progression metrics
 */
async function getJobStatistics() {
  const pool = await getCharDb();

  const query = `
    SELECT 
      JobType,
      COUNT(*) as Population,
      AVG(CAST(Level AS FLOAT)) as AverageLevel,
      MAX(Level) as MaxLevel,
      MIN(Level) as MinLevel,
      AVG(CAST(Exp AS FLOAT)) as AverageExp,
      -- Level distribution
      SUM(CASE WHEN Level BETWEEN 1 AND 20 THEN 1 ELSE 0 END) as Level1_20,
      SUM(CASE WHEN Level BETWEEN 21 AND 40 THEN 1 ELSE 0 END) as Level21_40,
      SUM(CASE WHEN Level BETWEEN 41 AND 60 THEN 1 ELSE 0 END) as Level41_60,
      SUM(CASE WHEN Level BETWEEN 61 AND 80 THEN 1 ELSE 0 END) as Level61_80,
      SUM(CASE WHEN Level BETWEEN 81 AND 100 THEN 1 ELSE 0 END) as Level81_100,
      SUM(CASE WHEN Level > 100 THEN 1 ELSE 0 END) as Level100Plus
    FROM _Char 
    WHERE Level > 1 AND JobType IS NOT NULL
    GROUP BY JobType
    ORDER BY Population DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

/**
 * Get job leaderboard comparison across different job types
 */
async function getJobLeaderboardComparison(limit = 10) {
  const pool = await getCharDb();

  const query = `
    WITH RankedPlayers AS (
      SELECT 
        CharName16,
        JobType,
        Level,
        Exp,
        ROW_NUMBER() OVER (PARTITION BY JobType ORDER BY Level DESC, Exp DESC) as JobRank
      FROM _Char 
      WHERE Level > 1 AND JobType IS NOT NULL
    )
    SELECT 
      JobType,
      CharName16,
      Level,
      Exp,
      JobRank
    FROM RankedPlayers 
    WHERE JobRank <= @limit
    ORDER BY JobType, JobRank
  `;

  const result = await pool.request().input('limit', sql.Int, limit).query(query);
  return result.recordset;
}

/**
 * Get job progression analytics with growth trends and performance metrics
 */
async function getJobProgressionAnalytics() {
  const pool = await getCharDb();

  const query = `
    SELECT 
      JobType,
      COUNT(*) as TotalPlayers,
      AVG(CAST(Level AS FLOAT)) as AverageLevel,
      -- Performance metrics
      AVG(CAST(PKCount2 AS FLOAT)) as AveragePKs,
      AVG(CAST(UniqueKills AS FLOAT)) as AverageUniqueKills,
      AVG(CAST(Honor AS FLOAT)) as AverageHonor,
      -- Level progression metrics
      CAST(COUNT(CASE WHEN Level >= 50 THEN 1 END) AS FLOAT) / COUNT(*) * 100 as Level50Percent,
      CAST(COUNT(CASE WHEN Level >= 80 THEN 1 END) AS FLOAT) / COUNT(*) * 100 as Level80Percent,
      CAST(COUNT(CASE WHEN Level >= 100 THEN 1 END) AS FLOAT) / COUNT(*) * 100 as Level100Percent,
      -- Activity metrics
      COUNT(CASE WHEN PKCount2 > 0 THEN 1 END) as PvPActivePlayers,
      COUNT(CASE WHEN Honor > 0 THEN 1 END) as HonorPlayers
    FROM _Char 
    WHERE Level > 1 AND JobType IS NOT NULL
    GROUP BY JobType
    ORDER BY TotalPlayers DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports = {
  getJobStatistics,
  getJobLeaderboardComparison,
  getJobProgressionAnalytics,
};
