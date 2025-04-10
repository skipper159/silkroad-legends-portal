// routes/characterDetails.js
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");

// GET detailed character information
router.get("/:charId/details", async (req, res) => {
  const { charId } = req.params;

  await poolConnect;
  try {
    const result = await pool.request()
      .input("charId", sql.Int, charId)
      .query(`
        SELECT c.CharID, c.CharName16, c.Level, c.Strength, c.Intellect,
               e.Slot, e.RefItemID, it.CodeName128, it.Name128, it.Desc128
        FROM _Char c
        LEFT JOIN _Equip e ON c.CharID = e.CharID
        LEFT JOIN _RefObjCommon it ON e.RefItemID = it.ID
        WHERE c.CharID = @charId
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error loading character details:", err);
    res.status(500).json({ error: "Failed to load character details" });
  }
});

module.exports = router;