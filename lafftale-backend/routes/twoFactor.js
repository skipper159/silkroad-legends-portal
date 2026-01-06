const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { pool, poolConnect, sql } = require('../db');
const { comparePassword } = require('../utils/hash');
const { authenticator } = require('otplib');
const QRCode = require('qrcode');

// App name for authenticator display
const APP_NAME = 'Lafftale';

/**
 * Get 2FA status for current user
 * GET /api/2fa/status
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    await poolConnect;

    const result = await pool
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('SELECT totp_enabled FROM users WHERE id = @userId');

    if (!result.recordset[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      enabled: result.recordset[0].totp_enabled === true || result.recordset[0].totp_enabled === 1,
    });
  } catch (err) {
    console.error('Error getting 2FA status:', err);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

/**
 * Generate 2FA setup (secret + QR code)
 * POST /api/2fa/setup
 */
router.post('/setup', authenticateToken, async (req, res) => {
  try {
    await poolConnect;

    // Check if 2FA is already enabled
    const userResult = await pool
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('SELECT username, email, totp_enabled, totp_secret FROM users WHERE id = @userId');

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.totp_enabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }

    // Generate new secret or use existing pending secret
    const secret = user.totp_secret || authenticator.generateSecret();

    // Create otpauth URL for QR code
    const otpauthUrl = authenticator.keyuri(user.email || user.username, APP_NAME, secret);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Store secret temporarily (not enabled yet)
    await pool
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .input('secret', sql.NVarChar, secret)
      .query('UPDATE users SET totp_secret = @secret WHERE id = @userId');

    res.json({
      secret: secret, // For manual entry
      qrCode: qrCodeDataUrl, // For QR scanning
      otpauthUrl: otpauthUrl, // Alternative
    });
  } catch (err) {
    console.error('Error setting up 2FA:', err);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

/**
 * Verify TOTP code and enable 2FA
 * POST /api/2fa/verify
 */
router.post('/verify', authenticateToken, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  try {
    await poolConnect;

    const userResult = await pool
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('SELECT totp_secret, totp_enabled FROM users WHERE id = @userId');

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.totp_secret) {
      return res.status(400).json({ error: 'Please run setup first' });
    }

    if (user.totp_enabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }

    // Verify the code
    const isValid = authenticator.verify({ token: code, secret: user.totp_secret });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Enable 2FA
    await pool
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('UPDATE users SET totp_enabled = 1 WHERE id = @userId');

    res.json({
      success: true,
      message: 'Two-Factor Authentication enabled successfully',
    });
  } catch (err) {
    console.error('Error verifying 2FA:', err);
    res.status(500).json({ error: 'Failed to verify 2FA code' });
  }
});

/**
 * Disable 2FA (requires password)
 * POST /api/2fa/disable
 */
router.post('/disable', authenticateToken, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required to disable 2FA' });
  }

  try {
    await poolConnect;

    const userResult = await pool
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('SELECT password, totp_enabled FROM users WHERE id = @userId');

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.totp_enabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).json({ error: 'Invalid password' });
    }

    // Disable 2FA and clear secret
    await pool
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = @userId');

    res.json({
      success: true,
      message: 'Two-Factor Authentication disabled successfully',
    });
  } catch (err) {
    console.error('Error disabling 2FA:', err);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

/**
 * Verify 2FA code during login
 * POST /api/2fa/login
 */
router.post('/login', async (req, res) => {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    return res.status(400).json({ error: 'Temporary token and code are required' });
  }

  try {
    const jwt = require('jsonwebtoken');

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    if (!decoded.requires2FA) {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    await poolConnect;

    // Get user with 2FA secret
    const userResult = await pool.request().input('userId', sql.BigInt, decoded.id).query(`
        SELECT u.*, ur.is_admin 
        FROM users u 
        LEFT JOIN user_roles ur ON u.id = ur.user_id 
        WHERE u.id = @userId
      `);

    const user = userResult.recordset[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.totp_secret) {
      return res.status(400).json({ error: '2FA not configured' });
    }

    // Verify the TOTP code
    const isValid = authenticator.verify({ token: code, secret: user.totp_secret });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    // Update last login
    await pool
      .request()
      .input('userId', sql.BigInt, user.id)
      .input('now', sql.DateTime, new Date())
      .query('UPDATE users SET updated_at = @now WHERE id = @userId');

    // Generate full JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.is_admin ? 'admin' : 'user',
        username: user.username,
        isAdmin: user.is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.is_admin ? 'admin' : 'user',
        isAdmin: user.is_admin,
      },
    });
  } catch (err) {
    console.error('Error in 2FA login:', err);
    res.status(500).json({ error: 'Failed to complete login' });
  }
});

module.exports = router;
