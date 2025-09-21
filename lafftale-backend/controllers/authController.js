const { pool, poolConnect, sql } = require('../db');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken, sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');
const PortalAccount = require('../models/portalAccount');

/**
 * Register a new user with SRO-CMS Pattern und Anti-cheat protection
 */
async function registerUser(req, res) {
  const { username, email, password, referralCode, fingerprint } = req.body;
  if (!username || !email || !password) return res.status(400).send('Missing fields');

  // Anti-Cheat Validierung
  const clientIP =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : '127.0.0.1');

  console.log('Registration attempt:', {
    username,
    email,
    ip: clientIP,
    fingerprint: fingerprint ? fingerprint.substring(0, 8) + '...' : 'none',
    referralCode,
  });

  // Fingerprint ist erforderlich für Anti-Cheat
  if (!fingerprint) {
    return res.status(400).send('Anti-cheat fingerprint is required');
  }

  console.log('Processing referralCode in registration:', referralCode);

  const hashedPassword = await hashPassword(password);

  // ✅ MAIL AUTHENTICATION - E-Mail Verifikation aktiviert
  const verificationToken = generateToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Valid for 24 hours

  await poolConnect;

  try {
    // ✅ SCHRITT 1: Username/Email Validierung mit Portal System
    const usernameExists = await PortalAccount.checkUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already exists in Portal system' });
    }

    const emailExists = await PortalAccount.checkEmailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists in Portal system' });
    }

    // ✅ SCHRITT 2: Vollständigen Portal Account erstellen (SRO-CMS Pattern)
    const portalJID = await PortalAccount.createFullAccount(username, password, email, clientIP);

    console.log(`✅ Portal Account erstellt: ${username} -> JID: ${portalJID}`);

    // ✅ SCHRITT 3: Web User mit ECHTER JID erstellen
    const userResult = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('jid', sql.Int, portalJID) // ✅ ECHTE JID aus Portal!
      .input('verificationToken', sql.NVarChar, verificationToken) // ✅ Verifikations-Token
      .input('now', sql.DateTime, new Date())
      .query(`INSERT INTO users (jid, username, email, password, remember_token, email_verified_at, created_at, updated_at) 
              OUTPUT INSERTED.id
              VALUES (@jid, @username, @email, @password, @verificationToken, NULL, @now, @now)`);

    const userId = userResult.recordset[0].id;

    // Create user role entry (default: not admin)
    await pool
      .request()
      .input('userId', sql.BigInt, userId)
      .input('isAdmin', sql.Bit, 0) // Default: not admin
      .input('now', sql.DateTime, new Date())
      .query(`INSERT INTO user_roles (user_id, is_admin, created_at, updated_at) 
              VALUES (@userId, @isAdmin, @now, @now)`);

    // Process referral code if provided
    if (referralCode) {
      console.log('Checking referral code:', referralCode);
      try {
        // Get referral settings
        const settingsResult = await pool
          .request()
          .query(
            "SELECT setting_key, setting_value FROM referral_settings WHERE setting_key IN ('points_per_referral', 'referral_enabled')"
          );

        const settings = {};
        settingsResult.recordset.forEach((row) => {
          settings[row.setting_key] = row.setting_value;
        });

        if (settings.referral_enabled !== 'true') {
          console.log('Referral system is disabled');
          return;
        }

        const pointsPerReferral = parseInt(settings.points_per_referral) || 100;

        // Find the referrer
        const referrerResult = await pool
          .request()
          .input('code', sql.NVarChar, referralCode)
          .query('SELECT jid FROM referrals WHERE code = @code');

        if (referrerResult.recordset.length > 0) {
          const referrerJid = referrerResult.recordset[0].jid;
          console.log('Found referrer with JID:', referrerJid);

          // Anti-Cheat Prüfung basierend auf SRO-CMS Logik
          let isValidReferral = true;
          let cheatReason = '';

          try {
            // Prüfe auf doppelte IP-Adressen beim gleichen Referrer
            const ipCheckResult = await pool
              .request()
              .input('referrer_jid', sql.BigInt, referrerJid)
              .input('client_ip', sql.NVarChar, clientIP)
              .query(
                'SELECT COUNT(*) as count FROM referrals WHERE jid = @referrer_jid AND ip_address = @client_ip'
              );

            if (ipCheckResult.recordset[0].count > 0) {
              isValidReferral = false;
              cheatReason = 'IP_DUPLICATE';
              console.log('Anti-Cheat: Duplicate IP detected for referrer');
            }

            // Prüfe auf doppelte Fingerprints beim gleichen Referrer
            if (isValidReferral) {
              const fingerprintCheckResult = await pool
                .request()
                .input('referrer_jid', sql.BigInt, referrerJid)
                .input('client_fingerprint', sql.NVarChar, fingerprint)
                .query(
                  'SELECT COUNT(*) as count FROM referrals WHERE jid = @referrer_jid AND fingerprint = @client_fingerprint'
                );

              if (fingerprintCheckResult.recordset[0].count > 0) {
                isValidReferral = false;
                cheatReason = 'FINGERPRINT_DUPLICATE';
                console.log('Anti-Cheat: Duplicate fingerprint detected for referrer');
              }
            }

            // Prüfe globale Rate Limits (max 5 Registrierungen pro IP pro Tag)
            if (isValidReferral) {
              const rateLimitResult = await pool
                .request()
                .input('client_ip', sql.NVarChar, clientIP)
                .input('today', sql.DateTime, new Date(new Date().setHours(0, 0, 0, 0)))
                .query(
                  'SELECT COUNT(*) as count FROM referrals WHERE ip_address = @client_ip AND created_at >= @today'
                );

              if (rateLimitResult.recordset[0].count >= 5) {
                isValidReferral = false;
                cheatReason = 'RATE_LIMIT_IP';
                console.log('Anti-Cheat: IP rate limit exceeded');
              }
            }
          } catch (antiCheatError) {
            console.error('Anti-cheat check failed:', antiCheatError);
            // Bei Anti-Cheat Fehlern als verdächtig markieren
            isValidReferral = false;
            cheatReason = 'ANTICHEAT_ERROR';
          }

          // Insert referral record mit Anti-Cheat Informationen und ECHTER JID
          console.log(
            `Inserting referral record (Valid: ${isValidReferral}, Reason: ${cheatReason})...`
          );
          await pool
            .request()
            .input('code', sql.NVarChar, referralCode)
            .input('referrer_jid', sql.BigInt, referrerJid)
            .input('invited_jid', sql.BigInt, portalJID) // ✅ ECHTE Portal JID verwenden!
            .input('points', sql.Int, isValidReferral ? pointsPerReferral : 0) // Keine Punkte bei Cheat
            .input('redeemed', sql.Bit, 0)
            .input('reward_silk', sql.Int, 0)
            .input('ip_address', sql.NVarChar, clientIP)
            .input('fingerprint', sql.NVarChar, fingerprint)
            .input('is_valid', sql.Bit, isValidReferral ? 1 : 0)
            .input('cheat_reason', sql.NVarChar, cheatReason || null)
            .input('created_at', sql.DateTime, new Date())
            .input('updated_at', sql.DateTime, new Date())
            .query(`INSERT INTO referrals (code, jid, invited_jid, points, redeemed, reward_silk, ip_address, fingerprint, is_valid, cheat_reason, created_at, updated_at) 
                      VALUES (@code, @referrer_jid, @invited_jid, @points, @redeemed, @reward_silk, @ip_address, @fingerprint, @is_valid, @cheat_reason, @created_at, @updated_at)`);

          if (isValidReferral) {
            console.log(
              `Valid referral record created (${pointsPerReferral} points, pending manual redemption)`
            );
          } else {
            console.log(`Suspicious referral blocked - Reason: ${cheatReason}`);
          }
        } else {
          console.log('Referral code not found:', referralCode);
        }
      } catch (referralError) {
        console.error('Error processing referral:', referralError);
        // Don't fail registration if referral processing fails
      }
    }

    // ✅ MAIL AUTHENTICATION - Verifikations-E-Mail senden
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // We don't return an error here to avoid interrupting the registration process
    }

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error(err);

    if (err.number === 2627) {
      // SQL Server unique constraint violation
      return res.status(409).send('Username or email already exists');
    }

    res.status(500).send('Database error during registration');
  }
}

