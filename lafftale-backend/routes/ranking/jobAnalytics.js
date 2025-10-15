// ranking/jobAnalytics.js
const { getCharDb, sql } = require('../../db');

/**
 * Get comprehensive job statistics with population, level distribution, and progression metrics
 */
async function getJobStatistics() {
  const pool = await getCharDb();

  const query = `
    SELECT 
      CASE
        WHEN c.Strength > c.Intellect THEN 1 -- Warrior
        WHEN c.Intellect > c.Strength THEN 2 -- Magician
        ELSE 1 -- Default to Warrior
      END as JobType,
      COUNT(*) as Population,
      AVG(CAST(c.CurLevel AS FLOAT)) as AverageLevel,
      MAX(c.CurLevel) as MaxLevel,
      MIN(c.CurLevel) as MinLevel,
      AVG(CAST(c.ExpOffset AS FLOAT)) as AverageExp,
      -- Level distribution
      SUM(CASE WHEN c.CurLevel BETWEEN 1 AND 20 THEN 1 ELSE 0 END) as Level1_20,
      SUM(CASE WHEN c.CurLevel BETWEEN 21 AND 40 THEN 1 ELSE 0 END) as Level21_40,
      SUM(CASE WHEN c.CurLevel BETWEEN 41 AND 60 THEN 1 ELSE 0 END) as Level41_60,
      SUM(CASE WHEN c.CurLevel BETWEEN 61 AND 80 THEN 1 ELSE 0 END) as Level61_80,
      SUM(CASE WHEN c.CurLevel BETWEEN 81 AND 100 THEN 1 ELSE 0 END) as Level81_100,
      SUM(CASE WHEN c.CurLevel > 100 THEN 1 ELSE 0 END) as Level100Plus
    FROM _Char c
    WHERE c.CurLevel > 1 AND c.CharName16 IS NOT NULL AND c.CharName16 != ''
      AND c.CharName16 NOT LIKE '[GM]%'
    GROUP BY 
      CASE
        WHEN c.Strength > c.Intellect THEN 1
        WHEN c.Intellect > c.Strength THEN 2
        ELSE 1
      END
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
        c.CharName16,
        CASE
          WHEN c.Strength > c.Intellect THEN 1 -- Warrior
          WHEN c.Intellect > c.Strength THEN 2 -- Magician
          ELSE 1 -- Default to Warrior
        END as JobType,
        c.CurLevel,
        c.ExpOffset,
        ROW_NUMBER() OVER (
          PARTITION BY CASE
            WHEN c.Strength > c.Intellect THEN 1
            WHEN c.Intellect > c.Strength THEN 2
            ELSE 1
          END 
          ORDER BY c.CurLevel DESC, c.ExpOffset DESC
        ) as JobRank
      FROM _Char c
      WHERE c.CurLevel > 1 AND c.CharName16 IS NOT NULL AND c.CharName16 != ''
        AND c.CharName16 NOT LIKE '%GM%' AND c.CharName16 NOT LIKE '%[[]GM]%'
    )
    SELECT 
      JobType,
      CharName16,
      CurLevel,
      ExpOffset,
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
      CASE
        WHEN c.Strength > c.Intellect THEN 1 -- Warrior
        WHEN c.Intellect > c.Strength THEN 2 -- Magician
        ELSE 1 -- Default to Warrior
      END as JobType,
      COUNT(*) as TotalPlayers,
      AVG(CAST(c.CurLevel AS FLOAT)) as AverageLevel,
      -- Performance metrics (simplified - using available columns)
      AVG(CAST(c.RemainGold AS FLOAT)) as AverageGold,
      AVG(CAST(c.Strength AS FLOAT)) as AverageStrength,
      AVG(CAST(c.Intellect AS FLOAT)) as AverageIntellect,
      -- Level progression metrics
      CAST(COUNT(CASE WHEN c.CurLevel >= 50 THEN 1 END) AS FLOAT) / COUNT(*) * 100 as Level50Percent,
      CAST(COUNT(CASE WHEN c.CurLevel >= 80 THEN 1 END) AS FLOAT) / COUNT(*) * 100 as Level80Percent,
      CAST(COUNT(CASE WHEN c.CurLevel >= 100 THEN 1 END) AS FLOAT) / COUNT(*) * 100 as Level100Percent,
      -- Activity metrics (simplified)
      COUNT(CASE WHEN c.RemainGold > 1000000 THEN 1 END) as WealthyPlayers,
      COUNT(CASE WHEN c.CurLevel > 60 THEN 1 END) as ExperiencedPlayers
    FROM _Char c
    WHERE c.CurLevel > 1 AND c.CharName16 IS NOT NULL AND c.CharName16 != ''
      AND c.CharName16 NOT LIKE '[GM]%'
    GROUP BY 
      CASE
        WHEN c.Strength > c.Intellect THEN 1
        WHEN c.Intellect > c.Strength THEN 2
        ELSE 1
      END
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
