// routes/ranking.js
const express = require('express');
const router = express.Router();
const { getCharDb, getLogDb, sql } = require('../db');

const PAGE_SIZE = 25;

// Helper functions for different ranking types
async function getPlayerRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      SELECT ROW_NUMBER() OVER (ORDER BY Level DESC, Exp DESC) AS rank,
             CharName16, Level, Exp, JobLevel, JobType
      FROM _Char 
      WHERE Level > 1
      ORDER BY Level DESC, Exp DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);
  return result.recordset;
}

async function getGuildRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit) ROW_NUMBER() OVER (ORDER BY Level DESC, GatheredSP DESC) AS rank,
             Name as GuildName, Level, GatheredSP, 
             (SELECT COUNT(*) FROM GuildMember WHERE GuildID = Guild.ID) as MemberCount
      FROM Guild 
      WHERE Level > 0
      ORDER BY Level DESC, GatheredSP DESC
      OFFSET @offset ROWS
    `);
  return result.recordset;
}

async function getUniqueRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit) ROW_NUMBER() OVER (ORDER BY UniqueKills DESC) AS rank,
             CharName16, UniqueKills
      FROM _Char 
      WHERE UniqueKills > 0
      ORDER BY UniqueKills DESC
      OFFSET @offset ROWS
    `);
  return result.recordset;
}

async function getUniqueMonthlyRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit) ROW_NUMBER() OVER (ORDER BY MonthlyUniqueKills DESC) AS rank,
             CharName16, MonthlyUniqueKills
      FROM _Char 
      WHERE MonthlyUniqueKills > 0 
        AND MONTH(LastUniqueKill) = MONTH(GETDATE()) 
        AND YEAR(LastUniqueKill) = YEAR(GETDATE())
      ORDER BY MonthlyUniqueKills DESC
      OFFSET @offset ROWS
    `);
  return result.recordset;
}

async function getHonorRanking(limit, offset, race = null, minHonor = null) {
  const pool = await getCharDb();
  const request = pool.request();
  
  let whereClause = 'WHERE Honor > 0 OR HwanLevel > 0';
  
  if (race) {
    if (race === 'Chinese') {
      whereClause += ' AND RefObjID <= 2000';
    } else if (race === 'European') {
      whereClause += ' AND RefObjID > 2000';
    }
  }
  
  if (minHonor) {
    request.input('minHonor', sql.Int, minHonor);
    whereClause += ' AND Honor >= @minHonor';
  }
  
  request
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit);
    
  const result = await request.query(`
      SELECT ROW_NUMBER() OVER (ORDER BY Honor DESC, HwanLevel DESC) AS rank,
             CharName16, Honor, HwanLevel, RefObjID, Level,
             CASE 
               WHEN RefObjID > 2000 THEN 'European' 
               ELSE 'Chinese' 
             END as Race,
             CASE 
               WHEN RefObjID > 2000 THEN
                 CASE HwanLevel
                   WHEN 1 THEN 'Knight'
                   WHEN 2 THEN 'Baronet' 
                   WHEN 3 THEN 'Baron'
                   WHEN 4 THEN 'Count'
                   WHEN 5 THEN 'Marquis'
                   WHEN 6 THEN 'Duke'
                   ELSE 'None'
                 END
               ELSE
                 CASE HwanLevel
                   WHEN 1 THEN 'Captain'
                   WHEN 2 THEN 'General'
                   WHEN 3 THEN 'Senior General'
                   WHEN 4 THEN 'Chief General'
                   WHEN 5 THEN 'Vice Lord'
                   WHEN 6 THEN 'General Lord'
                   ELSE 'None'
                 END
             END as HwanTitle,
             (SELECT g.Name FROM Guild g 
              INNER JOIN GuildMember gm ON g.ID = gm.GuildID 
              WHERE gm.CharID = _Char.CharID) as Guild
      FROM _Char 
      ${whereClause}
      ORDER BY Honor DESC, HwanLevel DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);
  return result.recordset;
}

async function getJobRanking(limit, offset, jobType = null) {
  const pool = await getCharDb();
  let whereClause = 'WHERE JobLevel > 0';
  if (jobType) {
    whereClause = `WHERE JobLevel > 0 AND JobType = ${jobType}`;
  }

  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      SELECT ROW_NUMBER() OVER (ORDER BY JobLevel DESC, JobExp DESC) AS rank,
             CharName16, JobLevel, JobExp, JobType
      FROM _Char 
      ${whereClause}
      ORDER BY JobLevel DESC, JobExp DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);
  return result.recordset;
}

