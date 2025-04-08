
const { pool, poolConnect, sql } = require("../db");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../utils/hash");

/**
 * Register a new user
 */
async function registerUser(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).send("Missing fields");

  const hashedPassword = await hashPassword(password);
  await poolConnect;
  
  try {
    const role = await pool.request()
      .query("SELECT Id FROM Roles WHERE Name = 'User'");
      
    if (!role.recordset[0]) {
      return res.status(500).send("Role configuration error");
    }

    await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPassword)
      .input("roleId", sql.Int, role.recordset[0].Id)
      .query(`INSERT INTO WebUsers (Username, Email, PasswordHash, RoleId) VALUES (@username, @email, @password, @roleId)`);

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error(err);
    
    if (err.number === 2627) { // SQL Server unique constraint violation
      return res.status(409).send("Username or email already exists");
    }
    
    res.status(500).send("Database error during registration");
  }
}

/**
 * Login a user
 */
async function loginUser(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Missing fields");

  await poolConnect;
  try {
    const user = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT * FROM WebUsers WHERE Username = @username");

    if (!user.recordset[0]) return res.status(404).send("User not found");

    const valid = await comparePassword(password, user.recordset[0].PasswordHash);
    if (!valid) return res.status(403).send("Invalid credentials");

    // Update last login time
    await pool.request()
      .input("userId", sql.Int, user.recordset[0].Id)
      .input("now", sql.DateTime, new Date())
      .query("UPDATE WebUsers SET LastLogin = @now WHERE Id = @userId");

    const token = jwt.sign(
      { 
        id: user.recordset[0].Id, 
        role: user.recordset[0].RoleId,
        username: user.recordset[0].Username
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );
    
    res.json({ 
      token,
      user: {
        id: user.recordset[0].Id,
        username: user.recordset[0].Username,
        email: user.recordset[0].Email,
        role: user.recordset[0].RoleId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
}

module.exports = {
  registerUser,
  loginUser
};
