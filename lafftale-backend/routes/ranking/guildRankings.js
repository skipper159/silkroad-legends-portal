// ranking/guildRankings.js
const { getCharDb, sql } = require('../../db');

/**
 * Get guild rankings with schema-compatible queries
 */
async function getGuildRanking(limit = 100, offset = 0, options = {}) {
  // Validate and sanitize parameters
  const validatedLimit = isNaN(limit) ? 100 : Math.min(Math.max(parseInt(limit), 1), 1000);
  const validatedOffset = isNaN(offset) ? 0 : Math.max(parseInt(offset), 0);

  const pool = await getCharDb();
  const queryBuilder = require('../../utils/queryBuilder');

  try {
    const { query, parameters } = queryBuilder.buildGuildRankingQuery({
      limit: validatedLimit,
      offset: validatedOffset,
      guildName: options.guildName,
      minMembers: options.minMembers || 3,
    });

    const request = queryBuilder.applyParameters(pool.request(), parameters);
    const result = await request.query(query);

    return result.recordset.map((guild) => ({
      rank: guild.rank,
      GuildName: guild.GuildName,
      Level: guild.Level,
      MemberCount: guild.MemberCount,
      AvgLevel: guild.AvgLevel || 0,
      MaxLevel: guild.MaxLevel || 0,
    }));
  } catch (error) {
    console.error('Guild ranking query error:', error);
    // Fallback to simple query
    const result = await pool
      .request()
      .input('offset', sql.Int, validatedOffset)
      .input('limit', sql.Int, validatedLimit).query(`
        SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY COUNT(c.CharID) DESC, g.Lvl DESC) AS rank,
                 g.Name as GuildName, g.Lvl as Level, COUNT(c.CharID) as MemberCount,
                 AVG(CAST(c.CurLevel AS FLOAT)) as AvgLevel,
                 MAX(c.CurLevel) as MaxLevel
          FROM _Guild g
          LEFT JOIN _Char c ON g.ID = c.GuildID AND c.Deleted = 0
          GROUP BY g.ID, g.Name, g.Lvl
          HAVING COUNT(c.CharID) > 0
        ) AS ranked
        WHERE rank > @offset AND rank <= (@offset + @limit)
        ORDER BY rank
      `);
    return result.recordset;
  }
}

module.exports = {
  getGuildRanking,
};