async function getFortressPlayerRanking(limit, offset, race = null, minKills = null) {
  const pool = await getCharDb();
  const request = pool.request();
  
  let whereClause = 'WHERE c.FortressKills > 0';
  
  if (race) {
    if (race === 'Chinese') {
      whereClause += ' AND c.RefObjID <= 2000';
    } else if (race === 'European') {
      whereClause += ' AND c.RefObjID > 2000';
    }
  }
  
  if (minKills) {
    request.input('minKills', sql.Int, minKills);
    whereClause += ' AND c.FortressKills >= @minKills';
  }
  
  request
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit);
    
  const result = await request.query(`
      SELECT ROW_NUMBER() OVER (ORDER BY FortressKills DESC) AS rank,
             c.CharName16, c.FortressKills, c.RefObjID, c.Level,
             CASE 
               WHEN c.RefObjID > 2000 THEN 'European' 
               ELSE 'Chinese' 
             END as Race,
             g.Name as Guild
      FROM _Char c
      LEFT JOIN Guild g ON c.GuildID = g.ID
      ${whereClause}
      ORDER BY c.FortressKills DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);
  return result.recordset;
}

async function getFortressGuildRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit) ROW_NUMBER() OVER (ORDER BY FortressPoints DESC) AS rank,
             g.Name as GuildName, g.FortressPoints, g.Level as GuildLevel,
             (SELECT COUNT(*) FROM GuildMember gm WHERE gm.GuildID = g.ID) as MemberCount,
             (SELECT c.CharName16 FROM _Char c 
              JOIN GuildMember gm ON c.CharID = gm.CharID 
              WHERE gm.GuildID = g.ID AND gm.MemberClass = 1) as LeaderName
      FROM Guild g
      WHERE g.FortressPoints > 0
      ORDER BY g.FortressPoints DESC
      OFFSET @offset ROWS
    `);
  return result.recordset;
}

async function getPvPRanking(limit, offset, race = null, minKD = null, minKills = null) {
  const pool = await getCharDb();
  const request = pool.request();
  
  let whereClause = 'WHERE c.PKCount > 0';
  
  if (race) {
    if (race === 'Chinese') {
      whereClause += ' AND c.RefObjID <= 2000';
    } else if (race === 'European') {
      whereClause += ' AND c.RefObjID > 2000';
    }
  }
  
  if (minKD) {
    request.input('minKD', sql.Float, minKD);
    whereClause += ' AND (CASE WHEN c.DiedCount = 0 THEN c.PKCount ELSE CAST(c.PKCount AS FLOAT) / c.DiedCount END) >= @minKD';
  }
  
  if (minKills) {
    request.input('minKills', sql.Int, minKills);
    whereClause += ' AND c.PKCount >= @minKills';
  }
  
  request
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit);
    
  const result = await request.query(`
      SELECT ROW_NUMBER() OVER (ORDER BY (CAST(PKCount AS FLOAT) / NULLIF(DiedCount, 0)) DESC) AS rank,
             c.CharName16, c.PKCount, c.DiedCount, c.RefObjID, c.Level,
             CASE 
               WHEN c.RefObjID > 2000 THEN 'European' 
               ELSE 'Chinese' 
             END as Race,
             CASE WHEN c.DiedCount = 0 THEN c.PKCount ELSE CAST(c.PKCount AS FLOAT) / c.DiedCount END AS KDRatio,
             g.Name as Guild
      FROM _Char c
      LEFT JOIN Guild g ON c.GuildID = g.ID
      ${whereClause}
      ORDER BY (CAST(c.PKCount AS FLOAT) / NULLIF(c.DiedCount, 0)) DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);
  return result.recordset;
}

async function getPvPKDRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit) ROW_NUMBER() OVER (ORDER BY (CAST(PKCount AS FLOAT) / NULLIF(DiedCount, 0)) DESC) AS rank,
             c.CharName16, c.PKCount, c.DiedCount, c.RefObjID, c.CurLevel,
             CASE 
               WHEN c.RefObjID > 2000 THEN 'Europe' 
               ELSE 'Chinese' 
             END as Race,
             CASE WHEN c.DiedCount = 0 THEN c.PKCount ELSE CAST(c.PKCount AS FLOAT) / c.DiedCount END AS KDRatio,
             g.Name as GuildName
      FROM _Char c
      LEFT JOIN Guild g ON c.GuildID = g.ID
      WHERE c.PKCount > 0
      ORDER BY (CAST(c.PKCount AS FLOAT) / NULLIF(c.DiedCount, 0)) DESC
      OFFSET @offset ROWS
    `);
  return result.recordset;
}

