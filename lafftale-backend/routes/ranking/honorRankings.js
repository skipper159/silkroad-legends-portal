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

  let whereClause = 'WHERE TotalPK > 0';

  if (minHonor) {
    whereClause += ' AND TotalPK >= @minHonor';
  }
  if (minKills) {
    whereClause += ' AND DailyPK >= @minKills';
  }

  const query = `
    SELECT * FROM (
      SELECT ROW_NUMBER() OVER (ORDER BY TotalPK DESC) AS rank,
             CharID,
             CharName16,
             TotalPK as HonorPoint,
             DailyPK as Kills,
             CurLevel as Level,
             NULL as LatestHKTime
      FROM _Char 
      ${whereClause}
    ) AS ranked
    WHERE rank > @offset AND rank <= (@offset + @limit)
    ORDER BY rank
  `;

  const request = pool.request().input('offset', sql.Int, offset).input('limit', sql.Int, limit);

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
