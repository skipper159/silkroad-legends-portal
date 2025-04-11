// routes/admin.js
const express = require("express");
const router = express.Router();
const { 
  sql, 
  webPool, webPoolConnect, 
  gamePool, gamePoolConnect, 
  logPool, logPoolConnect, 
  charPool, charPoolConnect,
} = require("../db");

// Get all web accounts with RoleId = 3 (normal users)
router.get("/webaccounts", async (req, res) => {
  await webPoolConnect;
  try {
    const result = await webPool.request().query(
      `SELECT Id, Username, Email, RegisteredAt, LastLogin FROM WebUsers WHERE RoleId = 3`
    );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching web accounts:", err);
    res.status(500).json({ error: "Failed to fetch web accounts" });
  }
});

// Get all game accounts with extra data
router.get("/gameaccounts", async (req, res) => {
  try {
    await gamePoolConnect;
    const userAccounts = await gamePool.request().query(
      `SELECT u.JID, u.StrUserID AS Username, u.RegTime, u.Reg_IP, u.AccPlayTime,
              bu.UserID AS BlockedUserID
       FROM TB_User u
       LEFT JOIN _BlockedUser bu ON u.JID = bu.UserJID`
    );

    await charPoolConnect;
    const characters = await charPool.request().query(
      `SELECT c.CharID, c.CharName16, c.GuildID, t.JobType, t.Level AS JobName
       FROM _Char c
       LEFT JOIN _CharTrijob t ON c.CharID = t.CharID`
    );

    const combined = userAccounts.recordset.map((acc) => {
      const character = characters.recordset.find(c => c.CharID === acc.AccountID) || {};
      return {
        GameAccountId: acc.JID,
        Username: acc.Username,
        CharName16: character.CharName16 || null,
        CharID: character.CharID || null,
        GuildID: character.GuildID || null,
        JobType: character.JobType || null,
        RegTime: acc.RegTime || null,
        AccPlayTime: acc.AccPlayTime || null,
        Reg_IP: acc.Reg_IP || null,
        JobName: character.JobName || null,
        IsBanned: acc.BlockedUserID ? true : false,
        TimeoutUntil: null // Optional für spätere Erweiterung
      };
    });

    res.json(combined);
  } catch (err) {
    console.error("Error fetching game accounts:", err);
    res.status(500).json({ error: "Failed to fetch game accounts" });
  }
});

// Ban game account
router.put("/gameaccounts/:id/ban", async (req, res) => {
  const { id } = req.params;
  await gamePoolConnect;
  try {
    await gamePool.request()
      .input("id", sql.Int, id)
      .query("INSERT INTO _BlockedUser (UserJID, GID, UserID, Reason, BlockStartTime, BlockEndTime) VALUES (@id, 0, 0, 'Banned by admin', GETDATE(), NULL)");
    res.json({ message: "Game account banned" });
  } catch (err) {
    console.error("Error banning game account:", err);
    res.status(500).json({ error: "Failed to ban account" });
  }
});

// Timeout game account (e.g., 24h)
router.put("/gameaccounts/:id/timeout", async (req, res) => {
  const { id } = req.params;
  const timeoutDate = new Date();
  timeoutDate.setHours(timeoutDate.getHours() + 24);

  await gamePoolConnect;
  try {
    await gamePool.request()
      .input("id", sql.Int, id)
      .input("timeout", sql.DateTime, timeoutDate)
      .query("UPDATE TB_User SET AccPlayTime = 0 WHERE JID = @id"); // Platzhalter für Timeout-Logik

    res.json({ message: "Game account set on timeout for 24h" });
  } catch (err) {
    console.error("Error applying timeout:", err);
    res.status(500).json({ error: "Failed to apply timeout" });
  }
});

// Get game account logs (placeholder logic)
router.get("/gameaccounts/:id/logs", async (req, res) => {
  const { id } = req.params;
  await logPoolConnect;
  try {
    const result = await logPool.request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM GameAccountLogs WHERE GameAccountId = @id");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error loading logs:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;