async function getJobKDRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      SELECT TOP (@limit) ROW_NUMBER() OVER (ORDER BY (CAST(JobKills AS FLOAT) / NULLIF(JobDeaths, 0)) DESC) AS rank,
             CharName16, JobKills, JobDeaths,
             CASE WHEN JobDeaths = 0 THEN JobKills ELSE CAST(JobKills AS FLOAT) / JobDeaths END AS JobKDRatio
      FROM _Char
      WHERE JobKills > 0
      ORDER BY (CAST(JobKills AS FLOAT) / NULLIF(JobDeaths, 0)) DESC
      OFFSET @offset ROWS
    `);
  return result.recordset;
}

// Job Rankings based on _CharTrijob (vSRO style)
async function getJobAllRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      WITH JobRanking AS (
        SELECT 
          ROW_NUMBER() OVER (ORDER BY tj.Exp DESC, tj.Level DESC) AS rank,
          c.CharName16,
          c.RefObjID,
          tj.JobType,
          tj.Level AS JobLevel,
          tj.Exp AS JobExp,
          tj.Contribution,
          tj.Reward,
          -- Race detection
          CASE 
            WHEN c.RefObjID >= 1907 AND c.RefObjID <= 1932 THEN 'Chinese'
            ELSE 'European'
          END AS race
        FROM _CharTrijob tj
        INNER JOIN _Char c ON c.CharID = tj.CharID
        WHERE c.Deleted = 0 
          AND tj.JobType > 0
          AND tj.Level > 0
      )
      SELECT * FROM JobRanking
      WHERE rank > @offset AND rank <= (@offset + @limit)
      ORDER BY rank
    `);
  return result.recordset;
}

async function getJobTraderRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      WITH JobRanking AS (
        SELECT 
          ROW_NUMBER() OVER (ORDER BY tj.Exp DESC, tj.Level DESC) AS rank,
          c.CharName16,
          c.RefObjID,
          tj.JobType,
          tj.Level AS JobLevel,
          tj.Exp AS JobExp,
          tj.Contribution,
          tj.Reward,
          -- Race detection
          CASE 
            WHEN c.RefObjID >= 1907 AND c.RefObjID <= 1932 THEN 'Chinese'
            ELSE 'European'
          END AS race
        FROM _CharTrijob tj
        INNER JOIN _Char c ON c.CharID = tj.CharID
        WHERE c.Deleted = 0 
          AND tj.JobType = 1
          AND tj.Level > 0
      )
      SELECT * FROM JobRanking
      WHERE rank > @offset AND rank <= (@offset + @limit)
      ORDER BY rank
    `);
  return result.recordset;
}

async function getJobThiefRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      WITH JobRanking AS (
        SELECT 
          ROW_NUMBER() OVER (ORDER BY tj.Exp DESC, tj.Level DESC) AS rank,
          c.CharName16,
          c.RefObjID,
          tj.JobType,
          tj.Level AS JobLevel,
          tj.Exp AS JobExp,
          tj.Contribution,
          tj.Reward,
          -- Race detection
          CASE 
            WHEN c.RefObjID >= 1907 AND c.RefObjID <= 1932 THEN 'Chinese'
            ELSE 'European'
          END AS race
        FROM _CharTrijob tj
        INNER JOIN _Char c ON c.CharID = tj.CharID
        WHERE c.Deleted = 0 
          AND tj.JobType = 2
          AND tj.Level > 0
      )
      SELECT * FROM JobRanking
      WHERE rank > @offset AND rank <= (@offset + @limit)
      ORDER BY rank
    `);
  return result.recordset;
}

