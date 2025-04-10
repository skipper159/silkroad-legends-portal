// routes/silk.js
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");

// Get Silk balance for GameAccount
router.get("/balance/:gameAccountId", async (req, res) => {
  const { gameAccountId } = req.params;

  await poolConnect;
  try {
    const result = await pool.request()
      .input("gameAccountId", sql.Int, gameAccountId)
      .query("SELECT Silk FROM GameAccounts WHERE Id = @gameAccountId");

    if (!result.recordset[0]) return res.status(404).json({ error: "Game account not found" });

    res.json({ silk: result.recordset[0].Silk });
  } catch (err) {
    console.error("Error fetching Silk balance:", err);
    res.status(500).json({ error: "Failed to fetch Silk balance" });
  }
});

// Add Silk (donation or voting)
router.post("/add", async (req, res) => {
  const { gameAccountId, amount } = req.body;
  if (!gameAccountId || !amount) return res.status(400).json({ error: "Missing fields" });

  await poolConnect;
  try {
    await pool.request()
      .input("gameAccountId", sql.Int, gameAccountId)
      .input("amount", sql.Int, amount)
      .query("UPDATE GameAccounts SET Silk = Silk + @amount WHERE Id = @gameAccountId");

    res.json({ message: `Added ${amount} Silk` });
  } catch (err) {
    console.error("Error adding Silk:", err);
    res.status(500).json({ error: "Failed to add Silk" });
  }
});

// Spend Silk
router.post("/spend", async (req, res) => {
  const { gameAccountId, amount } = req.body;
  if (!gameAccountId || !amount) return res.status(400).json({ error: "Missing fields" });

  await poolConnect;
  try {
    const result = await pool.request()
      .input("gameAccountId", sql.Int, gameAccountId)
      .query("SELECT Silk FROM GameAccounts WHERE Id = @gameAccountId");

    const current = result.recordset[0]?.Silk || 0;
    if (current < amount) return res.status(400).json({ error: "Not enough Silk" });

    await pool.request()
      .input("gameAccountId", sql.Int, gameAccountId)
      .input("amount", sql.Int, amount)
      .query("UPDATE GameAccounts SET Silk = Silk - @amount WHERE Id = @gameAccountId");

    res.json({ message: `Spent ${amount} Silk` });
  } catch (err) {
    console.error("Error spending Silk:", err);
    res.status(500).json({ error: "Failed to spend Silk" });
  }
});

module.exports = router;
