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
   * Unique Player Rankings - basierend auf _CharUniqueKill Tabelle
   * Spezielle Implementierung wegen GROUP BY
   */
  static buildUniqueRankingQuery(type = 'unique', limit = 50, offset = 0) {
    const CalendarUtils = require('./calendarUtils');
    let whereFilter = '';

    switch (type) {
      case 'unique-monthly':
        // Korrekte Monatsberechnung: 1. bis letzter Tag des aktuellen Monats
        const monthInfo = CalendarUtils.getCurrentMonthInfo();
        whereFilter = `AND uk.EventDate >= '${monthInfo.startSQL}' AND uk.EventDate <= '${monthInfo.endSQL}'`;
        break;
      default:
        whereFilter = '';
    }

    const query = `
      WITH RankedResults AS (
        SELECT 
          c.CharName16 as playerName,
          c.CurLevel as level,
          ISNULL(g.Name, '') as guildName,
          COUNT(uk.MobID) as UniqueKills,
          COUNT(uk.MobID) * 10 as TotalPoints,
          MAX(uk.EventDate) as LastKill,
          CASE 
            WHEN roc.CodeName128 LIKE 'CH_%' OR roc.CodeName128 LIKE '%Chinese%' THEN 'Chinese'
            WHEN roc.CodeName128 LIKE 'EU_%' OR roc.CodeName128 LIKE '%European%' THEN 'European'
            ELSE 'Chinese'
          END as Race,
          ROW_NUMBER() OVER (ORDER BY COUNT(uk.MobID) DESC, COUNT(uk.MobID) * 10 DESC) as rn
        FROM _CharUniqueKill uk
        INNER JOIN _Char c ON uk.CharID = c.CharID
        LEFT JOIN _Guild g ON c.GuildID = g.ID
        LEFT JOIN _RefObjChar rchar ON c.RefObjID = rchar.ID
        LEFT JOIN _RefObjCommon roc ON rchar.ID = roc.ID
        WHERE c.CharName16 IS NOT NULL 
          AND c.CharName16 != '' 
          AND c.Deleted = 0
          ${whereFilter}
        GROUP BY c.CharName16, c.CurLevel, g.Name, roc.CodeName128
      )
      SELECT * FROM RankedResults
      WHERE rn > ${offset} AND rn <= ${offset + limit}
      ORDER BY rn
    `;

    return query.trim();
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
      CASE 
        WHEN roc.CodeName128 LIKE 'CHAR_CH_%' THEN 1 
        WHEN roc.CodeName128 LIKE 'CHAR_EU_%' THEN 2 
        ELSE 1 
      END as Race,
      CASE
        WHEN c.Strength > c.Intellect THEN 1 -- Warrior
        WHEN c.Intellect > c.Strength THEN 2 -- Magician
        ELSE 1 -- Default to Warrior
      END as JobType,
      c.RemainGold,
      g.Name as GuildName,
      roc.CodeName128 as CharacterModel
    `;

    if (includeItemPoints) {
      selectClause += `,
        ISNULL((
          SELECT 
            SUM(ISNULL(bow.nOptValue, 0)) +
            SUM(ISNULL(i.OptLevel, 0)) +
            SUM(ISNULL(roc.ReqLevel1, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_A_RARE%' THEN 5 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_B_RARE%' THEN 10 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_C_RARE%' THEN 15 ELSE 0 END, 0))
          FROM _Inventory inv
          JOIN _Items i ON i.ID64 = inv.ItemID
          JOIN _RefObjCommon roc ON roc.ID = i.RefItemID
          LEFT JOIN _BindingOptionWithItem bow ON bow.nItemDBID = i.ID64 
            AND bow.nOptValue > 0 AND bow.bOptType = 2
          WHERE inv.CharID = c.CharID 
            AND inv.Slot < 13 
            AND inv.Slot NOT IN (7, 8)
            AND inv.ItemID > 0
        ), 0) as ItemPoints
      `;
    }

    let fromClause = `_Char c 
      LEFT JOIN _Guild g ON c.GuildID = g.ID
      LEFT JOIN _RefObjCommon roc ON c.RefObjID = roc.ID`;
    let whereClause = `c.CharName16 IS NOT NULL AND c.CharName16 != '' AND c.CurLevel >= ${minLevel} AND c.CharID > 0`;

    // Filter out [GM] characters in SQL query to maintain proper pagination
    if (!charName) {
      whereClause += ` AND (c.CharName16 NOT LIKE '[GM]%' OR c.CharName16 IS NULL)`;
    }

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

    const orderByClause = includeItemPoints
      ? `ORDER BY ItemPoints DESC, c.CurLevel DESC, c.CharName16 ASC`
      : `ORDER BY c.CurLevel DESC, c.CharName16 ASC`;

    // Für Item Points Rankings müssen wir eine komplexere Query bauen
    if (includeItemPoints) {
      const itemPointsCalculation = `
        ISNULL((
          SELECT 
            SUM(ISNULL(bow.nOptValue, 0)) +
            SUM(ISNULL(i.OptLevel, 0)) +
            SUM(ISNULL(roc.ReqLevel1, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_A_RARE%' THEN 5 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_B_RARE%' THEN 10 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_C_RARE%' THEN 15 ELSE 0 END, 0))
          FROM _Inventory inv
          JOIN _Items i ON i.ID64 = inv.ItemID
          JOIN _RefObjCommon roc ON roc.ID = i.RefItemID
          LEFT JOIN _BindingOptionWithItem bow ON bow.nItemDBID = i.ID64 
            AND bow.nOptValue > 0 AND bow.bOptType = 2
          WHERE inv.CharID = c.CharID 
            AND inv.Slot < 13 
            AND inv.Slot NOT IN (7, 8)
            AND inv.ItemID > 0
        ), 0)
      `;

      const query = `
        WITH RankedResults AS (
          SELECT ${selectClause},
                 ROW_NUMBER() OVER (ORDER BY ${itemPointsCalculation} DESC, c.CurLevel DESC, c.CharName16 ASC) as rn
          FROM ${fromClause}
          ${whereClause ? `WHERE ${whereClause}` : ''}
        )
        SELECT * FROM RankedResults
        WHERE rn > ${offset} AND rn <= ${offset + limit}
        ORDER BY rn
      `;
      return { query, parameters };
    }

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
      g.GatheredSP as GuildPoints,
      COUNT(c.CharID) as MemberCount,
      g.FoundationDate as FoundationDate,
      CASE 
        WHEN g.Alliance = 0 OR g.Alliance IS NULL THEN NULL
        ELSE ag.Name
      END as Alliance,
      g.MasterCommentTitle as Notice
    `;

    let fromClause = `_Guild g 
      LEFT JOIN _Char c ON g.ID = c.GuildID AND c.Deleted = 0
      LEFT JOIN _Guild ag ON g.Alliance = ag.ID AND g.Alliance > 0`;
    let whereClause = `g.Name IS NOT NULL AND g.Name != '' AND g.Name != 'DummyGuild'`;

    const parameters = {};

    if (guildName) {
      whereClause += ` AND g.Name LIKE @guildName`;
      parameters.guildName = `%${guildName}%`;
    }

    const groupByClause = `GROUP BY g.ID, g.Name, g.Lvl, g.GatheredSP, g.FoundationDate, g.Alliance, ag.Name, g.MasterCommentTitle`;
    const orderByClause = `ORDER BY g.Lvl DESC, g.GatheredSP DESC, COUNT(c.CharID) DESC`;

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
   * Build optimized player ranking query with GlobalRank calculation for search results
   */
  static buildPlayerRankingWithGlobalRankQuery(options = {}) {
    const {
      limit = 100,
      offset = 0,
      charId,
      charName,
      race,
      minLevel = 1,
      includeItemPoints = true,
    } = options;

    const itemPointsCalculation = `
      ISNULL((
        SELECT 
          SUM(ISNULL(bow.nOptValue, 0)) +
          SUM(ISNULL(i.OptLevel, 0)) +
          SUM(ISNULL(roc2.ReqLevel1, 0)) +
          SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_A_RARE%' THEN 5 ELSE 0 END, 0)) +
          SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_B_RARE%' THEN 10 ELSE 0 END, 0)) +
          SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_C_RARE%' THEN 15 ELSE 0 END, 0))
        FROM _Inventory inv
        JOIN _Items i ON i.ID64 = inv.ItemID
        JOIN _RefObjCommon roc2 ON roc2.ID = i.RefItemID
        LEFT JOIN _BindingOptionWithItem bow ON bow.nItemDBID = i.ID64 
          AND bow.nOptValue > 0 AND bow.bOptType = 2
        WHERE inv.CharID = c.CharID 
          AND inv.Slot < 13 
          AND inv.Slot NOT IN (7, 8)
          AND inv.ItemID > 0
      ), 0)
    `;

    // Build WHERE conditions for search filtering
    let searchConditions = `CharName IS NOT NULL AND CharName != '' AND CurLevel >= ${minLevel} AND CharID > 0 AND NOT (CharName LIKE '[GM]%')`;

    const parameters = {};

    if (charId) {
      searchConditions += ` AND CharID = @charId`;
      parameters.charId = charId;
    }

    if (charName) {
      searchConditions += ` AND CharName LIKE @charName`;
      parameters.charName = `%${charName}%`;
    }

    if (race !== undefined) {
      searchConditions += ` AND Race = @race`;
      parameters.race = race;
    }

    // Optimized query with GlobalRank calculation using Window Function
    const query = `
      WITH AllRankedCharacters AS (
        SELECT 
          c.CharID,
          c.CharName16 as CharName,
          c.CurLevel,
          CASE 
            WHEN roc.CodeName128 LIKE 'CHAR_CH_%' THEN 1 
            WHEN roc.CodeName128 LIKE 'CHAR_EU_%' THEN 2 
            ELSE 1 
          END as Race,
          CASE
            WHEN c.Strength > c.Intellect THEN 1 -- Warrior
            WHEN c.Intellect > c.Strength THEN 2 -- Magician
            ELSE 1 -- Default to Warrior
          END as JobType,
          c.RemainGold,
          g.Name as GuildName,
          roc.CodeName128 as CharacterModel,
          ${includeItemPoints ? `${itemPointsCalculation} as ItemPoints,` : ''}
          ROW_NUMBER() OVER (
            ORDER BY ${
              includeItemPoints
                ? `${itemPointsCalculation} DESC, c.CurLevel DESC`
                : `c.CurLevel DESC`
            }, c.CharName16 ASC
          ) as GlobalRank
        FROM _Char c 
        LEFT JOIN _Guild g ON c.GuildID = g.ID
        LEFT JOIN _RefObjCommon roc ON c.RefObjID = roc.ID
        WHERE c.CharName16 IS NOT NULL 
          AND c.CharName16 != '' 
          AND c.CurLevel >= 1 
          AND c.CharID > 0
          AND NOT (c.CharName16 LIKE '[GM]%')
      ),
      SearchResults AS (
        SELECT *
        FROM AllRankedCharacters
        WHERE ${searchConditions}
      )
      SELECT TOP ${limit} *
      FROM SearchResults
      ORDER BY GlobalRank
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
   * Build global rank query for a specific character in player rankings
   */
  static buildGlobalRankQuery(charId, includeItemPoints = true) {
    const itemPointsCalculation = `
      ISNULL((
        SELECT 
          SUM(ISNULL(bow.nOptValue, 0)) +
          SUM(ISNULL(i.OptLevel, 0)) +
          SUM(ISNULL(roc.ReqLevel1, 0)) +
          SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_A_RARE%' THEN 5 ELSE 0 END, 0)) +
          SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_B_RARE%' THEN 10 ELSE 0 END, 0)) +
          SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_C_RARE%' THEN 15 ELSE 0 END, 0))
        FROM _Inventory inv
        JOIN _Items i ON i.ID64 = inv.ItemID
        JOIN _RefObjCommon roc ON roc.ID = i.RefItemID
        LEFT JOIN _BindingOptionWithItem bow ON bow.nItemDBID = i.ID64 
          AND bow.nOptValue > 0 AND bow.bOptType = 2
        WHERE inv.CharID = char_inner.CharID 
          AND inv.Slot < 13 
          AND inv.Slot NOT IN (7, 8)
          AND inv.ItemID > 0
      ), 0)
    `;

    let orderByClause = '';
    if (includeItemPoints) {
      orderByClause = `ORDER BY ${itemPointsCalculation} DESC, char_inner.CurLevel DESC, char_inner.CharName16 ASC`;
    } else {
      orderByClause = `ORDER BY char_inner.CurLevel DESC, char_inner.CharName16 ASC`;
    }

    const query = `
      WITH RankedChars AS (
        SELECT char_inner.CharID,
               ROW_NUMBER() OVER (${orderByClause}) as GlobalRank
        FROM _Char char_inner
        LEFT JOIN _Guild g_inner ON char_inner.GuildID = g_inner.ID
        WHERE char_inner.CharName16 IS NOT NULL 
          AND char_inner.CharName16 != '' 
          AND char_inner.CurLevel >= 1 
          AND char_inner.CharID > 0
          AND (char_inner.CharName16 NOT LIKE '[GM]%' OR char_inner.CharName16 NOT LIKE '[[]GM%')
      )
      SELECT GlobalRank
      FROM RankedChars
      WHERE CharID = @charId
    `;

    const parameters = { charId };
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

  /**
   * Build public character details query
   */
  static buildPublicCharacterQuery(characterName) {
    const query = `
      SELECT 
        c.CharID,
        c.CharName16 as CharName,
        c.CurLevel as Level,
        c.Strength,
        c.Intellect,
        c.HP,
        c.MP,
        CASE 
          WHEN roc.CodeName128 LIKE 'CHAR_CH_%' THEN 1 
          WHEN roc.CodeName128 LIKE 'CHAR_EU_%' THEN 2 
          ELSE 1 
        END as Race,
        CASE
          WHEN c.Strength > c.Intellect THEN 1 -- Warrior
          WHEN c.Intellect > c.Strength THEN 2 -- Magician
          ELSE 1 -- Default to Warrior
        END as JobType,
        ISNULL(tcj.Class, 0) as JobClass,
        ISNULL(tcj.JobLevel, 1) as JobLevel,
        ISNULL(tcj.PromotionPhase, 0) as PromotionPhase,
        c.RemainGold,
        g.Name as GuildName,
        c.LastLogout as LastLoginTime,
        ISNULL((
          SELECT 
            SUM(ISNULL(bow.nOptValue, 0)) +
            SUM(ISNULL(i.OptLevel, 0)) +
            SUM(ISNULL(roc2.ReqLevel1, 0)) +
            SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_A_RARE%' THEN 5 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_B_RARE%' THEN 10 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_C_RARE%' THEN 15 ELSE 0 END, 0))
          FROM _Inventory inv
          JOIN _Items i ON i.ID64 = inv.ItemID
          JOIN _RefObjCommon roc2 ON roc2.ID = i.RefItemID
          LEFT JOIN _BindingOptionWithItem bow ON bow.nItemDBID = i.ID64 
            AND bow.nOptValue > 0 AND bow.bOptType = 2
          WHERE inv.CharID = c.CharID 
            AND inv.Slot < 13 
            AND inv.Slot NOT IN (7, 8)
            AND inv.ItemID > 0
        ), 0) as ItemPoints
      FROM _Char c 
      LEFT JOIN _Guild g ON c.GuildID = g.ID
      LEFT JOIN _RefObjCommon roc ON c.RefObjID = roc.ID
      LEFT JOIN _CharTradeConflictJob tcj ON tcj.CharID = c.CharID
      WHERE c.CharName16 = @characterName
        AND c.CharName16 IS NOT NULL 
        AND c.CharName16 != ''
    `;

    const parameters = { characterName };

    return { query, parameters };
  }

  /**
   * Builds query to get unique kills for a character
   * Returns the last 15 unique monster kills with monster information
   */
  static buildUniqueKillsQuery(charID) {
    const query = `
      SELECT TOP 15
        ck.MobID,
        ck.EventDate,
        ro.NameStrID128 as MonsterCodeName,
        ro.ObjName128 as MonsterName
      FROM _CharUniqueKill ck
      LEFT JOIN _RefObjCommon ro ON ck.MobID = ro.ID
      WHERE ck.CharID = @charID
      ORDER BY ck.EventDate DESC
    `;

    const parameters = { charID };

    return { query, parameters };
  }

  /**
   * Builds query to get recent unique kills from all players
   * Returns the last 10 unique monster kills globally with character and monster information
   */
  static buildRecentUniqueKillsQuery() {
    const query = `
      SELECT TOP 10
        ck.MobID,
        ck.CharID,
        ck.EventDate,
        c.CharName16 as CharacterName,
        ro.NameStrID128 as MonsterCodeName,
        ro.ObjName128 as MonsterName
      FROM _CharUniqueKill ck
      LEFT JOIN _Char c ON ck.CharID = c.CharID
      LEFT JOIN _RefObjCommon ro ON ck.MobID = ro.ID
      ORDER BY ck.EventDate DESC
    `;

    return { query, parameters: {} };
  }
}

module.exports = QueryBuilder;