async function getJobHunterRanking(limit, offset) {
  const pool = await getCharDb();
  const result = await pool
    .request()
    .input('offset', sql.Int, offset)
    .input('limit', sql.Int, limit).query(`
      WITH JobRanking AS (
        SELECT 
          ROW_NUMBER() OVER (ORDER BY tj.Exp DESC, tj.Level DESC) AS rank,
          c.CharName16,
          c.RefObjID,
          tj.JobType,
          tj.Level AS JobLevel,
          tj.Exp AS JobExp,
          tj.Contribution,
          tj.Reward,
          -- Race detection
          CASE 
            WHEN c.RefObjID >= 1907 AND c.RefObjID <= 1932 THEN 'Chinese'
            ELSE 'European'
          END AS race
        FROM _CharTrijob tj
        INNER JOIN _Char c ON c.CharID = tj.CharID
        WHERE c.Deleted = 0 
          AND tj.JobType = 3
          AND tj.Level > 0
      )
      SELECT * FROM JobRanking
      WHERE rank > @offset AND rank <= (@offset + @limit)
      ORDER BY rank
    `);
  return result.recordset;
}

// Phase 3: Advanced Job Statistics APIs
async function getJobStatistics(jobType = null) {
  const pool = await getCharDb();
  const request = pool.request();
  
  let whereClause = 'WHERE c.Deleted = 0 AND tj.Level > 0';
  if (jobType) {
    request.input('jobType', sql.Int, jobType);
    whereClause += ' AND tj.JobType = @jobType';
  }
  
  const result = await request.query(`
    SELECT 
      tj.JobType,
      COUNT(*) AS TotalPlayers,
      AVG(CAST(tj.Level AS FLOAT)) AS AverageLevel,
      MAX(tj.Level) AS MaxLevel,
      MIN(tj.Level) AS MinLevel,
      AVG(CAST(tj.Exp AS FLOAT)) AS AverageExperience,
      MAX(tj.Exp) AS MaxExperience,
      SUM(tj.Contribution) AS TotalContribution,
      AVG(CAST(tj.Contribution AS FLOAT)) AS AverageContribution,
      -- Level Distribution
      SUM(CASE WHEN tj.Level BETWEEN 1 AND 10 THEN 1 ELSE 0 END) AS Level1_10,
      SUM(CASE WHEN tj.Level BETWEEN 11 AND 20 THEN 1 ELSE 0 END) AS Level11_20,
      SUM(CASE WHEN tj.Level BETWEEN 21 AND 30 THEN 1 ELSE 0 END) AS Level21_30,
      SUM(CASE WHEN tj.Level BETWEEN 31 AND 40 THEN 1 ELSE 0 END) AS Level31_40,
      SUM(CASE WHEN tj.Level BETWEEN 41 AND 50 THEN 1 ELSE 0 END) AS Level41_50,
      -- Experience Ranges
      SUM(CASE WHEN tj.Exp BETWEEN 0 AND 1000000 THEN 1 ELSE 0 END) AS Exp0_1M,
      SUM(CASE WHEN tj.Exp BETWEEN 1000001 AND 5000000 THEN 1 ELSE 0 END) AS Exp1M_5M,
      SUM(CASE WHEN tj.Exp BETWEEN 5000001 AND 10000000 THEN 1 ELSE 0 END) AS Exp5M_10M,
      SUM(CASE WHEN tj.Exp > 10000000 THEN 1 ELSE 0 END) AS Exp10M_Plus
    FROM _CharTrijob tj
    INNER JOIN _Char c ON c.CharID = tj.CharID
    ${whereClause}
    GROUP BY tj.JobType
    ORDER BY tj.JobType
  `);
  return result.recordset;
}

async function getJobLeaderboardComparison(limit = 10, includeJobs = [1, 2, 3]) {
  const pool = await getCharDb();
  const request = pool.request();
  
  // Convert includeJobs array to SQL IN clause
  const jobTypes = includeJobs.map((job, index) => {
    request.input(`jobType${index}`, sql.Int, job);
    return `@jobType${index}`;
  }).join(',');
  
  request.input('limit', sql.Int, limit);
  
  const result = await request.query(`
    WITH JobRankings AS (
      SELECT 
        tj.JobType,
        c.CharName16,
        tj.Level AS JobLevel,
        tj.Exp AS JobExp,
        tj.Contribution,
        RANK() OVER (PARTITION BY tj.JobType ORDER BY tj.Exp DESC, tj.Level DESC) AS JobRank,
        RANK() OVER (ORDER BY tj.Exp DESC, tj.Level DESC) AS OverallRank
      FROM _CharTrijob tj
      INNER JOIN _Char c ON c.CharID = tj.CharID
      WHERE c.Deleted = 0 AND tj.Level > 0 AND tj.JobType IN (${jobTypes})
    )
    SELECT * FROM JobRankings
    WHERE JobRank <= @limit
    ORDER BY JobType, JobRank
  `);
  return result.recordset;
}

