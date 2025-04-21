const express = require("express");
const router = express.Router();
const { charPool, charPoolConnect, sql } = require("../db");
const { getItemImagePath } = require("../utils/itemimage");

// 🔧 Hilfsfunktion zur Bestimmung der Item-Rarität anhand des CodeNames
function getRarityFromCodeName(ItemCodeName) {
    if (!ItemCodeName) return "normal";

    const cn = ItemCodeName.toUpperCase();

    if (cn.includes("_C_RARE")) return "Seal of Sun";
    if (cn.includes("_B_RARE")) return "Seal of Moon";
    if (cn.includes("_A_RARE")) return "Seal of Star";

    return "normal";
}

router.get("/:charId", async (req, res) => {
    const { charId } = req.params;

    if (!charId || isNaN(charId)) {
        return res.status(400).json({ error: "Invalid character ID" });
    }

    try {
        await charPoolConnect;

        const result = await charPool.request()
            .input("CharID", sql.Int, charId)
            .query(`
                SELECT 
                    c.CharID,
                    c.CharName16,
                    inv.Slot,
                    i.ID64 AS ID,
                    i.OptLevel AS plus,
                    i.Data AS quantity,
                    roc.CodeName128 AS ItemCodeName,
                    roc.NameStrID128 AS nameStrId
                FROM 
                    _Char c
                JOIN 
                    _Inventory inv ON c.CharID = inv.CharID
                JOIN 
                    _Items i ON inv.ItemID = i.ID64
                JOIN 
                    _RefObjCommon roc ON i.RefItemID = roc.ID
                WHERE 
                    c.CharID = @CharID
                    AND inv.Slot BETWEEN 0 AND 12
            `);

        console.log("Ermittelte Items für CharID", charId, ":", result.recordset);

        const items = result.recordset.map(row => {
            const rarity = getRarityFromCodeName(row.ItemCodeName);

            return {
                id: row.ID,
                codeName: row.ItemCodeName,
                name: row.nameStrId || row.ItemCodeName,
                quantity: row.quantity || 1,
                slot: row.Slot,
                plus: row.plus || 0,
                rarity,
                iconUrl: row.ItemCodeName ? getItemImagePath(row.ItemCodeName) : null,
                isEquipped: row.Slot < 13
            };
        });

        res.status(200).json(items);
    } catch (err) {
        console.error("Error fetching inventory:", err);
        res.status(500).json({ error: "Failed to fetch inventory" });
    }
});

module.exports = router;
