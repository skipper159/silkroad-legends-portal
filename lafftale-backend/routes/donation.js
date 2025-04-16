// routes/donation.js
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");
const authenticateToken = require("../middleware/auth");

// Initiate a donation (placeholder logic)
router.post("/initiate", async (req, res) => {
  const { userId, amount, silkAmount, method } = req.body;

  if (!userId || !amount || !silkAmount || !method) {
    return res.status(400).json({ error: "Missing donation fields" });
  }

  // In real logic, you would generate a payment session here
  return res.json({ message: "Donation initiated", transactionId: "TX123456" });
});

// GET current Silk wallet amount
router.get("/wallet/:userId", async (req, res) => {
  const { userId } = req.params;

  await poolConnect;
  try {
    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query("SELECT SilkBalance FROM WebUsers WHERE Id = @userId");

    if (!result.recordset[0]) return res.status(404).json({ error: "User not found" });

    res.json({ silk: result.recordset[0].SilkBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
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

// POST a vote to a platform
router.post("/vote/:platform", authenticateToken, async (req, res) => {
  const { platform } = req.params;
  const { userId, gameAccountId } = req.body;
  const allowedPlatforms = ["xtreme", "arena", "gtop", "topg"];

  if (!allowedPlatforms.includes(platform)) {
    return res.status(400).json({ error: "Invalid voting platform" });
  }

  if (!gameAccountId) {
    return res.status(400).json({ error: "Game account ID is required" });
  }

  await poolConnect;
  try {
    const isValid = await validateGameAccountOwnership(userId, gameAccountId);
    if (!isValid) return res.status(403).json({ error: "Unauthorized game account" });

    // Add 3 Silk
    await pool.request()
      .input("gameAccountId", sql.Int, gameAccountId)
      .query("UPDATE GameAccounts SET Silk = Silk + 3 WHERE Id = @gameAccountId");

    res.json({ message: `Vote for ${platform} registered, 3 Silk added.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register vote" });
  }
});

module.exports = router;