async function getJobProgressionAnalytics(jobType = null, minLevel = 1, maxLevel = 50) {
  const pool = await getCharDb();
  const request = pool.request();
  
  let whereClause = 'WHERE c.Deleted = 0 AND tj.Level > 0';
  if (jobType) {
    request.input('jobType', sql.Int, jobType);
    whereClause += ' AND tj.JobType = @jobType';
  }
  
  request.input('minLevel', sql.Int, minLevel);
  request.input('maxLevel', sql.Int, maxLevel);
  whereClause += ' AND tj.Level BETWEEN @minLevel AND @maxLevel';
  
  const result = await request.query(`
    WITH ProgressionData AS (
      SELECT 
        tj.JobType,
        tj.Level AS JobLevel,
        COUNT(*) AS PlayerCount,
        AVG(CAST(tj.Exp AS FLOAT)) AS AverageExp,
        MIN(tj.Exp) AS MinExp,
        MAX(tj.Exp) AS MaxExp
      FROM _CharTrijob tj
      INNER JOIN _Char c ON c.CharID = tj.CharID
      ${whereClause}
      GROUP BY tj.JobType, tj.Level
    )
    SELECT 
      JobType,
      JobLevel,
      PlayerCount,
      AverageExp,
      MinExp,
      MaxExp,
      AverageExp AS MedianExp
    FROM ProgressionData
    ORDER BY JobType, JobLevel
  `);
  return result.recordset;
}

// =============================================================================
// SPECIFIC ROUTES - MUST BE BEFORE /:type ROUTE
// =============================================================================

