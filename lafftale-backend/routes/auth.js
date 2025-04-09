const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool, poolConnect, sql } = require("../db");

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).send("Missing fields");

  const hashed = await bcrypt.hash(password, 10);
  await poolConnect;
  try {
    const role = await pool.request()
      .query("SELECT Id FROM Roles WHERE Name = 'User'");

    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashed)
      .input("roleId", sql.Int, role.recordset[0].Id)
      .query(`INSERT INTO WebUsers (Username, Email, PasswordHash, RoleId) VALUES (@username, @email, @password, @roleId)`);

    res.status(201).send("User registered");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// LOGIN (Username or Email)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing fields");

  await poolConnect;
  try {
    const user = await pool.request()
      .input("identifier", sql.NVarChar, username)
      .query("SELECT * FROM WebUsers WHERE Username = @identifier OR Email = @identifier");

    if (!user.recordset[0]) return res.status(404).send("User not found");

    const valid = await bcrypt.compare(password, user.recordset[0].PasswordHash);
    if (!valid) return res.status(403).send("Invalid credentials");

    const token = jwt.sign(
      { id: user.recordset[0].Id, role: user.recordset[0].RoleId },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

module.exports = router;
