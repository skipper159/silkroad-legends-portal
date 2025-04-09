// routes/ranking.js
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");

const PAGE_SIZE = 25;

router.get("/:type", async (req, res) => {
  const { type } = req.params;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * PAGE_SIZE;

  const validTypes = ["top-player", "top-guild", "unique", "thief", "trader", "hunter"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid ranking type" });
  }

  let query = "";
  switch (type) {
    case "top-player":
      query = `SELECT * FROM (
        SELECT ROW_NUMBER() OVER (ORDER BY c.Level DESC, c.Exp DESC) AS RowNum,
               c.CharName16, c.Level, c.Exp, c.RefObjID,
               g.Name AS GuildName
        FROM _Char c
        LEFT JOIN GuildMember gm ON c.CharID = gm.CharID
        LEFT JOIN Guild g ON gm.GuildID = g.ID
      ) AS Ranked
      WHERE RowNum > @offset AND RowNum <= @offset + @pageSize`;
      break;
    case "top-guild":
      query = `SELECT * FROM (
        SELECT ROW_NUMBER() OVER (ORDER BY g.Level DESC, g.GatheredSP DESC) AS RowNum,
               g.Name AS GuildName, g.Level, g.GatheredSP
        FROM Guild g
      ) AS Ranked
      WHERE RowNum > @offset AND RowNum <= @offset + @pageSize`;
      break;
    case "unique":
      query = `SELECT * FROM (
        SELECT ROW_NUMBER() OVER (ORDER BY KillCount DESC) AS RowNum,
               CharName16, KillCount
        FROM UniqueKills
      ) AS Ranked
      WHERE RowNum > @offset AND RowNum <= @offset + @pageSize`;
      break;
    case "thief":
      query = `SELECT * FROM (
        SELECT ROW_NUMBER() OVER (ORDER BY ThiefPoints DESC) AS RowNum,
               CharName16, ThiefPoints
        FROM JobRanking
        WHERE JobType = 'Thief'
      ) AS Ranked
      WHERE RowNum > @offset AND RowNum <= @offset + @pageSize`;
      break;
    case "trader":
      query = `SELECT * FROM (
        SELECT ROW_NUMBER() OVER (ORDER BY TraderPoints DESC) AS RowNum,
               CharName16, TraderPoints
        FROM JobRanking
        WHERE JobType = 'Trader'
      ) AS Ranked
      WHERE RowNum > @offset AND RowNum <= @offset + @pageSize`;
      break;
    case "hunter":
      query = `SELECT * FROM (
        SELECT ROW_NUMBER() OVER (ORDER BY HunterPoints DESC) AS RowNum,
               CharName16, HunterPoints
        FROM JobRanking
        WHERE JobType = 'Hunter'
      ) AS Ranked
      WHERE RowNum > @offset AND RowNum <= @offset + @pageSize`;
      break;
  }

  await poolConnect;
  try {
    const result = await pool.request()
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, PAGE_SIZE)
      .query(query);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
