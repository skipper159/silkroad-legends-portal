/**
 * SQL Query Builder für SQL Server 2008 Kompatibilität
 * Alle Queries verwenden ROW_NUMBER() statt FETCH NEXT für Pagination
 */

class QueryBuilder {
  /**
   * Erstellt eine paginierte Query mit ROW_NUMBER() für SQL Server 2008
   */
  static buildPaginatedQuery(
    selectClause,
    fromClause,
    whereClause = '',
    orderByClause,
    limit = 50,
    offset = 0
  ) {
    const outerQuery = `
            WITH RankedResults AS (
                SELECT ${selectClause},
                       ROW_NUMBER() OVER (${orderByClause}) as rn
                FROM ${fromClause}
                ${whereClause ? `WHERE ${whereClause}` : ''}
            )
            SELECT * FROM RankedResults
            WHERE rn > ${offset} AND rn <= ${offset + limit}
            ORDER BY rn
        `;
    return outerQuery.trim();
  }

  /**
   * Unique Player Rankings - vereinfacht für SQL Server 2008
   */
  static buildUniqueRankingQuery(type = 'all', limit = 50, offset = 0) {
    let selectClause,
      fromClause,
      whereClause = '',
      orderByClause;

    switch (type) {
      case 'unique':
        selectClause = `
                    c.CharName16 as playerName,
                    c.CurLevel as level,
                    g.Name as guildName
                `;
        fromClause = `_Char c LEFT JOIN _Guild g ON c.GuildID = g.ID`;
        whereClause = `c.CharName16 IS NOT NULL AND c.CharName16 != '' AND c.CurLevel > 1`;
        orderByClause = `ORDER BY c.CurLevel DESC`;
        break;

      case 'unique-monthly':
        selectClause = `
                    c.CharName16 as playerName,
                    c.CurLevel as level,
                    g.Name as guildName
                `;
        fromClause = `_Char c LEFT JOIN _Guild g ON c.GuildID = g.ID`;
        whereClause = `c.CharName16 IS NOT NULL AND c.CharName16 != '' 
                             AND c.CurLevel > 1 
                             AND c.LastLogout >= DATEADD(month, -1, GETDATE())`;
        orderByClause = `ORDER BY c.CurLevel DESC`;
        break;

      default:
        selectClause = `
                    c.CharName16 as playerName,
                    c.CurLevel as level,
                    g.Name as guildName
                `;
        fromClause = `_Char c LEFT JOIN _Guild g ON c.GuildID = g.ID`;
        whereClause = `c.CharName16 IS NOT NULL AND c.CharName16 != '' AND c.CurLevel > 1`;
        orderByClause = `ORDER BY c.CurLevel DESC`;
    }

    return this.buildPaginatedQuery(
      selectClause,
      fromClause,
      whereClause,
      orderByClause,
      limit,
      offset
    );
  }

  /**
   * Wendet Parameter auf eine Query an (für Kompatibilität mit altem Code)
   */
  static applyParameters(query, params = {}) {
    // Einfache Parameter-Ersetzung für SQL Server 2008
    let finalQuery = query;

    Object.keys(params).forEach((key) => {
      const value = params[key];
      // Escape SQL values properly
      if (typeof value === 'string') {
        finalQuery = finalQuery.replace(
          new RegExp(`@${key}`, 'g'),
          `'${value.replace(/'/g, "''")}'`
        );
      } else if (value === null || value === undefined) {
        finalQuery = finalQuery.replace(new RegExp(`@${key}`, 'g'), 'NULL');
      } else {
        finalQuery = finalQuery.replace(new RegExp(`@${key}`, 'g'), value.toString());
      }
    });

    return finalQuery;
  }

  /**
   * Build player ranking query with advanced filtering options
   */
  static buildPlayerRankingQuery(options = {}) {
    const {
      limit = 100,
      offset = 0,
      charId,
      charName,
      race,
      minLevel = 1,
      includeItemPoints = true,
    } = options;

    let selectClause = `
      c.CharID,
      c.CharName16 as CharName,
      c.CurLevel,
      1 as Race, -- All characters are human (TypeID2 = 1)
      CASE
        WHEN c.Strength > c.Intellect THEN 1 -- Warrior
        WHEN c.Intellect > c.Strength THEN 2 -- Magician
        ELSE 1 -- Default to Warrior
      END as JobType,
      c.RemainGold,
      g.Name as GuildName
    `;

    if (includeItemPoints) {
      selectClause += `,
        ISNULL((
          SELECT SUM(CASE
            WHEN i.ItemID BETWEEN 1 AND 6 THEN 1  -- Armor pieces
            WHEN i.ItemID IN (7, 8) THEN 2         -- Weapons
            WHEN i.ItemID = 9 THEN 3               -- Shield
            ELSE 0
          END)
          FROM _Inventory i
          WHERE i.CharID = c.CharID AND i.Slot BETWEEN 0 AND 12
        ), 0) as ItemPoints
      `;
    }

    let fromClause = `_Char c LEFT JOIN _Guild g ON c.GuildID = g.ID`;
    let whereClause = `c.CharName16 IS NOT NULL AND c.CharName16 != '' AND c.CurLevel >= ${minLevel}`;

    const parameters = {};

    if (charId) {
      whereClause += ` AND c.CharID = @charId`;
      parameters.charId = charId;
    }

    if (charName) {
      whereClause += ` AND c.CharName16 LIKE @charName`;
      parameters.charName = `%${charName}%`;
    }

    if (race !== undefined) {
      whereClause += ` AND 1 = @race`; // All characters are race 1 (human)
      parameters.race = race;
    }

    const orderByClause = `ORDER BY c.CurLevel DESC, c.CharName16 ASC`;

    const query = this.buildPaginatedQuery(
      selectClause,
      fromClause,
      whereClause,
      orderByClause,
      limit,
      offset
    );

    return { query, parameters };
  }

