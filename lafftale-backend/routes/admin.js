// routes/admin.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  sql,
  getWebDb,
  gamePool,
  gamePoolConnect,
  logPool,
  logPoolConnect,
  charPool,
  charPoolConnect,
  accountPool,
  accountPoolConnect,
  getAccountDb,
} = require('../db');

// Test endpoint without auth
router.get('/test', (req, res) => {
  res.json({ message: 'Admin API is working', timestamp: new Date().toISOString() });
});

// Get all web accounts (no auth required for testing)
router.get('/webaccounts', async (req, res) => {
  try {
    const pool = await getWebDb();
    console.log('Connected to web database');

    const result = await pool.request().query(`
      SELECT u.id, u.username, u.email, u.created_at, u.updated_at, ur.is_admin, u.totp_enabled
      FROM users u 
      LEFT JOIN user_roles ur ON u.id = ur.user_id
    `);

    console.log('Query result:', result.recordset.length, 'records found');

    // Transform data to match frontend expectations
    const transformedData = result.recordset.map((account) => ({
      Id: account.id,
      Username: account.username,
      Email: account.email,
      RegisteredAt: account.created_at,
      LastLogin: account.updated_at,
      IsAdmin: account.is_admin || false,
      totp_enabled: account.totp_enabled || false,
    }));

    console.log('Transformed data:', transformedData);
    res.json(transformedData);
  } catch (err) {
    console.error('Error fetching web accounts:', err);
    res.status(500).json({
      error: 'Failed to fetch web accounts',
      details: err.message,
      code: err.code,
    });
  }
});

