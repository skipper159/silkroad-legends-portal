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
    console.log(`Login attempt for user: ${username}`);
    
    const user = await pool.request()
      .input("identifier", sql.NVarChar, username)
      .query("SELECT * FROM WebUsers WHERE Username = @identifier OR Email = @identifier");

    if (!user.recordset[0]) {
      console.log("User not found in database");
      return res.status(404).send("User not found");
    }

    const valid = await bcrypt.compare(password, user.recordset[0].PasswordHash);
    if (!valid) {
      console.log("Invalid password provided");
      return res.status(403).send("Invalid credentials");
    }

    console.log(`User authenticated successfully. UserId: ${user.recordset[0].Id}`);
    
    // Update last login time with current timestamp
    try {
      const currentTime = new Date();
        // Correct current date without time component for LastLogin
      const today = new Date();
      
      // Format HH:MM:SS for LogTime
      const timeOnly = currentTime.toTimeString().split(' ')[0];
        console.log(`Updating LastLogin (date) for user ${user.recordset[0].Id} to ${today.toISOString().split('T')[0]}`);
      console.log(`Updating LogTime (time) for user ${user.recordset[0].Id} to ${timeOnly}`);
      
      // Debug output for time values
      console.log("Current Date Object:", currentTime);
      console.log("Today:", today);
      console.log("Time only:", timeOnly);
        // Use separate queries for more clarity in error handling
      const updateDateResult = await pool.request()
        .input("userId", sql.Int, user.recordset[0].Id)
        .input("lastLogin", sql.Date, today)
        .query("UPDATE WebUsers SET LastLogin = CONVERT(date, GETDATE()) WHERE Id = @userId");
      
      console.log("LastLogin update result:", updateDateResult);
      
      const updateTimeResult = await pool.request()
        .input("userId", sql.Int, user.recordset[0].Id)
        .input("logTime", sql.VarChar, timeOnly)
        .query("UPDATE WebUsers SET LogTime = @logTime WHERE Id = @userId");
        
      console.log("LogTime update result:", updateTimeResult);
    } catch (updateErr) {
      console.error("Error updating LastLogin/LogTime:", updateErr);
    }

    const token = jwt.sign(
      { id: user.recordset[0].Id, 
        role: user.recordset[0].RoleId,
        username: user.recordset[0].Username
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Login error");
  }
});

module.exports = router;
