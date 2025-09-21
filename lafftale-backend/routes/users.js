const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET own profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().input('id', sql.BigInt, req.user.id).query(`
        SELECT 
          u.id, 
          u.username, 
          u.email, 
          u.jid,
          u.created_at as registeredAt, 
          u.updated_at as lastLogin,
          ur.is_admin as isAdmin
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        WHERE u.id = @id
      `);

    if (!result.recordset[0]) return res.status(404).send('User not found');

    console.log('User data being sent:', result.recordset[0]);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).send('Error fetching user');
  }
});

module.exports = router;