// Phase 3 Analytics APIs
router.get('/job-statistics', async (req, res) => {
  try {
    const jobType = req.query.jobType ? parseInt(req.query.jobType) : null;
    const result = await getJobStatistics(jobType);
    
    res.json({
      success: true,
      statistics: result,
      totalJobs: result.length,
      summary: {
        totalPlayers: result.reduce((sum, job) => sum + job.TotalPlayers, 0),
        mostPopularJob: result.length > 0 ? result.reduce((prev, current) => 
          (prev.TotalPlayers > current.TotalPlayers) ? prev : current).JobType : null,
        averageLevel: result.length > 0 ? 
          result.reduce((sum, job) => sum + job.AverageLevel, 0) / result.length : 0
      }
    });
  } catch (error) {
    console.error('Job statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

router.get('/job-leaderboard-comparison', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const includeJobs = req.query.includeJobs ? 
      req.query.includeJobs.split(',').map(j => parseInt(j)) : [1, 2, 3];
    
    const result = await getJobLeaderboardComparison(limit, includeJobs);
    
    // Group by job type for breakdown
    const jobBreakdown = {
      1: result.filter(entry => entry.JobType === 1),
      2: result.filter(entry => entry.JobType === 2),
      3: result.filter(entry => entry.JobType === 3)
    };
    
    res.json({
      success: true,
      comparison: result,
      jobBreakdown: jobBreakdown
    });
  } catch (error) {
    console.error('Job leaderboard comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

router.get('/job-progression', async (req, res) => {
  try {
    const jobType = parseInt(req.query.jobType);
    if (!jobType || ![1, 2, 3].includes(jobType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid jobType parameter (1=Trader, 2=Thief, 3=Hunter) is required'
      });
    }
    
    const minLevel = parseInt(req.query.minLevel) || 1;
    const maxLevel = parseInt(req.query.maxLevel) || 50;
    
    const result = await getJobProgressionAnalytics(jobType, minLevel, maxLevel);
    
    // Calculate analytics
    const totalPlayersAnalyzed = result.reduce((sum, level) => sum + level.PlayerCount, 0);
    const averageProgression = result.length > 0 ? 
      result.reduce((sum, level) => sum + level.AverageExp, 0) / result.length : 0;
    
    // Determine trend (simplified)
    let progressionTrend = 'stable';
    if (result.length > 1) {
      const firstHalf = result.slice(0, Math.floor(result.length / 2));
      const secondHalf = result.slice(Math.floor(result.length / 2));
      const firstAvg = firstHalf.reduce((sum, l) => sum + l.AverageExp, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, l) => sum + l.AverageExp, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.1) progressionTrend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) progressionTrend = 'decreasing';
    }
    
    res.json({
      success: true,
      jobType: jobType,
      progression: result,
      analytics: {
        totalLevelsAnalyzed: result.length,
        totalPlayersAnalyzed: totalPlayersAnalyzed,
        averageProgression: averageProgression,
        progressionTrend: progressionTrend
      }
    });
  } catch (error) {
    console.error('Job progression error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

// Phase 2 Job Rankings
router.get('/trader', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const result = await getJobTraderRanking(limit, offset);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / limit),
        hasNext: page * limit < result.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Trader ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

router.get('/thief', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const result = await getJobThiefRanking(limit, offset);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / limit),
        hasNext: page * limit < result.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Thief ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

router.get('/hunter', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const result = await getJobHunterRanking(limit, offset);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / limit),
        hasNext: page * limit < result.length,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Hunter ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

// Phase 1 Rankings
router.get('/honor', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const race = req.query.race;
    const minHonor = req.query.minHonor ? parseInt(req.query.minHonor) : null;
    
    const result = await getHonorRanking(limit, offset, race, minHonor);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / limit),
        hasNext: page * limit < result.length,
        hasPrev: page > 1
      },
      summary: {
        totalHonorPoints: result.reduce((sum, player) => sum + (player.Honor || 0), 0),
        averageHonor: result.length > 0 ? result.reduce((sum, player) => sum + (player.Honor || 0), 0) / result.length : 0,
        topHonorPlayer: result.length > 0 ? result[0].CharName16 : null
      }
    });
  } catch (error) {
    console.error('Honor ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

router.get('/fortress', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const race = req.query.race;
    const minKills = req.query.minKills ? parseInt(req.query.minKills) : null;
    
    const result = await getFortressPlayerRanking(limit, offset, race, minKills);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / limit),
        hasNext: page * limit < result.length,
        hasPrev: page > 1
      },
      summary: {
        totalFortressKills: result.reduce((sum, player) => sum + (player.FortressKills || 0), 0),
        averageKills: result.length > 0 ? result.reduce((sum, player) => sum + (player.FortressKills || 0), 0) / result.length : 0,
        topKiller: result.length > 0 ? result[0].CharName16 : null
      }
    });
  } catch (error) {
    console.error('Fortress ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

router.get('/pvp', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const race = req.query.race;
    const minKD = req.query.minKD ? parseFloat(req.query.minKD) : null;
    const minKills = req.query.minKills ? parseInt(req.query.minKills) : null;
    
    const result = await getPvPRanking(limit, offset, race, minKD, minKills);
    
    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / limit),
        hasNext: page * limit < result.length,
        hasPrev: page > 1
      },
      summary: {
        totalPKs: result.reduce((sum, player) => sum + (player.PKCount || 0), 0),
        totalDeaths: result.reduce((sum, player) => sum + (player.DiedCount || 0), 0),
        averageKD: result.length > 0 ? result.reduce((sum, player) => sum + (player.KDRatio || 0), 0) / result.length : 0,
        topPvPPlayer: result.length > 0 ? result[0].CharName16 : null
      }
    });
  } catch (error) {
    console.error('PvP ranking error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error'
    });
  }
});

// =============================================================================
// GENERIC /:type ROUTE - MUST BE AFTER SPECIFIC ROUTES
// =============================================================================

