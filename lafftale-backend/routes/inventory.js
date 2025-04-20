const express = require("express");
const router = express.Router();
const { getCharDb, sql } = require("../db");
const { getItemImagePath } = require("../utils/itemimage");

router.get("/:charId", async (req, res) => {
  const { charId } = req.params;

  if (!charId || isNaN(charId)) {
    return res.status(400).json({ error: "Invalid character ID" });
  }

  try {
    const pool = await getCharDb();

    const result = await pool.request()
      .input("CharID", sql.Int, charId)
      .query(`
        SELECT 
          i.ID,
          i.Slot,
          i.Data AS quantity,
          i.OptLevel AS plus,
          roc.CodeName128 AS codeName,
          roc.NameStrID128 AS nameStrId,
          roc.AssocFileIcon128 AS iconSource
        FROM 
          _Items i
        JOIN 
          RefObjCommon roc ON i.RefItemID = roc.ID
        WHERE 
          i.CharID = @CharID
          AND i.Slot BETWEEN 0 AND 255
      `);

    const items = result.recordset.map(row => ({
      id: row.ID,
      codeName: row.codeName,
      name: row.nameStrId || row.codeName,
      quantity: row.quantity,
      slot: row.Slot,
      plus: row.plus,
      rarity: "normal", // TODO: später dynamisch bestimmen
      iconUrl: getItemImagePath(row.codeName),
      isEquipped: row.Slot < 13 // z. B. Slot 0–12 = ausgerüstet
    }));

    res.status(200).json(items);
  } catch (err) {
    console.error("Error fetching inventory:", err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

module.exports = router;
