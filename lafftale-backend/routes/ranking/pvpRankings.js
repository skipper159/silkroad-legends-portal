// ranking/pvpRankings.js
const { getCharDb, sql } = require('../../db');

/**
 * Get PvP rankings with enhanced filtering
 */
async function getPvPRanking(
  limit = 100,
  offset = 0,
  race = null,
  minKills = null,
  maxDeaths = null
) {
  const pool = await getCharDb();

  let whereClause = 'WHERE PKCount2 > 0';

  if (race && race !== 'all') {
    whereClause += ' AND Race = @race';
  }
  if (minKills) {
    whereClause += ' AND PKCount2 >= @minKills';
  }
  if (maxDeaths) {
    whereClause += ' AND DiedCount <= @maxDeaths';
  }

  const query = `
    SELECT * FROM (
      SELECT ROW_NUMBER() OVER (ORDER BY PKCount2 DESC, DiedCount ASC) AS rank,
             CharName16, PKCount2 as Kills, DiedCount as Deaths, 
           CASE 
             WHEN DiedCount > 0 THEN CAST(PKCount2 AS FLOAT) / DiedCount 
             ELSE PKCount2 
           END as KDRatio,
           Level, Race
    FROM _Char 
    ${whereClause}
  ) AS ranked
  WHERE rank > @offset AND rank <= (@offset + @limit)
  ORDER BY rank
  `;

  const request = pool.request().input('offset', sql.Int, offset).input('limit', sql.Int, limit);

  if (race && race !== 'all') {
    request.input('race', sql.TinyInt, parseInt(race));
  }
  if (minKills) {
    request.input('minKills', sql.Int, minKills);
  }
  if (maxDeaths) {
    request.input('maxDeaths', sql.Int, maxDeaths);
  }

  const result = await request.query(query);
  return result.recordset;
}

module.exports = {
  getPvPRanking,
};
