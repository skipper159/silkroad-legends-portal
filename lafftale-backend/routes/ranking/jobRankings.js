// ranking/jobRankings.js - iSRO Job Rankings
const { getCharDb, sql } = require('../../db');
const cache = require('../../utils/cache');
const rankingConfig = require('../../config/ranking');

const PAGE_SIZE = 25;

/**
 * Get Job Rankings for iSRO based on _CharTradeConflictJob
 * Job Types: 1=Hunter, 2=Thief, 0=Trader
 */
async function getJobRanking(jobType, limit = PAGE_SIZE, offset = 0) {
  const cacheKey = `job_ranking_${jobType}_${limit}_${offset}`;

  try {
    // Verwende das verbesserte Cache-System mit remember-Funktion
    return await cache.remember(
      cacheKey,
      async () => {
        const pool = await getCharDb();

        // Job Type mapping for iSRO: 1=Hunter, 2=Thief, 0=Trader
        const validJobTypes = [0, 1, 2];
        if (!validJobTypes.includes(jobType)) {
          throw new Error(`Invalid job type: ${jobType}. Valid types: 1=Hunter, 2=Thief, 0=Trader`);
        }

        const result = await pool
          .request()
          .input('jobType', sql.TinyInt, jobType)
          .input('offset', sql.Int, offset)
          .input('limit', sql.Int, limit).query(`
          SELECT * FROM (
            SELECT
              ROW_NUMBER() OVER (
                ORDER BY 
                  tcj.JobExp DESC,
                  tcj.ReputationPoint DESC, 
                  tcj.JobLevel DESC
              ) AS rank,
              c.CharID,
              c.CharName16,
              c.NickName16,
              c.RefObjID,
              utcj.JobType,
              tcj.JobLevel,
              tcj.JobExp,
              tcj.ReputationPoint,
              tcj.KillCount,
              tcj.Class,
              tcj.Rank as JobRank,
              g.Name as GuildName,
              -- Job Type Name
              CASE utcj.JobType
                WHEN 1 THEN 'Hunter'
                WHEN 2 THEN 'Thief'  
                WHEN 3 THEN 'Trader'
                ELSE 'Unknown'
              END as JobTypeName
            FROM _CharTradeConflictJob tcj
            INNER JOIN _Char c ON c.CharID = tcj.CharID
            INNER JOIN _User u ON u.CharID = c.CharID
            INNER JOIN _UserTradeConflictJob utcj ON utcj.UserJID = u.UserJID
            LEFT JOIN _Guild g ON g.ID = c.GuildID
            WHERE c.deleted = 0
              AND c.CharID > 0
              AND utcj.JobType = @jobType
              AND utcj.JobType != 0
              AND c.NickName16 IS NOT NULL
              AND c.NickName16 != ''
              AND tcj.JobLevel > 0
          ) AS ranked
          WHERE rank > @offset AND rank <= (@offset + @limit)
          ORDER BY rank
        `);

        const data = result.recordset;

        // Überprüfe, ob Daten vorhanden sind
        if (!data || data.length === 0) {
          console.warn(
            `No job ranking data found for jobType=${jobType}, limit=${limit}, offset=${offset}`
          );
        } else {
          console.log(`Found ${data.length} job ranking entries for jobType=${jobType}`);
        }

        return data;
      },
      rankingConfig.cache.ranking_job * 60
    );
  } catch (error) {
    console.error(`Error fetching job ranking for type ${jobType}:`, error);
    throw error;
  }
}

/**
 * Get Hunter Rankings (JobType = 1)
 */
async function getHunterRanking(limit = PAGE_SIZE, offset = 0) {
  return getJobRanking(1, limit, offset);
}

/**
 * Get Thief Rankings (JobType = 2)
 */
async function getThiefRanking(limit = PAGE_SIZE, offset = 0) {
  return getJobRanking(2, limit, offset);
}

/**
 * Get Trader Rankings (JobType = 0)
 */
async function getTraderRanking(limit = PAGE_SIZE, offset = 0) {
  return getJobRanking(0, limit, offset);
}

/**
 * Get Job Kill/Death Rankings with real data from _CharTradeConflictJob_Kill
 * Uses actual PvP kill/death statistics from job conflict system
 */