/**
 * Login a user
 */
async function loginUser(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing fields');

  await poolConnect;
  try {
    // Find user in users table with role information
    const user = await pool.request().input('username', sql.NVarChar, username).query(`
        SELECT u.*, ur.is_admin 
        FROM users u 
        LEFT JOIN user_roles ur ON u.id = ur.user_id 
        WHERE u.username = @username OR u.email = @username
      `);

    if (!user.recordset[0]) return res.status(404).send('User not found');

    const valid = await comparePassword(password, user.recordset[0].password);
    if (!valid) return res.status(403).send('Invalid credentials');

    // ✅ MAIL AUTHENTICATION - E-Mail Verifikation Check aktiviert
    // Check if the user has verified their email address
    if (!user.recordset[0].email_verified_at) {
      // Optional: A new confirmation email could be triggered here if the old one has expired
      return res.status(403).send({
        message: 'Email not verified',
        needsVerification: true,
      });
    }

    // Update last login time (updated_at field)
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('now', sql.DateTime, new Date())
      .query('UPDATE users SET updated_at = @now WHERE id = @userId');

    const token = jwt.sign(
      {
        id: user.recordset[0].id,
        role: user.recordset[0].is_admin ? 'admin' : 'user',
        username: user.recordset[0].username,
        isAdmin: user.recordset[0].is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.recordset[0].id,
        username: user.recordset[0].username,
        email: user.recordset[0].email,
        role: user.recordset[0].is_admin ? 'admin' : 'user',
        isAdmin: user.recordset[0].is_admin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
}

/**
 * Forgot password - Sends an email with a password reset link
 */
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email is required');

  try {
    await poolConnect;
    // Check if user with this email exists
    const user = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (!user.recordset[0]) {
      // For security reasons, we don't reveal that the email doesn't exist
      return res.status(200).send('Reset password instructions sent if email exists');
    }

    // Token for password reset
    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // Valid for 1 hour

    // Store token in the remember_token field (repurposing it for reset tokens)
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('resetToken', sql.NVarChar, resetToken)
      .input('now', sql.DateTime, new Date())
      .query('UPDATE users SET remember_token = @resetToken, updated_at = @now WHERE id = @userId');

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).send('Reset password instructions sent');
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).send('Error processing password reset request');
  }
}

