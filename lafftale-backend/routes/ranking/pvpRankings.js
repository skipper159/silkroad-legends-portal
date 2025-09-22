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

  let whereClause = 'WHERE TotalPK > 0';

  if (minKills) {
    whereClause += ' AND TotalPK >= @minKills';
  }
  if (maxDeaths) {
    whereClause += ' AND DailyPK <= @maxDeaths';
  }

  const query = `
    SELECT * FROM (
      SELECT ROW_NUMBER() OVER (ORDER BY TotalPK DESC, DailyPK ASC) AS rank,
             CharID,
             CharName16,
             TotalPK as PK_Count, 
             DailyPK as PD_Count, 
           CASE 
             WHEN DailyPK > 0 THEN CAST(TotalPK AS FLOAT) / DailyPK 
             ELSE TotalPK 
           END as KDRatio,
           CurLevel as Level
    FROM _Char 
    ${whereClause}
  ) AS ranked
  WHERE rank > @offset AND rank <= (@offset + @limit)
  ORDER BY rank
  `;

  const request = pool.request().input('offset', sql.Int, offset).input('limit', sql.Int, limit);

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