async function getJobKDRanking(limit = 100, offset = 0, jobType = null) {
  const cacheKey = `job_kd_ranking_${limit}_${offset}_${jobType || 'all'}`;

  try {
    // Verwende das verbesserte Cache-System mit remember-Funktion
    return await cache.remember(
      cacheKey,
      async () => {
        const pool = await getCharDb();

        // Build WHERE clause for job type filtering
        let jobTypeFilter = '';
        if (jobType !== null && jobType >= 0 && jobType <= 2) {
          jobTypeFilter = 'AND tc.Class = @jobType';
        }

        const result = await pool
          .request()
          .input('offset', sql.Int, offset)
          .input('limit', sql.Int, limit)
          .input('jobType', sql.TinyInt, jobType).query(`
        WITH RankedResults AS (
          SELECT
            c.CharName16,
            c.CurLevel as Level,
            tc.Class as JobClass,
            tc.JobLevel,
            tc.PromotionPhase,
            tc.KillCount as JobTableKillCount,
            ISNULL(kills.TotalKills, 0) as JobKills,
            ISNULL(deaths.TotalDeaths, 0) as JobDeaths,
            CASE 
              WHEN ISNULL(deaths.TotalDeaths, 0) > 0 THEN 
                CAST(ISNULL(kills.TotalKills, 0) AS FLOAT) / CAST(deaths.TotalDeaths AS FLOAT)
              ELSE 
                CAST(ISNULL(kills.TotalKills, 0) AS FLOAT)
            END as KDRatio,
            CASE
              WHEN tc.Class = 0 THEN 'Trader'
              WHEN tc.Class = 1 THEN 'Hunter'
              WHEN tc.Class = 2 THEN 'Thief'
              ELSE 'Unknown'
            END as JobName,
            CASE
              WHEN roc.CodeName128 LIKE 'CH_%' OR roc.CodeName128 LIKE '%Chinese%' THEN 'Chinese'
              WHEN roc.CodeName128 LIKE 'EU_%' OR roc.CodeName128 LIKE '%European%' THEN 'European'       
              ELSE 'Chinese'
            END as Race,
            ISNULL(g.Name, '') as GuildName,
            tc.JobLevel as TotalJobLevel,
            ROW_NUMBER() OVER (
              ORDER BY 
                -- Primary: K/D Ratio - Das wichtigste Kriterium für K/D Rankings
                CASE 
                  WHEN ISNULL(deaths.TotalDeaths, 0) = 0 THEN 
                    CAST(ISNULL(kills.TotalKills, 0) AS FLOAT) -- Keine Tode = Kills als Ratio
                  ELSE 
                    CAST(ISNULL(kills.TotalKills, 0) AS FLOAT) / CAST(deaths.TotalDeaths AS FLOAT)
                END DESC,
                -- Secondary: JobExp als wichtiger Fortschrittsindikator
                tc.JobExp DESC,
                -- Third: Total Kills bei gleichem K/D Ratio und JobExp
                ISNULL(kills.TotalKills, 0) DESC,
                -- Quaternary: Job Level als finaler Tiebreaker
                tc.JobLevel DESC
            ) as rank
          FROM _Char c
          INNER JOIN _CharTradeConflictJob tc ON c.CharID = tc.CharID
          LEFT JOIN _RefObjChar rchar ON c.RefObjID = rchar.ID
          LEFT JOIN _RefObjCommon roc ON rchar.ID = roc.ID
          LEFT JOIN (
            SELECT CharID, COUNT(*) as TotalKills
            FROM _CharTradeConflictJob_Kill
            GROUP BY CharID
          ) kills ON c.CharID = kills.CharID
          LEFT JOIN (
            SELECT KilledCharID, COUNT(*) as TotalDeaths
            FROM _CharTradeConflictJob_Kill
            GROUP BY KilledCharID
          ) deaths ON c.CharID = deaths.KilledCharID
          LEFT JOIN _GuildMember gm ON c.CharID = gm.CharID
          LEFT JOIN _Guild g ON gm.GuildID = g.ID
          WHERE c.Deleted = 0 
            AND tc.Class IS NOT NULL
            AND (ISNULL(kills.TotalKills, 0) > 0 OR ISNULL(deaths.TotalDeaths, 0) > 0 OR tc.JobLevel > 1)
            ${jobTypeFilter}
        )
        SELECT * FROM RankedResults
        WHERE rank >= (@offset + 1) AND rank <= (@offset + @limit)
        ORDER BY rank
      `);

        const data = result.recordset;

        // Überprüfe, ob Daten vorhanden sind
        if (!data || data.length === 0) {
          console.warn(
            `No job K/D ranking data found for jobType=${jobType}, limit=${limit}, offset=${offset}`
          );
        } else {
          console.log(
            `Found ${data.length} job K/D ranking entries for jobType=${jobType || 'all'}`
          );
        }

        return data;
      },
      rankingConfig.cache.ranking_job * 60
    );
  } catch (error) {
    console.error('Error fetching job K/D ranking:', error);
    throw error;
  }
}

module.exports = {
  getTraderRanking,
  getThiefRanking,
  getHunterRanking,
  getJobKDRanking,
};
