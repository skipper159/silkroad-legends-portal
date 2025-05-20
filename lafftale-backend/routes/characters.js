// routes/characters.js
const express = require("express");
const router = express.Router();
const { pool, gamePool, charPool, poolConnect, gamePoolConnect, charPoolConnect, sql } = require("../db");
const authenticateToken = require("../middleware/auth");

// Get all game accounts for a web user (mit authentifizierung)
router.get("/gameaccounts/:webUserId", authenticateToken, async (req, res) => {
  const { webUserId } = req.params;
    // Security check: The requested user is the logged in user or an admin
  if (parseInt(webUserId) !== req.user.id && req.user.role !== 3) {
    return res.status(403).json({ error: "Unauthorized access to other user's data" });
  }
  
  await charPoolConnect;
  try {    // Get AccountIDs from _AccountJID with WebUserId link
    const accountsResult = await charPool.request()
      .input("webUserId", sql.Int, webUserId)
      .query("SELECT JID, AccountID FROM _AccountJID WHERE WebUserId = @webUserId");

    // Retrieve user details from TB_User
    await gamePoolConnect;
    const jids = accountsResult.recordset.map(row => row.JID);
    
    if (jids.length === 0) {
      return res.json([]);
    }
    
    const jidParams = jids.map((_, i) => `@jid${i}`).join(", ");
    const gameReq = gamePool.request();
    jids.forEach((jid, i) => gameReq.input(`jid${i}`, sql.Int, jid));
    
    const userResult = await gameReq.query(`
      SELECT JID, StrUserID, regtime, reg_ip, AccPlayTime
      FROM TB_User
      WHERE JID IN (${jidParams})
    `);
    
    const gameAccounts = userResult.recordset.map(acc => {
      const accountJID = accountsResult.recordset.find(a => a.JID === acc.JID);
      return {
        id: acc.JID,
        username: acc.StrUserID,
        regTime: acc.regtime,
        regIp: acc.reg_ip,
        accountId: accountJID ? accountJID.AccountID : null
      };
    });
    
    res.json(gameAccounts);
  } catch (err) {
    console.error("Error fetching game accounts:", err);
    res.status(500).json({ error: "Error fetching game accounts" });
  }
});

// Get characters for a game account
router.get("/characters/:gameAccountId", authenticateToken, async (req, res) => {
  const gameAccountId = parseInt(req.params.gameAccountId, 10);
  if (isNaN(gameAccountId)) {
    return res.status(400).json({ error: "Invalid game account ID" });
  }
  
  try {    // Check if the GameAccount belongs to the current user
    await charPoolConnect;
    const ownerCheck = await charPool.request()
      .input("jid", sql.Int, gameAccountId)
      .input("webUserId", sql.Int, req.user.id)
      .query("SELECT COUNT(*) AS count FROM _AccountJID WHERE JID = @jid AND WebUserId = @webUserId");
        // Allow if it's an admin or the account belongs to the user
    if (ownerCheck.recordset[0].count === 0 && req.user.role !== 3) {
      return res.status(403).json({ error: "Unauthorized access to this game account" });
    }
    
    // Jetzt verwenden wir die korrekte Beziehung zwischen Tabellen:
    // 1. SRO_VT_ACCOUNT.TB_User (JID) -> 2. SRO_VT_SHARD._User (UserJID, CharID) -> 3. SRO_VT_SHARD._Char (CharID)
    
    // Erst Charaktere über die _User-Tabelle in der Character-Datenbank finden
    const charIdsResult = await charPool.request()
      .input("userJID", sql.Int, gameAccountId)
      .query(`
        SELECT CharID 
        FROM _User 
        WHERE UserJID = @userJID
      `);
    
    if (charIdsResult.recordset.length === 0) {
      return res.json([]);  // No characters found
    }
      // Prepare CharIDs for the IN clause
    const charIds = charIdsResult.recordset.map(row => row.CharID);
    const charIdParams = charIds.map((_, i) => `@charId${i}`).join(", ");
    
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

  -- ✅ Race via CodeName128 aus RefObjCommon
  ISNULL(
    CASE 
      WHEN roc.CodeName128 LIKE 'CH_%' THEN 'Chinese'
      WHEN roc.CodeName128 LIKE 'EU_%' THEN 'European'
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
    res.status(500).json({ error: "Error fetching characters" });
  }
});

// Neue Route: Inventar eines Charakters abrufen
router.get("/inventory/:charId", authenticateToken, async (req, res) => {
  const charId = parseInt(req.params.charId, 10);
  if (isNaN(charId)) {
    return res.status(400).json({ error: "Invalid character ID" });
  }

  try {    // Check if the character belongs to the current user
    await charPoolConnect;
    const ownerCheck = await charPool.request()
      .input("charId", sql.Int, charId)
      .input("webUserId", sql.Int, req.user.id)
      .query(`
        SELECT COUNT(*) AS count
        FROM _Char
        WHERE CharID = @charId AND Deleted = 0
      `);

    if (ownerCheck.recordset[0].count === 0 && req.user.role !== 3) {
      return res.status(403).json({ error: "Unauthorized access to this character's inventory" });
    }

    // Retrieve character's inventory items
    const inventoryResult = await charPool.request()
      .input("charId", sql.Int, charId)
      .query(`
        SELECT
          ItemID AS id,
          ItemName AS name,
          IconPath AS icon,
          Quantity AS quantity
        FROM _Inventory
        WHERE CharID = @charId
      `);

    res.json(inventoryResult.recordset);
  } catch (err) {
    console.error("Error fetching inventory:", err);
    res.status(500).json({ error: "Error fetching inventory" });
  }
});

module.exports = router;