router.get('/:type', async (req, res) => {
  const { type } = req.params;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * PAGE_SIZE;
  const limit = parseInt(req.query.limit) || PAGE_SIZE;

  const validTypes = [
    'top-player',
    'top-guild',
    'unique',
    'unique-monthly',
    'honor',
    'job',
    'job-all',
    'job-hunter',
    'job-thief',
    'job-trader',
    'job-statistics',
    'job-leaderboard-comparison',
    'job-progression',
    'fortress-player',
    'fortress-guild',
    'pvp-kd',
    'job-kd',
  ];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid ranking type' });
  }

  try {
    let result;

    switch (type) {
      case 'top-player':
        result = await getPlayerRanking(limit, offset);
        break;
      case 'top-guild':
        result = await getGuildRanking(limit, offset);
        break;
      case 'unique':
        result = await getUniqueRanking(limit, offset);
        break;
      case 'unique-monthly':
        result = await getUniqueMonthlyRanking(limit, offset);
        break;
      case 'honor':
        result = await getHonorRanking(limit, offset);
        break;
      case 'job':
      case 'job-all':
        result = await getJobAllRanking(limit, offset);
        break;
      case 'job-hunter':
        result = await getJobHunterRanking(limit, offset);
        break;
      case 'job-thief':
        result = await getJobThiefRanking(limit, offset);
        break;
      case 'job-trader':
        result = await getJobTraderRanking(limit, offset);
        break;
      case 'job-statistics':
        result = await getJobStatistics();
        break;
      case 'job-leaderboard-comparison':
        result = await getJobLeaderboardComparison();
        break;
      case 'job-progression':
        const jobType = req.query.jobType ? parseInt(req.query.jobType) : null;
        result = await getJobProgressionAnalytics(jobType);
        break;
      case 'fortress-player':
        result = await getFortressPlayerRanking(limit, offset);
        break;
      case 'fortress-guild':
        result = await getFortressGuildRanking(limit, offset);
        break;
      case 'pvp-kd':
        result = await getPvPKDRanking(limit, offset);
        break;
      case 'job-kd':
        result = await getJobKDRanking(limit, offset);
        break;
      default:
        return res.status(400).json({ error: 'Ranking type not implemented' });
    }

    res.json({
      success: true,
      data: result,
      pagination: {
        currentPage: page,
        pageSize: PAGE_SIZE,
        total: result.length,
      },
    });
  } catch (error) {
    console.error('Ranking error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

// Character Detail View
router.get('/character/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const pool = await getCharDb();
    const characterQuery = `
      SELECT c.CharName16, c.Level, c.Exp, c.RefObjID, c.Honor,
             c.JobLevel, c.JobExp, c.JobType, c.PKCount, c.DiedCount,
             c.JobKills, c.JobDeaths, c.FortressContribution,
             g.Name AS GuildName, g.Level AS GuildLevel
      FROM _Char c
      LEFT JOIN GuildMember gm ON c.CharID = gm.CharID
      LEFT JOIN Guild g ON gm.GuildID = g.ID
      WHERE c.CharName16 = @name
    `;

    const result = await pool.request().input('name', sql.NVarChar, name).query(characterQuery);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('Character detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

// Guild Detail View
router.get('/guild/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const pool = await getCharDb();
    const guildQuery = `
      SELECT g.Name AS GuildName, g.Level, g.GatheredSP, g.FortressPoints,
             COUNT(gm.CharID) AS MemberCount,
             c_master.CharName16 AS MasterName
      FROM Guild g
      LEFT JOIN GuildMember gm ON g.ID = gm.GuildID
      LEFT JOIN GuildMember gm_master ON g.ID = gm_master.GuildID AND gm_master.MemberClass = 0
      LEFT JOIN _Char c_master ON gm_master.CharID = c_master.CharID
      WHERE g.Name = @name
      GROUP BY g.Name, g.Level, g.GatheredSP, g.FortressPoints, c_master.CharName16
    `;

    const membersQuery = `
      SELECT c.CharName16, c.Level, gm.MemberClass, gm.SilkPay
      FROM Guild g
      JOIN GuildMember gm ON g.ID = gm.GuildID
      JOIN _Char c ON gm.CharID = c.CharID
      WHERE g.Name = @name
      ORDER BY gm.MemberClass ASC, c.Level DESC
    `;

    const guildResult = await pool.request().input('name', sql.NVarChar, name).query(guildQuery);

    const membersResult = await pool
      .request()
      .input('name', sql.NVarChar, name)
      .query(membersQuery);

    if (guildResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    res.json({
      success: true,
      data: {
        guild: guildResult.recordset[0],
        members: membersResult.recordset,
      },
    });
  } catch (error) {
    console.error('Guild detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

module.exports = router;
