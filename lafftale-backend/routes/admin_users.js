const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/auth');

// Get all users with roles for admin
router.get('/users', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 50 } = req.query;
    const pool = await getWebDb();

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT u.id, u.username, u.email, u.is_admin, u.is_active, 
             u.created_at, u.updated_at, u.last_login, u.jid, u.totp_enabled,
             COUNT(*) OVER() as total_count
      FROM users u
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (u.username LIKE @search OR u.email LIKE @search)`;
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    if (role === 'admin') {
      query += ` AND u.is_admin = 1`;
    } else if (role === 'user') {
      query += ` AND u.is_admin = 0`;
    }

    if (status === 'active') {
      query += ` AND u.is_active = 1`;
    } else if (status === 'inactive') {
      query += ` AND u.is_active = 0`;
    }

    query += ` ORDER BY u.created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    const request = pool.request();
    params.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, parseInt(limit));

    const result = await request.query(query);

    const totalCount = result.recordset.length > 0 ? result.recordset[0].total_count : 0;
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      users: result.recordset.map((user) => ({
        ...user,
        total_count: undefined, // Remove from individual records
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin/user)
router.patch('/users/:id/role', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body;

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot modify your own admin status' });
    }

    const pool = await getWebDb();

    await pool
      .request()
      .input('id', sql.BigInt, id)
      .input('is_admin', sql.Bit, is_admin)
      .input('updatedBy', sql.BigInt, req.user.id).query(`
        UPDATE users 
        SET is_admin = @is_admin, updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Update user status (active/inactive)
router.patch('/users/:id/status', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot modify your own account status' });
    }

    const pool = await getWebDb();

    await pool
      .request()
      .input('id', sql.BigInt, id)
      .input('is_active', sql.Bit, is_active)
      .input('updatedBy', sql.BigInt, req.user.id).query(`
        UPDATE users 
        SET is_active = @is_active, updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Reset user password (admin action)
router.post('/users/:id/reset-password', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const bcrypt = require('bcrypt');
    const pool = await getWebDb();

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool
      .request()
      .input('id', sql.BigInt, id)
      .input('password', sql.NVarChar, hashedPassword)
      .input('updatedBy', sql.BigInt, req.user.id).query(`
        UPDATE users 
        SET password = @password, updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'User password reset successfully' });
  } catch (err) {
    console.error('Error resetting user password:', err);
    res.status(500).json({ error: 'Failed to reset user password' });
  }
});

// Get user details
router.get('/users/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    const userResult = await pool.request().input('id', sql.BigInt, id).query(`
        SELECT u.id, u.username, u.email, u.is_admin, u.is_active, 
               u.created_at, u.updated_at, u.last_login, u.jid
        FROM users u
        WHERE u.id = @id
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.recordset[0];

    // Get additional user statistics
    const statsResult = await pool.request().input('userId', sql.BigInt, id).query(`
        SELECT 
          (SELECT COUNT(*) FROM SupportTickets WHERE UserId = @userId) as ticket_count,
          (SELECT COUNT(*) FROM vote_history WHERE user_id = @userId) as vote_count,
          (SELECT COUNT(*) FROM voucher_history WHERE user_id = @userId) as voucher_usage_count
      `);

    const stats = statsResult.recordset[0] || {};

    res.json({
      ...user,
      statistics: stats,
    });
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Delete user (admin action)
router.delete('/users/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const pool = await getWebDb();

    // Note: In a production system, you might want to soft delete or anonymize
    // instead of hard delete to preserve referential integrity
    await pool.request().input('id', sql.BigInt, id).query('DELETE FROM users WHERE id = @id');

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get admin action logs
router.get('/admin-logs', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const pool = await getWebDb();

    const result = await pool.request().input('limit', sql.Int, parseInt(limit)).query(`
        SELECT TOP(@limit)
          al.id, al.action, al.target_type, al.target_id, al.details,
          al.created_at, u.username as admin_username
        FROM admin_logs al
        JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching admin logs:', err);
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
});

// Get user role statistics
router.get('/users/statistics', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const result = await pool.request().query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_admin = 1 THEN 1 END) as admin_count,
        COUNT(CASE WHEN is_admin = 0 THEN 1 END) as regular_user_count,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_users,
        COUNT(CASE WHEN last_login >= DATEADD(day, -7, GETDATE()) THEN 1 END) as users_last_week,
        COUNT(CASE WHEN last_login >= DATEADD(day, -30, GETDATE()) THEN 1 END) as users_last_month,
        COUNT(CASE WHEN created_at >= DATEADD(day, -7, GETDATE()) THEN 1 END) as new_users_last_week,
        COUNT(CASE WHEN created_at >= DATEADD(day, -30, GETDATE()) THEN 1 END) as new_users_last_month
      FROM users
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching user statistics:', err);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Reset user 2FA (admin action for support tickets)
router.post('/users/:id/reset-2fa', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    // Check if user exists and has 2FA enabled
    const userResult = await pool
      .request()
      .input('id', sql.BigInt, id)
      .query('SELECT id, username, totp_enabled FROM users WHERE id = @id');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.recordset[0];

    if (!user.totp_enabled) {
      return res.status(400).json({ error: 'User does not have 2FA enabled' });
    }

    // Disable 2FA and clear secret
    await pool
      .request()
      .input('id', sql.BigInt, id)
      .query('UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = @id');

    console.log(`Admin ${req.user.username} reset 2FA for user ${user.username} (ID: ${id})`);

    res.json({
      success: true,
      message: `Two-Factor Authentication reset for user ${user.username}`,
    });
  } catch (err) {
    console.error('Error resetting user 2FA:', err);
    res.status(500).json({ error: 'Failed to reset user 2FA' });
  }
});

module.exports = router;
