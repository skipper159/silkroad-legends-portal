// routes/silk.js
const express = require("express");
const router = express.Router();
const { pool, poolConnect, gamePool, gamePoolConnect, sql } = require("../db");
const authenticateToken = require("../middleware/auth");

// Get Silk balance for GameAccount
router.get("/balance/:gameAccountId", async (req, res) => {
  const { gameAccountId } = req.params;

  await gamePoolConnect;
  try {
    // Die SK_SILK-Tabelle befindet sich in der Game-Datenbank (SRO_VT_ACCOUNT)
    const result = await gamePool.request()
      .input("jid", sql.Int, gameAccountId)
      .query("SELECT silk_own FROM SK_SILK WHERE JID = @jid");

    if (!result.recordset[0]) return res.status(404).json({ error: "Game account not found or no Silk data available" });

    res.json({ silk: result.recordset[0].silk_own });
  } catch (err) {
    console.error("Error fetching Silk balance:", err);
    res.status(500).json({ error: "Failed to fetch Silk balance" });
  }
});

// Validate that the gameAccountId belongs to the authenticated user
const validateGameAccountOwnership = async (userId, gameAccountId) => {
  const result = await pool.request()
    .input("userId", sql.Int, userId)
    .input("gameAccountId", sql.Int, gameAccountId)
    .query("SELECT COUNT(*) AS count FROM _AccountJID WHERE WebUserId = @userId AND JID = @gameAccountId");
  return result.recordset[0].count > 0;
};

// Add Silk (donation or voting)
router.post("/add", authenticateToken, async (req, res) => {
  const { gameAccountId, amount } = req.body;
  const userId = req.user.id;

  if (!gameAccountId || !amount) return res.status(400).json({ error: "Missing fields" });

  await poolConnect;
  await gamePoolConnect;
  try {
    const isValid = await validateGameAccountOwnership(userId, gameAccountId);
    if (!isValid) return res.status(403).json({ error: "Unauthorized game account" });

    // Prüfen, ob ein Eintrag für diesen JID bereits existiert
    const checkResult = await gamePool.request()
      .input("jid", sql.Int, gameAccountId)
      .query("SELECT JID FROM SK_SILK WHERE JID = @jid");

    if (checkResult.recordset.length === 0) {
      // Eintrag existiert nicht - erstellen
      await gamePool.request()
        .input("jid", sql.Int, gameAccountId)
        .input("amount", sql.Int, amount)
        .query("INSERT INTO SK_SILK (JID, silk_own, silk_gift, silk_point) VALUES (@jid, @amount, 0, 0)");
    } else {
      // Eintrag existiert - aktualisieren
      await gamePool.request()
        .input("jid", sql.Int, gameAccountId)
        .input("amount", sql.Int, amount)
        .query("UPDATE SK_SILK SET silk_own = silk_own + @amount WHERE JID = @jid");
    }

    res.json({ message: `Added ${amount} Silk` });
  } catch (err) {
    console.error("Error adding Silk:", err);
    res.status(500).json({ error: "Failed to add Silk" });
  }
});

module.exports = router;
