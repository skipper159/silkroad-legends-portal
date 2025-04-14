const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");
const authenticateToken = require("../middleware/auth");

// GET own profile
router.get("/me", authenticateToken, async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request()
      .input("id", sql.Int, req.user.id)
      .query(`
        SELECT 
          Id as id, 
          Username as username, 
          Email as email, 
          RegisteredAt as registeredAt, 
          LastLogin as lastLogin,
          CONVERT(VARCHAR(8), LogTime, 108) as logTime
        FROM WebUsers 
        WHERE Id = @id
      `);

    if (!result.recordset[0]) return res.status(404).send("User not found");
    
    console.log("User data being sent:", result.recordset[0]);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user");
  }
});

module.exports = router;