// Get all game accounts with extra data
router.get('/gameaccounts', async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    await accountPoolConnect;
    console.log('Connected to account database');

    // Build WHERE clause for search
    let whereClause = '';
    const request = accountDb.request();

    if (search) {
      whereClause = 'WHERE u.StrUserID LIKE @searchPattern';
      request.input('searchPattern', sql.NVarChar, `%${search}%`);
    }

    const userAccounts = await request.query(
      `SELECT u.JID, u.StrUserID AS Username, u.VisitDate, u.UserIP, u.AccPlayTime
       FROM TB_User u 
       ${whereClause}
       ORDER BY u.JID
       OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
    );

    // Get total count for pagination
    const countRequest = accountDb.request();
    if (search) {
      countRequest.input('searchPattern', sql.NVarChar, `%${search}%`);
    }
    const countResult = await countRequest.query(
      `SELECT COUNT(*) as total FROM TB_User u ${whereClause}`
    );
    const totalCount = countResult.recordset[0].total;

    console.log('Game accounts query result:', userAccounts.recordset.length, 'records found');

    // Get JIDs for efficient querying
    const jids = userAccounts.recordset.map((u) => u.JID);

    if (jids.length > 0) {
      // Get character data for these accounts
      // Use logic from characters.js: TB_User(JID) -> _User(UserJID) -> _Char(CharID)
      await charPoolConnect;

      const jidList = jids.join(',');

      // Get all characters for these accounts
      const charsResult = await charPool.request().query(`
        SELECT u.UserJID, c.CharID, c.CharName16, c.RefObjID, c.GuildID, c.CurLevel
        FROM _User u
        JOIN _Char c ON u.CharID = c.CharID
        WHERE u.UserJID IN (${jidList}) AND c.Deleted = 0
      `);

      // Find relevant guilds
      const guildIds = [
        ...new Set(charsResult.recordset.map((c) => c.GuildID).filter((id) => id > 0)),
      ];
      let guildsMap = {};

      if (guildIds.length > 0) {
        const guildList = guildIds.join(',');
        const guildsResult = await charPool.request().query(`
          SELECT ID, Name FROM _Guild WHERE ID IN (${guildList})
        `);

        guildsResult.recordset.forEach((g) => {
          guildsMap[g.ID] = g.Name;
        });
      }

      // Group chars by UserJID and find main char (highest level)
      const charsByJid = {};
      charsResult.recordset.forEach((c) => {
        if (!charsByJid[c.UserJID] || c.CurLevel > charsByJid[c.UserJID].CurLevel) {
          charsByJid[c.UserJID] = c;
        }
      });

      const combined = userAccounts.recordset.map((acc) => {
        const character = charsByJid[acc.JID] || {};

        return {
          GameAccountId: acc.JID,
          Username: acc.Username,
          CharName16: character.CharName16 || null,
          CharID: character.CharID || null,
          GuildID: character.GuildID || null,
          GuildName: character.GuildID ? guildsMap[character.GuildID] || null : null,
          JobType: character.RefObjID || null,
          JobName: null,
          REG_IP: acc.UserIP || null,
          RegTime: acc.VisitDate || null,
          AccPlayTime: acc.AccPlayTime || '0',
          IsBanned: false,
          TimeoutUntil: null,
        };
      });

      res.json({
        data: combined,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      });
    } else {
      // Return empty if no accounts found
      res.json({
        data: [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      });
    }
  } catch (err) {
    console.error('Error fetching game accounts:', err);
    res.status(500).json({
      error: 'Failed to fetch game accounts',
      details: err.message,
      code: err.code,
    });
  }
});

// Ban game account
router.put('/gameaccounts/:id/ban', async (req, res) => {
  const { id } = req.params;
  await gamePoolConnect;
  try {
    await gamePool
      .request()
      .input('id', sql.Int, id)
      .query(
        "INSERT INTO _BlockedUser (UserJID, GID, UserID, Reason, BlockStartTime, BlockEndTime) VALUES (@id, 0, 0, 'Banned by admin', GETDATE(), NULL)"
      );
    res.json({ message: 'Game account banned' });
  } catch (err) {
    console.error('Error banning game account:', err);
    res.status(500).json({ error: 'Failed to ban account' });
  }
});

// Timeout game account (e.g., 24h)
router.put('/gameaccounts/:id/timeout', async (req, res) => {
  const { id } = req.params;
  const timeoutDate = new Date();
  timeoutDate.setHours(timeoutDate.getHours() + 24);

  await accountPoolConnect;
  try {
    const accountDb = await getAccountDb();
    await accountDb
      .request()
      .input('id', sql.Int, id)
      .input('timeout', sql.DateTime, timeoutDate)
      .query('UPDATE TB_User SET AccPlayTime = 0 WHERE JID = @id'); // Platzhalter für Timeout-Logik

    res.json({ message: 'Game account set on timeout for 24h' });
  } catch (err) {
    console.error('Error applying timeout:', err);
    res.status(500).json({ error: 'Failed to apply timeout' });
  }
});

// Get game account logs (placeholder logic)
router.get('/gameaccounts/:id/logs', async (req, res) => {
  const { id } = req.params;
  await logPoolConnect;
  try {
    const result = await logPool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM GameAccountLogs WHERE GameAccountId = @id');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error loading logs:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// User Role Management
router.get('/users', async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
      SELECT u.id, u.username, u.email, u.created_at, u.updated_at, ur.is_admin
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;

  try {
    const pool = await getWebDb();

    // Update admin status in user_roles table
    if (typeof isAdmin === 'boolean') {
      // Check if record exists
      const existing = await pool
        .request()
        .input('userId', sql.BigInt, id)
        .query('SELECT * FROM user_roles WHERE user_id = @userId');

      if (existing.recordset.length > 0) {
        await pool
          .request()
          .input('userId', sql.BigInt, id)
          .input('isAdmin', sql.Bit, isAdmin)
          .input('now', sql.DateTime, new Date())
          .query(
            'UPDATE user_roles SET is_admin = @isAdmin, updated_at = @now WHERE user_id = @userId'
          );
      } else {
        await pool
          .request()
          .input('userId', sql.BigInt, id)
          .input('isAdmin', sql.Bit, isAdmin)
          .input('now', sql.DateTime, new Date())
          .query(
            'INSERT INTO user_roles (user_id, is_admin, created_at, updated_at) VALUES (@userId, @isAdmin, @now, @now)'
          );
      }
    }

    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Get all available roles (simplified for new structure)
router.get('/roles', async (req, res) => {
  try {
    // Return predefined roles since user_roles table only has is_admin field
    const roles = [
      { id: 1, name: 'User', description: 'Regular user' },
      { id: 2, name: 'Admin', description: 'Administrator' },
    ];
    res.json(roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Delete user (soft delete by removing from user_roles)
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getWebDb();
    // Remove from user_roles (effectively disabling the user)
    await pool
      .request()
      .input('userId', sql.BigInt, id)
      .query('DELETE FROM user_roles WHERE user_id = @userId');

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

module.exports = router;