/**
 * Verifies if a password reset token is valid
 */
async function verifyResetToken(req, res) {
  const { token } = req.params;
  if (!token) return res.status(400).send('Token is required');

  try {
    await poolConnect;
    // Find token in the remember_token field
    const user = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .query('SELECT * FROM users WHERE remember_token = @token');

    if (!user.recordset[0]) {
      return res.status(400).send('Invalid or expired token');
    }

    res.status(200).send('Token is valid');
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).send('Error verifying token');
  }
}

/**
 * Resets the password
 */
async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).send('Token and password are required');

  try {
    await poolConnect;
    // Find token in the remember_token field
    const user = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .query('SELECT * FROM users WHERE remember_token = @token');

    if (!user.recordset[0]) {
      return res.status(400).send('Invalid or expired token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('password', sql.NVarChar, hashedPassword)
      .input('now', sql.DateTime, new Date())
      .query(
        'UPDATE users SET password = @password, remember_token = NULL, updated_at = @now WHERE id = @userId'
      );

    res.status(200).send('Password has been reset successfully');
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).send('Error resetting password');
  }
}

/**
 * Confirms a user's email address
 */
async function verifyEmail(req, res) {
  const { token } = req.params;
  if (!token) return res.status(400).send('Token is required');

  try {
    await poolConnect;
    // Find token in the remember_token field (repurposed for email verification)
    const user = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .query('SELECT * FROM users WHERE remember_token = @token');

    if (!user.recordset[0]) {
      return res.status(400).send('Invalid or expired token');
    }

    // Mark email as verified and clear token
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('now', sql.DateTime, new Date())
      .query(
        'UPDATE users SET email_verified_at = @now, remember_token = NULL, updated_at = @now WHERE id = @userId'
      );

    res.status(200).send('Email has been verified successfully');
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).send('Error verifying email');
  }
}

/**
 * Sends a new verification email
 */
async function resendVerificationEmail(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email is required');

  try {
    await poolConnect;
    // Find user in the database
    const user = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (!user.recordset[0]) {
      // For security reasons, we don't reveal that the email doesn't exist
      return res.status(200).send('Verification email sent if account exists');
    }

    // If the email is already verified
    if (user.recordset[0].email_verified_at) {
      return res.status(400).send('Email is already verified');
    }

    // Generate new token
    const verificationToken = generateToken();

    // Update token in the database (using remember_token field)
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('verificationToken', sql.NVarChar, verificationToken)
      .input('now', sql.DateTime, new Date())
      .query(
        'UPDATE users SET remember_token = @verificationToken, updated_at = @now WHERE id = @userId'
      );

    // Send email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).send('Verification email sent');
  } catch (err) {
    console.error('Resend verification email error:', err);
    res.status(500).send('Error sending verification email');
  }
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