  /**
   * Build character detail query
   */
  static buildCharacterDetailQuery(charName) {
    const query = `
      SELECT TOP 1
        c.CharID,
        c.CharName16 as CharName,
        c.CurLevel,
        1 as Race,
        CASE
          WHEN c.Strength > c.Intellect THEN 1 -- Warrior
          WHEN c.Intellect > c.Strength THEN 2 -- Magician
          ELSE 1 -- Default to Warrior
        END as JobType,
        CASE
          WHEN c.Strength > c.Intellect THEN 1 -- Warrior
          WHEN c.Intellect > c.Strength THEN 2 -- Magician
          ELSE 1 -- Default to Warrior
        END as CurrentJob,
        c.RemainGold,
        c.RefObjID,
        g.Name as GuildName,
        c.GuildID,
        ISNULL((
          SELECT SUM(CASE
            WHEN i.ItemID BETWEEN 1 AND 6 THEN 1  -- Armor pieces
            WHEN i.ItemID IN (7, 8) THEN 2         -- Weapons
            WHEN i.ItemID = 9 THEN 3               -- Shield
            ELSE 0
          END)
          FROM _Inventory i
          WHERE i.CharID = c.CharID AND i.Slot BETWEEN 0 AND 12
        ), 0) as ItemPoints
      FROM _Char c
      LEFT JOIN _Guild g ON c.GuildID = g.ID
      WHERE c.CharName16 = @charName
    `;

    const parameters = { charName };

    return { query, parameters };
  }

  /**
   * Build guild ranking query
   */
  static buildGuildRankingQuery(options = {}) {
    const { limit = 100, offset = 0, guildName } = options;

    let selectClause = `
      g.ID as GuildID,
      g.Name as GuildName,
      g.Lvl as GuildLevel,
      g.Point as GuildPoints,
      COUNT(c.CharID) as MemberCount,
      g.Foundation as FoundationDate
    `;

    let fromClause = `_Guild g LEFT JOIN _Char c ON g.ID = c.GuildID`;
    let whereClause = `g.Name IS NOT NULL AND g.Name != ''`;

    const parameters = {};

    if (guildName) {
      whereClause += ` AND g.Name LIKE @guildName`;
      parameters.guildName = `%${guildName}%`;
    }

    const groupByClause = `GROUP BY g.ID, g.Name, g.Lvl, g.Point, g.Foundation`;
    const orderByClause = `ORDER BY g.Lvl DESC, g.Point DESC, COUNT(c.CharID) DESC`;

    // Custom query building for guild rankings with GROUP BY
    const query = `
      WITH GuildRankings AS (
        SELECT ${selectClause},
               ROW_NUMBER() OVER (${orderByClause}) as rn
        FROM ${fromClause}
        WHERE ${whereClause}
        ${groupByClause}
      )
      SELECT * FROM GuildRankings
      WHERE rn > ${offset} AND rn <= ${offset + limit}
      ORDER BY rn
    `;

    return { query, parameters };
  }

  /**
   * Build character search query
   */
  static buildCharacterSearchQuery(searchTerm, limit = 20) {
    const query = `
      SELECT TOP ${limit}
        c.CharID,
        c.CharName16 as CharName,
        c.CurLevel,
        g.Name as GuildName
      FROM _Char c
      LEFT JOIN _Guild g ON c.GuildID = g.ID
      WHERE c.CharName16 LIKE @searchTerm
        AND c.CharName16 IS NOT NULL
        AND c.CharName16 != ''
      ORDER BY c.CurLevel DESC, c.CharName16 ASC
    `;

    const parameters = { searchTerm: `%${searchTerm}%` };

    return { query, parameters };
  }

  /**
   * Build guild search query
   */
  static buildGuildSearchQuery(searchTerm, limit = 20) {
    const query = `
      SELECT TOP ${limit}
        g.ID as GuildID,
        g.Name as GuildName,
        g.Lvl as GuildLevel,
        COUNT(c.CharID) as MemberCount
      FROM _Guild g
      LEFT JOIN _Char c ON g.ID = c.GuildID
      WHERE g.Name LIKE @searchTerm
        AND g.Name IS NOT NULL
        AND g.Name != ''
      GROUP BY g.ID, g.Name, g.Lvl
      ORDER BY g.Lvl DESC, COUNT(c.CharID) DESC
    `;

    const parameters = { searchTerm: `%${searchTerm}%` };

    return { query, parameters };
  }
}

module.exports = QueryBuilder;
