const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const {
  charPool,
  gamePool,
  accountPool,
  webPool,
  charPoolConnect,
  gamePoolConnect,
  accountPoolConnect,
  webPoolConnect,
  sql,
  getWebDb,
  getAccountDb,
} = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Simple IP to CountryCode mapping (IPv4 only)
function getCountryCodeFromIP(ip) {
  // Default mapping for common IPv4 IPs
  if (ip === '127.0.0.1' || ip === '::1') return 'DE'; // localhost
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return 'DE'; // private networks

  // For production, you might want to use a service like:
  // - MaxMind GeoIP
  // - ip-api.com
  // - ipinfo.io

  return 'DE'; // Default to Germany
}

// Create Game Account
router.post('/create', authenticateToken, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password required' });

  try {
    console.log('Creating game account for user:', req.user.id, 'with username:', username);

    await accountPoolConnect;
    await charPoolConnect;

    // Check if username already exists in SILKROAD_R_ACCOUNT database
    const accountDb = await getAccountDb();
    const check = await accountDb
      .request()
      .input('username', sql.NVarChar(25), username)
      .query('SELECT COUNT(*) AS count FROM TB_User WHERE StrUserID = @username');

    if (check.recordset[0].count > 0) {
      return res.status(409).json({ error: 'Game account already exists' });
    }

    const hashed = crypto.createHash('md5').update(password).digest('hex');

    // Get client IP for UserIP field (IPv4 only)
    let clientIP =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      req.ip ||
      req.connection.remoteAddress ||
      '127.0.0.1';

    // Ensure IPv4 format
    if (clientIP.includes('::ffff:')) {
      // Remove IPv6-to-IPv4 mapping prefix
      clientIP = clientIP.replace('::ffff:', '');
    } else if (clientIP.includes(':') && !clientIP.includes('.')) {
      // If it's an IPv6 address without IPv4 mapping, use localhost
      clientIP = '127.0.0.1';
    }

    // Validate IPv4 format (basic check)
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(clientIP)) {
      clientIP = '127.0.0.1'; // Fallback to localhost
    }

    const countryCode = getCountryCodeFromIP(clientIP);

    console.log('Client IP (IPv4):', clientIP, 'Country Code:', countryCode);

    // Generate PortalJID (could be same as JID or auto-increment separately)
    // For now, we'll let it auto-increment in the database

    // Insert into TB_User with auto-generated PortalJID
    console.log('Attempting to insert into TB_User...');

    // Use a transaction to ensure thread-safe PortalJID generation
    const transaction = new sql.Transaction(accountDb);
    let insertResult;

    try {
      await transaction.begin();

      // Get the next available PortalJID within transaction
      const portalJidResult = await transaction
        .request()
        .query(
          'SELECT ISNULL(MAX(PortalJID), 0) + 1 AS NextPortalJID FROM TB_User WITH (TABLOCKX)'
        );
      const nextPortalJID = portalJidResult.recordset[0].NextPortalJID;

      console.log('Next PortalJID:', nextPortalJID);

      // Insert with the generated PortalJID and all required fields
      insertResult = await transaction
        .request()
        .input('username', sql.NVarChar(50), username)
        .input('password', sql.NVarChar(50), hashed)
        .input('portalJID', sql.Int, nextPortalJID)
        .input('serviceCompany', sql.TinyInt, 11)
        .input('active', sql.Bit, 1)
        .input('userIP', sql.NVarChar(50), clientIP)
        .input('countryCode', sql.NChar(2), countryCode)
        .input('visitDate', sql.DateTime, new Date())
        .input('regDate', sql.DateTime, new Date())
        .input('secPrimary', sql.TinyInt, 3)
        .input('secContent', sql.TinyInt, 3)
        .input('secGrade', sql.TinyInt, 0)
        .input('accPlayTime', sql.Int, 0)
        .input('latestUpdateTime', sql.Int, 0).query(`
          INSERT INTO TB_User (StrUserID, password, PortalJID, ServiceCompany, Active, UserIP, CountryCode, VisitDate, RegDate, sec_primary, sec_content, sec_grade, AccPlayTime, LatestUpdateTime_ToPlayTime)
          VALUES (@username, @password, @portalJID, @serviceCompany, @active, @userIP, @countryCode, @visitDate, @regDate, @secPrimary, @secContent, @secGrade, @accPlayTime, @latestUpdateTime);
          SELECT SCOPE_IDENTITY() AS JID;
        `);

      await transaction.commit();
      console.log('TB_User insert successful, JID:', insertResult.recordset[0]?.JID);
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }

    const newJid = insertResult.recordset[0].JID;
    console.log('Got new JID:', newJid);

    // Check if this is the user's first game account
    const webDb = await getWebDb();
    const existingAccountsResult = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('SELECT COUNT(*) AS count FROM user_gameaccounts WHERE user_id = @userId');

    const isFirstAccount = existingAccountsResult.recordset[0].count === 0;

    // Insert into user_gameaccounts table instead of updating users.jid
    await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .input('gameaccountJid', sql.Int, newJid)
      .input('isPrimary', sql.Bit, isFirstAccount ? 1 : 0) // First account is automatically primary
      .query(`
        INSERT INTO user_gameaccounts (user_id, gameaccount_jid, is_primary, created_at)
        VALUES (@userId, @gameaccountJid, @isPrimary, GETDATE())
      `);

    console.log('Game account linked successfully, isPrimary:', isFirstAccount);

    res.status(201).json({ message: 'Game account created', jid: newJid });
  } catch (err) {
    console.error('Error creating game account:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      originalError: err.originalError,
    });
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Get Game Accounts of Authenticated User
router.get('/my', authenticateToken, async (req, res) => {
  try {
    await accountPoolConnect;

    // Get all user's game accounts from user_gameaccounts table
    const webDb = await getWebDb();
    const userGameAccountsResult = await webDb.request().input('userId', sql.BigInt, req.user.id)
      .query(`
        SELECT uga.gameaccount_jid, uga.is_primary, uga.created_at
        FROM user_gameaccounts uga
        WHERE uga.user_id = @userId
        ORDER BY uga.is_primary DESC, uga.created_at ASC
      `);

    if (userGameAccountsResult.recordset.length === 0) {
      return res.status(200).json([]);
    }

    // Get user's email for each account
    const userResult = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('SELECT email FROM users WHERE id = @userId');

    const user = userResult.recordset[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get Game Account Details from SILKROAD_R_ACCOUNT database for each account
    const accountDb = await getAccountDb();
    const gameAccounts = [];

    for (const userGameAccount of userGameAccountsResult.recordset) {
      const jid = userGameAccount.gameaccount_jid;

      const result = await accountDb.request().input('jid', sql.Int, jid).query(`
        SELECT JID, PortalJID, StrUserID, ServiceCompany, Active, UserIP, CountryCode, VisitDate, RegDate, AccPlayTime
        FROM TB_User
        WHERE JID = @jid
      `);

      if (result.recordset.length > 0) {
        // Get Silk information for the game account from the same database
        const silkResult = await accountDb.request().input('jid', sql.Int, jid).query(`
          SELECT JID, silk_own, silk_gift, silk_point 
          FROM SK_SILK 
          WHERE JID = @jid
        `);

        // Combine the data
        const account = result.recordset[0];
        const silkData = silkResult.recordset[0] || { silk_own: 0, silk_gift: 0, silk_point: 0 };

        const gameAccount = {
          ...account,
          email: user.email,
          silk_own: silkData.silk_own || 0,
          silk_gift: silkData.silk_gift || 0,
          silk_point: silkData.silk_point || 0,
          total_silk:
            (silkData.silk_own || 0) + (silkData.silk_gift || 0) + (silkData.silk_point || 0),
          isPrimary: userGameAccount.is_primary,
          createdAt: userGameAccount.created_at,
        };

        gameAccounts.push(gameAccount);
      }
    }

    res.json(gameAccounts);
  } catch (err) {
    console.error('Error fetching game accounts:', err);
    res.status(500).json({ error: 'Failed to load game accounts' });
  }
});

// Change Game Account Password
router.put('/:id/password', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Current and new password required' });

  try {
    await gamePoolConnect;

    // First verify that this game account belongs to the authenticated user
    const webDb = await getWebDb();
    const ownerCheckResult = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .input('gameaccountJid', sql.Int, id).query(`
        SELECT COUNT(*) AS count 
        FROM user_gameaccounts 
        WHERE user_id = @userId AND gameaccount_jid = @gameaccountJid
      `);

    if (ownerCheckResult.recordset[0].count === 0) {
      return res.status(403).json({ error: 'You can only modify your own game account' });
    }

    const accountDb = await getAccountDb();
    const userRes = await accountDb
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM TB_User WHERE JID = @id');

    const account = userRes.recordset[0];
    if (!account) return res.status(404).json({ error: 'Game account not found' });

    const hashedCurrent = crypto.createHash('md5').update(currentPassword).digest('hex');
    if (hashedCurrent !== account.password)
      return res.status(403).json({ error: 'Invalid current password' });

    const hashedNew = crypto.createHash('md5').update(newPassword).digest('hex');

    await accountDb
      .request()
      .input('id', sql.Int, id)
      .input('pw', sql.NVarChar(32), hashedNew)
      .query('UPDATE TB_User SET password = @pw WHERE JID = @id');

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update GameAccount Password Error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Request Game Account Deletion (sends verification email)
router.post('/:id/request-deletion', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await gamePoolConnect;
    await charPoolConnect;

    // Verify that this game account belongs to the authenticated user
    const webDb = await getWebDb();
    const ownerCheckResult = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .input('gameaccountJid', sql.Int, id).query(`
        SELECT COUNT(*) AS count 
        FROM user_gameaccounts 
        WHERE user_id = @userId AND gameaccount_jid = @gameaccountJid
      `);

    if (ownerCheckResult.recordset[0].count === 0) {
      return res.status(403).json({ error: 'You can only delete your own game account' });
    }

    // Check if game account exists
    const accountDb = await getAccountDb();
    const accountCheck = await accountDb
      .request()
      .input('jid', sql.Int, id)
      .query('SELECT JID, StrUserID FROM TB_User WHERE JID = @jid');

    if (accountCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Game account not found' });
    }

    const gameAccount = accountCheck.recordset[0];

    // Get user's email
    const userResult = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .query('SELECT email FROM users WHERE id = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userEmail = userResult.recordset[0].email;

    // Generate deletion token
    const emailUtils = require('../utils/email');
    const deletionToken = emailUtils.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store deletion token in database
    await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .input('gameaccountJid', sql.Int, id)
      .input('token', sql.NVarChar(255), deletionToken)
      .input('email', sql.NVarChar(255), userEmail)
      .input('gameaccountName', sql.NVarChar(50), gameAccount.StrUserID)
      .input('expiresAt', sql.DateTime2, expiresAt).query(`
        INSERT INTO account_deletion_tokens (user_id, gameaccount_jid, token, email, gameaccount_name, expires_at)
        VALUES (@userId, @gameaccountJid, @token, @email, @gameaccountName, @expiresAt)
      `);

    // Send deletion confirmation email
    try {
      await emailUtils.sendAccountDeletionEmail(userEmail, deletionToken, gameAccount.StrUserID);

      res.json({
        message: 'Deletion confirmation email sent',
        email: userEmail,
        gameAccount: gameAccount.StrUserID,
        expiresIn: '1 hour',
      });
    } catch (emailError) {
      console.error('Error sending deletion email:', emailError);

      // Clean up the token since email failed
      await webDb
        .request()
        .input('token', sql.NVarChar(255), deletionToken)
        .query('DELETE FROM account_deletion_tokens WHERE token = @token');

      res.status(500).json({
        error: 'Failed to send confirmation email',
        details: 'Please try again later or contact support',
      });
    }
  } catch (err) {
    console.error('Error requesting game account deletion:', err);
    res.status(500).json({
      error: 'Failed to process deletion request',
      details: err.message,
    });
  }
});

// Confirm Game Account Deletion via email token
router.delete('/confirm-deletion/:token', async (req, res) => {
  const { token } = req.params;

  try {
    await gamePoolConnect;
    await charPoolConnect;

    const webDb = await getWebDb();

    // Verify token and get deletion details
    const tokenResult = await webDb.request().input('token', sql.NVarChar(255), token).query(`
        SELECT user_id, gameaccount_jid, email, gameaccount_name, expires_at, used_at
        FROM account_deletion_tokens 
        WHERE token = @token
      `);

    if (tokenResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired deletion token' });
    }

    const tokenData = tokenResult.recordset[0];

    // Check if token is expired
    if (new Date() > new Date(tokenData.expires_at)) {
      return res.status(400).json({ error: 'Deletion token has expired' });
    }

    // Check if token has already been used
    if (tokenData.used_at) {
      return res.status(400).json({ error: 'Deletion token has already been used' });
    }

    const gameaccountJid = tokenData.gameaccount_jid;
    const gameaccountName = tokenData.gameaccount_name;

    // Begin transaction for safe deletion
    const accountDb = await getAccountDb();
    const transaction = new sql.Transaction(accountDb);

    try {
      await transaction.begin();

      // Mark token as used
      await webDb
        .request()
        .input('token', sql.NVarChar(255), token)
        .query('UPDATE account_deletion_tokens SET used_at = GETDATE() WHERE token = @token');

      // Remove from user_gameaccounts table
      await webDb
        .request()
        .input('gameaccountJid', sql.Int, gameaccountJid)
        .query('DELETE FROM user_gameaccounts WHERE gameaccount_jid = @gameaccountJid');

      // Delete from character database (all characters for this account)
      await charPool
        .request()
        .input('jid', sql.Int, gameaccountJid)
        .query('DELETE FROM dbo._User WHERE UserJID = @jid');

      // Delete silk records
      await transaction
        .request()
        .input('jid', sql.Int, gameaccountJid)
        .query('DELETE FROM SK_SILK WHERE JID = @jid');

      // Delete game account
      await transaction
        .request()
        .input('jid', sql.Int, gameaccountJid)
        .query('DELETE FROM TB_User WHERE JID = @jid');

      await transaction.commit();

      res.json({
        message: 'Game account deleted successfully',
        deletedAccount: gameaccountName,
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (err) {
    console.error('Error confirming game account deletion:', err);
    res.status(500).json({
      error: 'Failed to delete game account',
      details: err.message,
    });
  }
});

// Delete Game Account
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await gamePoolConnect;
    await charPoolConnect;

    // Verify that this game account belongs to the authenticated user
    const webDb = await getWebDb();
    const ownerCheckResult = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .input('gameaccountJid', sql.Int, id).query(`
        SELECT COUNT(*) AS count 
        FROM user_gameaccounts 
        WHERE user_id = @userId AND gameaccount_jid = @gameaccountJid
      `);

    if (ownerCheckResult.recordset[0].count === 0) {
      return res.status(403).json({ error: 'You can only delete your own game account' });
    }

    // Check if game account exists
    const accountDb = await getAccountDb();
    const accountCheck = await accountDb
      .request()
      .input('jid', sql.Int, id)
      .query('SELECT JID, StrUserID FROM TB_User WHERE JID = @jid');

    if (accountCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Game account not found' });
    }

    const gameAccount = accountCheck.recordset[0];

    // Begin transaction for safe deletion
    const transaction = new sql.Transaction(accountDb);

    try {
      await transaction.begin();

      // Remove from user_gameaccounts table
      await webDb
        .request()
        .input('userId', sql.BigInt, req.user.id)
        .input('gameaccountJid', sql.Int, id)
        .query(
          'DELETE FROM user_gameaccounts WHERE user_id = @userId AND gameaccount_jid = @gameaccountJid'
        );

      // Delete from character database (all characters for this account)
      await charPool
        .request()
        .input('jid', sql.Int, id)
        .query('DELETE FROM dbo._User WHERE UserJID = @jid');

      // Delete silk records
      await transaction
        .request()
        .input('jid', sql.Int, id)
        .query('DELETE FROM SK_SILK WHERE JID = @jid');

      // Delete game account
      await transaction
        .request()
        .input('jid', sql.Int, id)
        .query('DELETE FROM TB_User WHERE JID = @jid');

      await transaction.commit();

      res.json({
        message: 'Game account deleted successfully',
        deletedAccount: gameAccount.StrUserID,
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (err) {
    console.error('Delete GameAccount Error:', err);
    res.status(500).json({
      error: 'Failed to delete game account',
      details: err.message,
    });
  }
});

// Get Game Account Details
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await gamePoolConnect;
    await charPoolConnect;

    // Verify that this game account belongs to the authenticated user
    const webDb = await getWebDb();
    const ownerCheckResult = await webDb
      .request()
      .input('userId', sql.BigInt, req.user.id)
      .input('gameaccountJid', sql.Int, id).query(`
        SELECT COUNT(*) AS count 
        FROM user_gameaccounts 
        WHERE user_id = @userId AND gameaccount_jid = @gameaccountJid
      `);

    if (ownerCheckResult.recordset[0].count === 0) {
      return res.status(403).json({ error: 'You can only access your own game account' });
    }

    // Get Game Account Details
    const accountDb = await getAccountDb();
    const accountResult = await accountDb.request().input('jid', sql.Int, id).query(`
      SELECT JID, PortalJID, StrUserID, ServiceCompany, Active, UserIP, CountryCode, VisitDate, RegDate, AccPlayTime
      FROM TB_User
      WHERE JID = @jid
    `);

    if (accountResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Game account not found' });
    }

    const account = accountResult.recordset[0];

    // Get characters for this account
    const charactersResult = await charPool.request().input('jid', sql.Int, id).query(`
      SELECT CharID, CharName16, Race, Level, CurHP, CurMP
      FROM dbo._User 
      WHERE UserJID = @jid
    `);

    // Get Silk information
    const silkResult = await accountDb.request().input('jid', sql.Int, id).query(`
      SELECT JID, silk_own, silk_gift, silk_point 
      FROM SK_SILK 
      WHERE JID = @jid
    `);

    const silkData = silkResult.recordset[0] || { silk_own: 0, silk_gift: 0, silk_point: 0 };

    const gameAccount = {
      ...account,
      characters: charactersResult.recordset,
      silk_own: silkData.silk_own || 0,
      silk_gift: silkData.silk_gift || 0,
      silk_point: silkData.silk_point || 0,
      total_silk: (silkData.silk_own || 0) + (silkData.silk_gift || 0) + (silkData.silk_point || 0),
    };

    res.json(gameAccount);
  } catch (err) {
    console.error('Error fetching game account details:', err);
    res.status(500).json({ error: 'Failed to load game account details' });
  }
});

module.exports = router;
