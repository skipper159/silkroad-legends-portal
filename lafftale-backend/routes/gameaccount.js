const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { charPool, gamePool, webPool, charPoolConnect, gamePoolConnect, webPoolConnect, sql } = require("../db");
const authenticateToken = require("../middleware/auth");

// Create Game Account
router.post("/create", authenticateToken, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  const userIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";

  try {
    await gamePoolConnect;
    await charPoolConnect;

    // Check if username already exists
    const check = await gamePool.request()
      .input("username", sql.NVarChar(25), username)
      .query("SELECT COUNT(*) AS count FROM TB_User WHERE StrUserID = @username");

    if (check.recordset[0].count > 0) {
      return res.status(409).json({ error: "Game account already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert into TB_User
    const insertResult = await gamePool.request()
      .input("username", sql.NVarChar(25), username)
      .input("password", sql.NVarChar(60), hashed)
      .input("regtime", sql.DateTime, new Date())
      .input("reg_ip", sql.NVarChar(25), userIp.toString())
      .query(`
        INSERT INTO TB_User (StrUserID, password, regtime, reg_ip)
        VALUES (@username, @password, @regtime, @reg_ip);
        SELECT SCOPE_IDENTITY() AS JID;
      `);

    const newJid = insertResult.recordset[0].JID;

    // Insert into _AccountJID (VT_SHARD)
    await charPool.request()
      .input("accountId", sql.NVarChar(25), username)
      .input("jid", sql.Int, newJid)
      .input("webUserId", sql.Int, req.user.id)
      .query(`
        INSERT INTO _AccountJID (AccountID, JID, WebUserId)
        VALUES (@accountId, @jid, @webUserId)
      `);
      
    // Insert into dbo._User mit CharID = 0 als Platzhalter (wird später aktualisiert, wenn ein Character erstellt wird)
    await charPool.request()
      .input("jid", sql.Int, newJid)
      .query(`
        INSERT INTO dbo._User (UserJID, CharID)
        VALUES (@jid, 0)
      `);

    // Erstelle einen Eintrag in SK_SILK für das Silk-Guthaben
    await gamePool.request()
      .input("jid", sql.Int, newJid)
      .query(`
        INSERT INTO SK_SILK (JID, silk_own, silk_gift, silk_point)
        VALUES (@jid, 0, 0, 0)
      `);

    res.status(201).json({ message: "Game account created", jid: newJid });
  } catch (err) {
    console.error("Error creating game account:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Game Accounts of Authenticated User
router.get("/my", authenticateToken, async (req, res) => {
  try {
    await charPoolConnect;
    await gamePoolConnect;
    await webPoolConnect;

    // Hole die E-Mail-Adresse des Benutzers
    const userResult = await webPool.request()
      .input("userId", sql.Int, req.user.id)
      .query("SELECT Email FROM WebUsers WHERE Id = @userId");
    
    const userEmail = userResult.recordset[0]?.Email;

    // Hole JIDs (Game Account IDs) für den angemeldeten Benutzer
    const jidsResult = await charPool.request()
      .input("userId", sql.Int, req.user.id)
      .query("SELECT JID FROM _AccountJID WHERE WebUserId = @userId");

    const jids = jidsResult.recordset.map(row => row.JID);
    if (jids.length === 0) return res.status(200).json([]);

    // Hole Game Account Details
    const jidParams = jids.map((_, i) => `@jid${i}`).join(", ");
    const gameReq = gamePool.request();
    jids.forEach((jid, i) => gameReq.input(`jid${i}`, sql.Int, jid));

    const result = await gameReq.query(`
      SELECT JID, StrUserID, regtime, reg_ip, AccPlayTime
      FROM TB_User
      WHERE JID IN (${jidParams})
    `);

    // Hole Silk-Informationen für alle Game Accounts
    const silkReq = gamePool.request();
    jids.forEach((jid, i) => silkReq.input(`jid${i}`, sql.Int, jid));

    const silkResult = await silkReq.query(`
      SELECT JID, silk_own, silk_gift, silk_point 
      FROM SK_SILK 
      WHERE JID IN (${jidParams})
    `);

    // Kombiniere die Daten
    const gameAccounts = result.recordset.map(account => {
      const silkData = silkResult.recordset.find(s => s.JID === account.JID) || { silk_own: 0, silk_gift: 0, silk_point: 0 };
      
      return {
        ...account,
        email: userEmail,
        silk_own: silkData.silk_own || 0,
        silk_gift: silkData.silk_gift || 0,
        silk_point: silkData.silk_point || 0,
        total_silk: (silkData.silk_own || 0) + (silkData.silk_gift || 0) + (silkData.silk_point || 0)
      };
    });

    res.json(gameAccounts);
  } catch (err) {
    console.error("Error fetching game accounts:", err);
    res.status(500).json({ error: "Failed to load game accounts" });
  }
});

// Change Game Account Password
router.put("/:id/password", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: "Missing passwords" });

  try {
    await gamePoolConnect;

    const userRes = await gamePool.request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM TB_User WHERE JID = @id");

    const account = userRes.recordset[0];
    if (!account) return res.status(404).json({ error: "Game account not found" });

    const valid = await bcrypt.compare(oldPassword, account.password);
    if (!valid) return res.status(403).json({ error: "Invalid old password" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await gamePool.request()
      .input("id", sql.Int, id)
      .input("pw", sql.NVarChar(60), hashed)
      .query("UPDATE TB_User SET password = @pw WHERE JID = @id");

    res.send("Password updated");
  } catch (err) {
    console.error("Update GameAccount Password Error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Delete Game Account
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await gamePoolConnect;
    await charPoolConnect;

    // Lösche aus _AccountJID
    await charPool.request()
      .input("jid", sql.Int, id)
      .query("DELETE FROM _AccountJID WHERE JID = @jid");

    // Lösche aus SK_SILK
    await gamePool.request()
      .input("jid", sql.Int, id)
      .query("DELETE FROM SK_SILK WHERE JID = @jid");

    // Lösche aus TB_User
    await gamePool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM TB_User WHERE JID = @id");

    res.json({ message: "Game account deleted" });
  } catch (err) {
    console.error("Delete GameAccount Error:", err);
    res.status(500).json({ error: "Failed to delete game account" });
  }
});

module.exports = router;
