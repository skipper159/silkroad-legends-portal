// ranking/fortressRankings.js
const { getCharDb, sql } = require('../../db');
const cache = require('../../utils/cache');
const rankingConfig = require('../../config/ranking');

const PAGE_SIZE = 25; // Standard page size for rankings

/**
 * Get fortress player rankings with enhanced filtering
 */
async function getFortressPlayerRanking(
  limit = 100,
  offset = 0,
  race = null,
  minLevel = null,
  guild = null
) {
  const pool = await getCharDb();

  let whereClause = 'WHERE c.Level > 1';
  let joinClause = 'FROM _Char c';

  if (guild) {
    joinClause += ' LEFT JOIN Guild g ON c.GuildID = g.ID';
    whereClause += ' AND g.Name LIKE @guild';
  }

  if (race && race !== 'all') {
    whereClause += ' AND c.Race = @race';
  }
  if (minLevel) {
    whereClause += ' AND c.Level >= @minLevel';
  }

  const query = `
    SELECT * FROM (
      SELECT ROW_NUMBER() OVER (ORDER BY c.Level DESC, c.Exp DESC) AS rank,
             c.CharName16, c.Level, c.Race, c.JobType,
             ${guild ? 'g.Name as GuildName' : 'NULL as GuildName'}
      ${joinClause}
      ${whereClause}
    ) AS ranked
    WHERE rank > @offset AND rank <= (@offset + @limit)
    ORDER BY rank
  `;

  const request = pool.request().input('offset', sql.Int, offset).input('limit', sql.Int, limit);

  if (race && race !== 'all') {
    request.input('race', sql.TinyInt, parseInt(race));
  }
  if (minLevel) {
    request.input('minLevel', sql.TinyInt, minLevel);
  }
  if (guild) {
    request.input('guild', sql.NVarChar, `%${guild}%`);
  }

  const result = await request.query(query);
  return result.recordset;
}

/**
 * Get fortress guild rankings based on combined member performance
 */
async function getFortressGuildRanking(limit = PAGE_SIZE, offset = 0) {
  const cacheKey = `fortress_guild_ranking_${limit}_${offset}`;
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
            ROW_NUMBER() OVER (ORDER BY g.Lvl DESC, g.GatheredSP DESC) AS rank,
            g.Name as GuildName,
            g.Lvl as GuildLevel,
            g.GatheredSP as GuildExp,
          COUNT(gm.CharID) AS TotalMembers,
          AVG(CAST(c.CurLevel AS FLOAT)) AS AvgMemberLevel,
          SUM(CASE WHEN c.CurLevel >= 100 THEN 1 ELSE 0 END) AS HighLevelMembers,
          MAX(c.CurLevel) AS TopMemberLevel,
          c_master.CharName16 AS MasterName
        FROM _Guild g
        LEFT JOIN _GuildMember gm ON g.ID = gm.GuildID
        LEFT JOIN _Char c ON gm.CharID = c.CharID AND c.Deleted = 0
        LEFT JOIN _GuildMember gm_master ON g.ID = gm_master.GuildID AND gm_master.MemberClass = 0
        LEFT JOIN _Char c_master ON gm_master.CharID = c_master.CharID
        WHERE g.Lvl > 0
        GROUP BY g.ID, g.Name, g.Lvl, g.GatheredSP, c_master.CharName16
      ) AS ranked
      WHERE rank > @offset AND rank <= (@offset + @limit)
      ORDER BY rank
      `);

    const data = result.recordset;

    // Cache for 30 minutes
    cache.set(cacheKey, data, rankingConfig.cache.ranking_fortress * 60);

    return data;
  } catch (error) {
    console.error('Error fetching fortress guild ranking:', error);
    throw error;
  }
}

module.exports = {
  getFortressPlayerRanking,
  getFortressGuildRanking,
};
