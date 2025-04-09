// routes/donation.js
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");

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

// POST a vote to a platform
router.post("/vote/:platform", async (req, res) => {
  const { platform } = req.params;
  const { userId } = req.body;
  const allowedPlatforms = ["xtreme", "arena", "gtop", "topg"];

  if (!allowedPlatforms.includes(platform)) {
    return res.status(400).json({ error: "Invalid voting platform" });
  }

  // Mock: Only allow one vote every 24h per user/platform
  // Logic skipped, assume vote is allowed

  await poolConnect;
  try {
    // Add 3 Silk
    await pool.request()
      .input("userId", sql.Int, userId)
      .query("UPDATE WebUsers SET SilkBalance = SilkBalance + 3 WHERE Id = @userId");

    res.json({ message: `Vote for ${platform} registered, 3 Silk added.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register vote" });
  }
});

module.exports = router;
