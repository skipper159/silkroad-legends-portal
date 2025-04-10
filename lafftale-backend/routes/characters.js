// routes/characters.js
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");

// Get all game accounts for a web user
router.get("/gameaccounts/:webUserId", async (req, res) => {
  const { webUserId } = req.params;

  await poolConnect;
  try {
    const result = await pool.request()
      .input("webUserId", sql.Int, webUserId)
      .query("SELECT * FROM GameAccounts WHERE WebUserId = @webUserId");

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching game accounts" });
  }
});

// Create a new game account
router.post("/gameaccounts", async (req, res) => {
  const { username, password, webUserId } = req.body;

  if (!username || !password || !webUserId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  await poolConnect;
  try {
    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .input("webUserId", sql.Int, webUserId)
      .query(`INSERT INTO GameAccounts (Username, Password, WebUserId) VALUES (@username, @password, @webUserId)`);

    res.status(201).json({ message: "Game account created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create game account" });
  }
});

// Change game account password
router.put("/gameaccounts/:id/password", async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "New password required" });
  }

  await poolConnect;
  try {
    await pool.request()
      .input("id", sql.Int, id)
      .input("newPassword", sql.NVarChar, newPassword)
      .query("UPDATE GameAccounts SET Password = @newPassword WHERE Id = @id");

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Delete a game account
router.delete("/gameaccounts/:id", async (req, res) => {
  const { id } = req.params;

  await poolConnect;
  try {
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM GameAccounts WHERE Id = @id");

    res.json({ message: "Game account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete game account" });
  }
});

// Get characters for a game account
router.get("/characters/:gameAccountId", async (req, res) => {
  const { gameAccountId } = req.params;

  await poolConnect;
  try {
    const result = await pool.request()
      .input("gameAccountId", sql.Int, gameAccountId)
      .query(`SELECT TOP 4 c.CharID, c.CharName16, c.Level, c.Strength, c.Intellect,
                     e.Slot, e.RefItemID
              FROM _Char c
              LEFT JOIN _Items i ON c.CharID = i.CharID
              LEFT JOIN _Equip e ON i.ID64 = e.ItemID
              WHERE c.UserJID = @gameAccountId`);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching characters" });
  }
});

module.exports = router;
