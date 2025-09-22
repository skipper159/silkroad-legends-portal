// routes/characters.js
const express = require('express');
const router = express.Router();
const {
  gamePool,
  charPool,
  gamePoolConnect,
  charPoolConnect,
  sql,
  getWebDb,
  getAccountDb,
} = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { calculateAllStats } = require('../utils/whiteStatsCalculator');
const { getItemLevelRequirements, getItemDegree } = require('../utils/levelCalculator');

// Get game account for authenticated user (simplified - one user = one game account)
router.get('/gameaccounts/my', authenticateToken, async (req, res) => {
  try {
    await gamePoolConnect;

    // Get the user's data including their linked jid
    const webDb = await getWebDb();
    const userResult = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('SELECT email, jid FROM users WHERE id = @userId');

    const user = userResult.recordset[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If no game account is linked, return empty array
    if (!user.jid || user.jid === 0) return res.status(200).json([]);

    // Get Game Account Details from SILKROAD_R_ACCOUNT database
    const accountDb = await getAccountDb();
    const result = await accountDb.request().input('jid', sql.Int, user.jid).query(`
        SELECT JID, StrUserID, VisitDate, UserIP, AccPlayTime, CountryCode, ServiceCompany, Active
        FROM TB_User
        WHERE JID = @jid
      `);

    if (result.recordset.length === 0) return res.status(200).json([]);

    const gameAccount = {
      id: result.recordset[0].JID,
      username: result.recordset[0].StrUserID,
      visitDate: result.recordset[0].VisitDate,
      userIP: result.recordset[0].UserIP,
      playTime: result.recordset[0].AccPlayTime,
      countryCode: result.recordset[0].CountryCode,
      serviceCompany: result.recordset[0].ServiceCompany,
      active: result.recordset[0].Active,
      accountId: result.recordset[0].StrUserID, // Use username as accountId
    };

    res.json([gameAccount]);
  } catch (err) {
    console.error('Error fetching game accounts:', err);
    res.status(500).json({ error: 'Error fetching game accounts' });
  }
});

// Get characters for a game account
router.get('/characters/:gameAccountId', authenticateToken, async (req, res) => {
  const gameAccountId = parseInt(req.params.gameAccountId, 10);
  if (isNaN(gameAccountId)) {
    return res.status(400).json({ error: 'Invalid game account ID' });
  }

  try {
    // Check if the GameAccount belongs to the current user
    const webDb = await getWebDb();
    const ownerCheck = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .input('jid', sql.Int, gameAccountId)
      .query('SELECT COUNT(*) AS count FROM users WHERE id = @userId AND jid = @jid');

    // Allow if it's an admin or the account belongs to the user
    if (ownerCheck.recordset[0].count === 0 && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized access to this game account' });
    }

    // Korrekte Beziehung zwischen Tabellen:
    // 1. SILKROAD_R_ACCOUNT.TB_User (JID) -> 2. SILKROAD_R_SHARD._User (UserJID, CharID) -> 3. SILKROAD_R_SHARD._Char (CharID)

    // Erst Charaktere über die _User-Tabelle in der Character-Datenbank finden
    const charIdsResult = await charPool.request().input('userJID', sql.Int, gameAccountId).query(`
        SELECT CharID 
        FROM _User 
        WHERE UserJID = @userJID
      `);

    if (charIdsResult.recordset.length === 0) {
      return res.json([]); // No characters found
    }
    // Prepare CharIDs for the IN clause
    const charIds = charIdsResult.recordset.map((row) => row.CharID);
    const charIdParams = charIds.map((_, i) => `@charId${i}`).join(', ');

    // Prepare request with all CharIDs
    const charReq = charPool.request();
    charIds.forEach((charId, i) => charReq.input(`charId${i}`, sql.Int, charId));

    // Alle gefundenen Charaktere abrufen
    const result = await charReq.query(`
SELECT 
  CharID AS id, 
  CharName16 AS name, 
  NickName16 AS nickname,
  CurLevel AS level, 
  MaxLevel AS maxLevel,
  Strength,
  Intellect,
  RemainGold AS gold,
  RemainSkillPoint AS skillPoints,
  RemainStatPoint AS statPoints,
  HP,
  MP,
  LatestRegion AS region,
  PosX,
  PosY,
  PosZ,
  JobLvl_Trader AS traderLevel,
  JobLvl_Hunter AS hunterLevel,
  JobLvl_Robber AS thiefLevel,
  GuildID,
  RefObjID AS CharIcon,

  -- Race-Ermittlung über CodeName128 aus RefObjCommon (verbesserte Logik)
  ISNULL(
    CASE 
      WHEN roc.CodeName128 LIKE 'CH_%' OR roc.CodeName128 LIKE '%Chinese%' THEN 'Chinese'
      WHEN roc.CodeName128 LIKE 'EU_%' OR roc.CodeName128 LIKE '%European%' THEN 'European'
      ELSE 'Unknown'
    END,
    'Unknown'
  ) AS race

FROM _Char
LEFT JOIN _RefObjChar rchar ON _Char.RefObjID = rchar.ID
LEFT JOIN _RefObjCommon roc ON rchar.ID = roc.ID
WHERE CharID IN (${charIdParams}) AND Deleted = 0
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching characters' });
  }
});

// Neue Route: Inventar eines Charakters abrufen
router.get('/inventory/:charId', authenticateToken, async (req, res) => {
  const charId = parseInt(req.params.charId, 10);
  if (isNaN(charId)) {
    return res.status(400).json({ error: 'Invalid character ID' });
  }

  // Get query parameters for slot filtering
  const minSlot = req.query.min ? parseInt(req.query.min, 10) : 0;
  const maxSlot = req.query.max ? parseInt(req.query.max, 10) : 999;

  try {
    // Check if the character belongs to the current user by verifying the ownership chain
    await charPoolConnect;

    // First, get the UserJID for this character
    const charOwnerCheck = await charPool.request().input('charId', sql.Int, charId).query(`
        SELECT u.UserJID
        FROM _Char c
        INNER JOIN _User u ON c.CharID = u.CharID
        WHERE c.CharID = @charId AND c.Deleted = 0
      `);

    if (charOwnerCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const userJID = charOwnerCheck.recordset[0].UserJID;

    // Now check if this UserJID belongs to the current web user
    const webDb = await getWebDb();
    const webOwnerCheck = await webDb
      .request()
      .input('webUserId', sql.BigInt, req.user.id)
      .input('userJID', sql.Int, userJID)
      .query('SELECT COUNT(*) AS count FROM users WHERE id = @webUserId AND jid = @userJID');

    if (webOwnerCheck.recordset[0].count === 0 && !req.user.isAdmin) {
      return res.status(403).json({ error: "Unauthorized access to this character's inventory" });
    }

    // Retrieve character's inventory items with proper joins like SRO CMS
    const inventoryResult = await charPool
      .request()
      .input('charId', sql.Int, charId)
      .input('minSlot', sql.Int, minSlot)
      .input('maxSlot', sql.Int, maxSlot).query(`
        SELECT
          inv.ItemID as id,
          inv.ItemID as itemId,
          inv.Slot as slot,
          items.RefItemID,
          REPLACE(REPLACE(ISNULL(ref.AssocFileIcon128, 'item/etc/etc_gold.ddj'), '\\', '/'), '.ddj', '.png') as iconPath,
          ref.CodeName128,
          ref.NameStrID128,
          ISNULL(itemnames.ENG, ref.CodeName128) as friendlyName,
          -- Level Requirements
          ref.ReqLevel1,
          ref.ReqLevel2,
          ref.ReqLevel3,
          ref.ReqLevel4,
          ref.ReqLevelType1,
          ref.ReqLevelType2,
          ref.ReqLevelType3,
          ref.ReqLevelType4,
          -- TypeIDs for item classification
          ref.TypeID1,
          ref.TypeID2,
          ref.TypeID3,
          ref.TypeID4,
          items.OptLevel,
          items.Data,
          items.Variance,
          -- Blue Stats (Magic Options)
          items.MagParamNum,
          items.MagParam1,
          items.MagParam2,
          items.MagParam3,
          items.MagParam4,
          items.MagParam5,
          items.MagParam6,
          items.MagParam7,
          items.MagParam8,
          items.MagParam9,
          items.MagParam10,
          items.MagParam11,
          items.MagParam12,
          -- White Stats von _RefObjItem für Weapons/Protectors/Accessories
          roi.PAttackMin_L,
          roi.PAttackMin_U,
          roi.PAttackMax_L,
          roi.PAttackMax_U,
          roi.PAttackInc,
          roi.MAttackMin_L,
          roi.MAttackMin_U,
          roi.MAttackMax_L,
          roi.MAttackMax_U,
          roi.MAttackInc,
          roi.PD_L as PhysicalDefense_L,
          roi.PD_U as PhysicalDefense_U,
          roi.PDInc as PhysicalDefense_Inc,
          roi.MD_L as MagicalDefense_L,
          roi.MD_U as MagicalDefense_U,
          roi.MDInc as MagicalDefense_Inc,
          roi.PAR_L as PhysicalAbsorption_L,
          roi.PAR_U as PhysicalAbsorption_U,
          roi.MAR_L as MagicalAbsorption_L,
          roi.MAR_U as MagicalAbsorption_U,
          -- Reinforce for Accessories  
          roi.PDStr_L as PhysicalReinforce_L,
          roi.PDStr_U as PhysicalReinforce_U,
          roi.MDInt_L as MagicalReinforce_L,
          roi.MDInt_U as MagicalReinforce_U,
          roi.HR_L as HitRate_L,
          roi.HR_U as HitRate_U,
          roi.HRInc as HitRate_Inc,
          roi.CHR_L as CriticalHitRate_L,
          roi.CHR_U as CriticalHitRate_U,
          roi.ER_L as EvasionRate_L,
          roi.ER_U as EvasionRate_U,
          roi.ERInc as EvasionRate_Inc,
          roi.BR_L as BlockRate_L,
          roi.BR_U as BlockRate_U,
          roi.Range as AttackRange,
          roi.Dur_L as Durability_L,
          roi.Dur_U as Durability_U,
          -- Check for sealed status based on CodeName128
          CASE 
            WHEN ref.CodeName128 LIKE '%A_RARE%' THEN 'Seal of Star'
            WHEN ref.CodeName128 LIKE '%B_RARE%' THEN 'Seal of Moon'
            WHEN ref.CodeName128 LIKE '%C_RARE%' THEN 'Seal of Sun'
            WHEN ref.CodeName128 LIKE '%SET_A_RARE%' OR ref.CodeName128 LIKE '%SET_B_RARE%' THEN 'Seal of Nova'
            ELSE 'Normal'
          END as soxType,
          -- Determine item amount (simplified for now)
          0 as amount
        FROM _Inventory inv
        INNER JOIN _Items items ON inv.ItemID = items.ID64
        LEFT JOIN _RefObjCommon ref ON items.RefItemID = ref.ID
        LEFT JOIN _RefObjItem roi ON ref.Link = roi.ID
        LEFT JOIN SILKROAD_R_ACCOUNT.._Rigid_ItemNameDesc itemnames ON ref.NameStrID128 = itemnames.StrID
        WHERE inv.CharID = @charId 
          AND inv.Slot >= @minSlot 
          AND inv.Slot <= @maxSlot
          AND inv.ItemID != 0
        ORDER BY inv.Slot
      `);

    // Calculate White Stats, Blue Stats and Level Requirements for each item
    const processedItems = inventoryResult.recordset.map((item) => {
      const stats = calculateAllStats(item);
      const levelRequirements = getItemLevelRequirements(item);
      const degree = getItemDegree(item);

      return {
        ...item,
        whiteStats: stats.whiteStats,
        blueStats: stats.blueStats,
        levelRequirements: levelRequirements,
        degree: degree,
      };
    });

    res.json(processedItems);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Error fetching inventory' });
  }
});

// Get Item Points for a specific character
router.get('/:charId/itempoints', async (req, res) => {
  const { charId } = req.params;

  if (!charId || isNaN(charId)) {
    return res.status(400).json({ error: 'Invalid character ID' });
  }

  try {
    await charPoolConnect;

    const result = await charPool.request().input('CharID', sql.Int, charId).query(`
        SELECT c.CharID, c.CharName16,
          ISNULL((
            SUM(ISNULL(bio.nOptValue, 0)) +
            SUM(ISNULL(i.OptLevel, 0)) +
            SUM(ISNULL(roc.ReqLevel1, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_A_RARE%' THEN 5 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_B_RARE%' THEN 10 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc.CodeName128 LIKE '%_C_RARE%' THEN 15 ELSE 0 END, 0))
          ), 0) AS ItemPoints
        FROM _Char c
          LEFT JOIN _Inventory inv ON c.CharID = inv.CharID AND inv.Slot BETWEEN 0 AND 12
          LEFT JOIN _Items i ON inv.ItemID = i.ID64
          LEFT JOIN _RefObjCommon roc ON i.RefItemID = roc.ID
          LEFT JOIN _BindingOptionWithItem bio ON i.ID64 = bio.nItemDBID
        WHERE c.CharID = @CharID AND c.Deleted = 0
        GROUP BY c.CharID, c.CharName16
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const character = result.recordset[0];
    res.json({
      characterId: character.CharID,
      characterName: character.CharName16,
      itemPoints: character.ItemPoints || 0,
    });
  } catch (err) {
    console.error('Error fetching character item points:', err);
    res.status(500).json({ error: 'Error fetching character item points' });
  }
});

module.exports = router;
