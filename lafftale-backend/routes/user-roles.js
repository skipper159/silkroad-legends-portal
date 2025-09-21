const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
        SELECT 
          u.id as id, 
          u.username as username, 
          u.email as email, 
          COALESCE(u.jid, 0) as jid,
          COALESCE(ur.is_admin, 0) as is_admin,
          1 as is_active,
          u.updated_at as last_login,
          u.created_at as created_at
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        ORDER BY u.created_at DESC
      `);

    res.json({
      success: true,
      users: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.get('/user-stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) as active_users,
          SUM(COALESCE(ur.is_admin, 0)) as admin_users,
          0 as inactive_users
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
      `);

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.put('/users/:id/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body;
    const pool = await getWebDb();

    // Check if user_role entry exists
    const checkResult = await pool
      .request()
      .input('userId', sql.Int, id)
      .query('SELECT id FROM user_roles WHERE user_id = @userId');

    if (checkResult.recordset.length === 0) {
      // Create new user_role entry
      await pool
        .request()
        .input('userId', sql.Int, id)
        .input('isAdmin', sql.Bit, is_admin ? 1 : 0)
        .query(
          'INSERT INTO user_roles (user_id, is_admin, created_at, updated_at) VALUES (@userId, @isAdmin, GETDATE(), GETDATE())'
        );
    } else {
      // Update existing user_role entry
      await pool
        .request()
        .input('userId', sql.Int, id)
        .input('isAdmin', sql.Bit, is_admin ? 1 : 0)
        .query(
          'UPDATE user_roles SET is_admin = @isAdmin, updated_at = GETDATE() WHERE user_id = @userId'
        );
    }

    res.json({
      success: true,
      message: `User ${is_admin ? 'promoted to' : 'removed from'} admin role`,
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.put('/users/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const pool = await getWebDb();

    // Since there's no banned_until column, we'll just return success
    // In a real implementation, you might want to add a banned_until column
    // or use another mechanism to track user status

    res.json({
      success: true,
      message: `User status updated (feature not fully implemented - no banned_until column)`,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.put('/users/:id/password', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const pool = await getWebDb();

    // Hash the password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool
      .request()
      .input('userId', sql.Int, id)
      .input('password', sql.VarChar, hashedPassword)
      .query('UPDATE users SET password = @password WHERE id = @userId');

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
        SELECT ur.id, ur.user_id, ur.is_admin, ur.created_at, ur.updated_at,
               u.username, u.email 
        FROM user_roles ur
        JOIN users u ON ur.user_id = u.id
        ORDER BY ur.created_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.post('/assign', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { user_id, role, permissions } = req.body;
    const pool = await getWebDb();

    const is_admin = role === 'admin' ? 1 : 0;

    // Check if user_role entry exists
    const checkResult = await pool
      .request()
      .input('userId', sql.Int, user_id)
      .query('SELECT id FROM user_roles WHERE user_id = @userId');

    if (checkResult.recordset.length === 0) {
      // Create new user_role entry
      await pool
        .request()
        .input('userId', sql.Int, user_id)
        .input('isAdmin', sql.Bit, is_admin)
        .query(
          'INSERT INTO user_roles (user_id, is_admin, created_at, updated_at) VALUES (@userId, @isAdmin, GETDATE(), GETDATE())'
        );
    } else {
      // Update existing user_role entry
      await pool
        .request()
        .input('userId', sql.Int, user_id)
        .input('isAdmin', sql.Bit, is_admin)
        .query(
          'UPDATE user_roles SET is_admin = @isAdmin, updated_at = GETDATE() WHERE user_id = @userId'
        );
    }

    res.status(201).json({
      success: true,
      message: `Role '${role}' assigned to user ${user_id}`,
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.get('/my-roles', verifyToken, async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().input('userId', sql.Int, req.user.id).query(`
        SELECT ur.is_admin, ur.created_at, ur.updated_at
        FROM user_roles ur
        WHERE ur.user_id = @userId
      `);

    res.json({
      success: true,
      data: result.recordset[0] || { is_admin: false },
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
