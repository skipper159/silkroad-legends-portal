// ranking/hunter_rankings.js - iSRO Hunter Rankings
const { getCharDb, sql } = require('../../db');
const cache = require('../../utils/cache');
const rankingConfig = require('../../config/ranking');

const PAGE_SIZE = 100;

/**
 * Get Hunter Rankings for iSRO based on _CharTradeConflictJob
 * JobType 1 = Hunter
 */
async function getHunterRankings(limit = PAGE_SIZE, offset = 0) {
  // Debug logging
  console.log('[DEBUG] getHunterRankings called with limit:', limit, 'offset:', offset);

  try {
    // Verwende das verbesserte Cache-System mit remember-Funktion
    return await cache.remember(
      `hunter_ranking_${limit}_${offset}`,
      async () => {
        console.log('[DEBUG] Hunter cache miss, querying database...');
        const pool = await getCharDb();

        const result = await pool
          .request()
          .input('jobType', sql.TinyInt, 1) // Hunter = 1
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
              0 AS DeathCount,
              tcj.Class,
              (tcj.JobLevel * 1000000 + tcj.JobExp) AS JobRank,
              g.Name AS GuildName,
              CASE 
                WHEN c.RefObjID BETWEEN 1907 AND 1932 THEN 'Chinese'
                ELSE 'European'
              END AS Race,
              'Hunter' AS JobTypeName
            FROM _Char c
            INNER JOIN _CharTradeConflictJob tcj ON c.CharID = tcj.CharID
            INNER JOIN _User u ON c.CharID = u.CharID
            INNER JOIN _UserTradeConflictJob utcj ON u.UserJID = utcj.UserJID
            LEFT JOIN _Guild g ON c.GuildID = g.ID
            WHERE c.Deleted = 0 
              AND utcj.JobType = @jobType
              AND tcj.JobLevel > 0
          ) ranked_data
          WHERE rank > @offset AND rank <= (@offset + @limit)
          ORDER BY rank
        `);

        console.log('[DEBUG] SQL query executed, result:', result ? 'success' : 'null');
        console.log('[DEBUG] Has recordset?', result && result.recordset ? 'yes' : 'no');
        console.log(
          '[DEBUG] recordset length:',
          result && result.recordset ? result.recordset.length : 'N/A'
        );

        const data = result?.recordset || [];
        console.log(
          '[DEBUG] data after assignment:',
          data ? `Array of ${data.length} items` : 'null/undefined'
        );

        if (data.length === 0) {
          // Führe eine direkte Debug-Abfrage aus, um zu sehen, ob grundsätzlich Daten vorhanden sind
          console.log('[DEBUG] No data found, running debug query...');
          try {
            const debugResult = await pool.request().input('jobType', sql.TinyInt, 1).query(`
            SELECT TOP 10
              c.CharID,
              c.CharName16,
              utcj.JobType,
              tcj.JobLevel
            FROM _Char c
            INNER JOIN _CharTradeConflictJob tcj ON c.CharID = tcj.CharID
            INNER JOIN _User u ON c.CharID = u.CharID
            INNER JOIN _UserTradeConflictJob utcj ON u.UserJID = utcj.UserJID
            WHERE utcj.JobType = @jobType AND c.Deleted = 0
          `);

            console.log('[Hunter Rankings] Debug query results:', debugResult.recordset);
          } catch (debugError) {
            console.error('[Hunter Rankings] Debug query error:', debugError);
          }
        }

        return data;
      },
      rankingConfig.cache.ranking_job * 60
    );
  } catch (error) {
    console.error('Error fetching hunter rankings:', error);
    console.error('Full error details:', error);
    throw error;
  }
}

/**
 * Get Hunter Statistics
 */
async function getHunterStatistics() {
  try {
    // Verwende das verbesserte Cache-System mit remember-Funktion
    return await cache.remember(
      'hunter_statistics',
      async () => {
        const pool = await getCharDb();

        const result = await pool.request().input('jobType', sql.TinyInt, 1).query(`
          SELECT 
            COUNT(*) AS totalHunters,
            AVG(CAST(tcj.JobLevel AS FLOAT)) AS averageLevel,
            MAX(tcj.JobLevel) AS maxLevel,
            SUM(tcj.KillCount) AS totalKills,
            AVG(CAST(tcj.ReputationPoint AS FLOAT)) AS averageReputation
          FROM _Char c
          INNER JOIN _CharTradeConflictJob tcj ON c.CharID = tcj.CharID
          INNER JOIN _User u ON c.CharID = u.CharID
          INNER JOIN _UserTradeConflictJob utcj ON u.UserJID = utcj.UserJID
          WHERE c.Deleted = 0 
            AND utcj.JobType = @jobType
            AND tcj.JobLevel > 0
        `);

        const stats = result?.recordset?.[0] || {
          totalHunters: 0,
          averageLevel: 0,
          maxLevel: 0,
          totalKills: 0,
          averageReputation: 0,
        };

        // Debug log
        console.log('[DEBUG] Hunter statistics:', stats);

        return stats;
      },
      60 * 60
    ); // Cache für 1 Stunde
  } catch (error) {
    console.error('Error fetching hunter statistics:', error);
    throw error;
  }
}

module.exports = {
  getHunterRankings,
  getHunterStatistics,
};
