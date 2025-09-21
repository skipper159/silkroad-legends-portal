// ranking/honorRankings.js
const { getCharDb, sql } = require('../../db');

/**
 * Get honor rankings with enhanced filtering
 */
async function getHonorRanking(
  limit = 100,
  offset = 0,
  race = null,
  minHonor = null,
  minKills = null
) {
  const pool = await getCharDb();

  let whereClause = 'WHERE Honor > 0';

  if (race && race !== 'all') {
    whereClause += ' AND Race = @race';
  }
  if (minHonor) {
    whereClause += ' AND Honor >= @minHonor';
  }
  if (minKills) {
    whereClause += ' AND PKCount2 >= @minKills';
  }

  const query = `
    SELECT * FROM (
      SELECT ROW_NUMBER() OVER (ORDER BY Honor DESC) AS rank,
             CharName16, Honor, PKCount2 as Kills, Level, Race
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
  if (minHonor) {
    request.input('minHonor', sql.Int, minHonor);
  }
  if (minKills) {
    request.input('minKills', sql.Int, minKills);
  }

  const result = await request.query(query);
  return result.recordset;
}

module.exports = {
  getHonorRanking,
};
