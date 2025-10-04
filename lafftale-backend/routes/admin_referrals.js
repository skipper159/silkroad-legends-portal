const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/auth');

// Get all referrals for admin (erweitert um Anti-Cheat Informationen)
router.get('/', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { search, timeframe = '30', includeAnticheat = 'false' } = req.query;
    const pool = await getWebDb();

    let query = `
      SELECT 
        r.id,
        r.code,
        r.jid,
        r.invited_jid,
        r.points,
        r.redeemed,
        r.reward_silk,
        r.created_at,
        r.updated_at,
        u1.username as referrer_username,
        u1.email as referrer_email,
        u2.username as referred_username,
        u2.email as referred_email`;

    // Anti-Cheat Felder nur bei Bedarf laden für Performance
    if (includeAnticheat === 'true') {
      query += `,
        r.ip_address,
        r.fingerprint,
        r.is_valid,
        r.cheat_reason`;
    }

    query += `
      FROM referrals r
      LEFT JOIN users u1 ON r.jid = u1.jid
      LEFT JOIN users u2 ON r.invited_jid = u2.jid
      WHERE 1=1
    `;

    const request = pool.request();

    if (search) {
      query += ` AND (r.code LIKE @search OR CAST(r.jid AS NVARCHAR) LIKE @search OR u1.username LIKE @search OR u2.username LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    if (timeframe) {
      query += ` AND r.created_at >= DATEADD(day, -@timeframe, GETDATE())`;
      request.input('timeframe', sql.Int, parseInt(timeframe));
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error('Error fetching admin referrals:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Get referral statistics
router.get('/statistics', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const statsQuery = `
      SELECT 
        COUNT(*) as totalReferrals,
        SUM(CASE WHEN redeemed = 0 THEN 1 ELSE 0 END) as pendingReferrals,
        SUM(CASE WHEN redeemed = 1 THEN 1 ELSE 0 END) as redeemedReferrals,
        SUM(points) as totalPointsAwarded,
        SUM(reward_silk) as totalSilkAwarded
      FROM referrals
      WHERE invited_jid IS NOT NULL
    `;

    const result = await pool.request().query(statsQuery);

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    console.error('Error fetching referral statistics:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Get all referral rewards
router.get('/rewards', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const result = await pool.request().query(`
      SELECT id, title, description, points_required, reward_type, reward_value, silk_reward, item_id, is_active, created_at, updated_at
      FROM referral_rewards
      ORDER BY points_required ASC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error('Error fetching referral rewards:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Create new referral reward
router.post('/rewards', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      points_required,
      reward_type = 'silk',
      reward_value,
      silk_reward = 0,
      item_id,
      is_active = true,
    } = req.body;

    if (!title || !description || !points_required || !reward_type || !reward_value) {
      return res.status(400).json({
        success: false,
        error:
          'Missing required fields: title, description, points_required, reward_type, reward_value',
      });
    }

    const pool = await getWebDb();

    await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('points_required', sql.Int, points_required)
      .input('reward_type', sql.NVarChar, reward_type)
      .input('reward_value', sql.NVarChar, reward_value)
      .input('silk_reward', sql.Int, silk_reward)
      .input('item_id', sql.Int, item_id || null)
      .input('is_active', sql.Bit, is_active)
      .input('created_at', sql.DateTime, new Date())
      .input('updated_at', sql.DateTime, new Date()).query(`
        INSERT INTO referral_rewards (title, description, points_required, reward_type, reward_value, silk_reward, item_id, is_active, created_at, updated_at)
        VALUES (@title, @description, @points_required, @reward_type, @reward_value, @silk_reward, @item_id, @is_active, @created_at, @updated_at)
      `);

    res.status(201).json({
      success: true,
      message: 'Referral reward created successfully',
    });
  } catch (err) {
    console.error('Error creating referral reward:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Update referral status
router.put('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be pending, approved, or rejected',
      });
    }

    const pool = await getWebDb();

    // Check if referral exists
    const checkResult = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM referrals WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Referral not found',
      });
    }

    // Update referral status
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('status', sql.NVarChar, status)
      .input('updated_at', sql.DateTime, new Date())
      .query('UPDATE referrals SET status = @status, updated_at = @updated_at WHERE id = @id');

    res.json({
      success: true,
      message: `Referral status updated to ${status}`,
    });
  } catch (err) {
    console.error('Error updating referral status:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Delete referral
router.delete('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    // Check if referral exists
    const checkResult = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM referrals WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Referral not found',
      });
    }

    // Delete referral
    await pool.request().input('id', sql.Int, id).query('DELETE FROM referrals WHERE id = @id');

    res.json({
      success: true,
      message: 'Referral deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting referral:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// GET /settings - Get referral settings (Admin only)
router.get('/settings', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const result = await pool.request().query(`
      SELECT setting_key, setting_value, description
      FROM referral_settings
      ORDER BY setting_key
    `);

    // Transform to object format for frontend
    const settings = {};
    result.recordset.forEach((row) => {
      settings[row.setting_key] = {
        value: row.setting_value,
        description: row.description,
      };
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error('Error fetching referral settings:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// PUT /settings - Update referral settings (Admin only)
router.put('/settings', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const updates = req.body;

    const validSettings = [
      'points_per_referral',
      'minimum_redeem_points',
      'silk_per_point',
      'referral_enabled',
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (!validSettings.includes(key)) {
        return res.status(400).json({
          success: false,
          error: `Invalid setting name: ${key}`,
        });
      }

      await pool
        .request()
        .input('key', sql.NVarChar, key)
        .input('value', sql.NVarChar, String(value))
        .input('updated_at', sql.DateTime, new Date()).query(`
          UPDATE referral_settings 
          SET setting_value = @value, updated_at = @updated_at 
          WHERE setting_key = @key
        `);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (err) {
    console.error('Error updating referral settings:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// DELETE /rewards/:id - Delete a reward (Admin only)
router.delete('/rewards/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    // Check if reward exists
    const checkResult = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM referral_rewards WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reward not found',
      });
    }

    // Delete reward
    await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM referral_rewards WHERE id = @id');

    res.json({
      success: true,
      message: 'Reward deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting reward:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// PUT /rewards/:id - Update a reward (Admin only)
router.put('/rewards/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { points_required, silk_reward, item_id, description, is_active } = req.body;
    const pool = await getWebDb();

    // Check if reward exists
    const checkResult = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT id FROM referral_rewards WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reward not found',
      });
    }

    // Update reward
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('points_required', sql.Int, points_required)
      .input('silk_reward', sql.Int, silk_reward)
      .input('item_id', sql.Int, item_id || null)
      .input('description', sql.NVarChar, description)
      .input('is_active', sql.Bit, is_active)
      .input('updated_at', sql.DateTime, new Date()).query(`
        UPDATE referral_rewards 
        SET points_required = @points_required,
            silk_reward = @silk_reward,
            item_id = @item_id,
            description = @description,
            is_active = @is_active,
            updated_at = @updated_at
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: 'Reward updated successfully',
    });
  } catch (err) {
    console.error('Error updating reward:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// GET /anticheat/suspicious - Get suspicious referral activities
router.get('/anticheat/suspicious', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const result = await pool.request().query(`
      SELECT 
        id,
        code,
        jid as referrer_jid,
        invited_jid,
        points,
        redeemed,
        ip_address,
        fingerprint,
        is_valid,
        cheat_reason,
        created_at,
        (SELECT COUNT(*) FROM referrals r2 WHERE r2.ip_address = referrals.ip_address AND r2.jid = referrals.jid) as same_ip_count,
        (SELECT COUNT(*) FROM referrals r3 WHERE r3.fingerprint = referrals.fingerprint AND r3.jid = referrals.jid) as same_fingerprint_count
      FROM referrals
      WHERE is_valid = 0 OR cheat_reason IS NOT NULL
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

// GET /anticheat/stats - Get anti-cheat statistics
router.get('/anticheat/stats', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    // Gesamtstatistiken
    const totalStatsResult = await pool.request().query(`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN is_valid = 1 THEN 1 END) as valid_referrals,
        COUNT(CASE WHEN is_valid = 0 THEN 1 END) as blocked_referrals,
        ROUND(
          CAST(COUNT(CASE WHEN is_valid = 0 THEN 1 END) AS FLOAT) / 
          CAST(COUNT(*) AS FLOAT) * 100, 2
        ) as block_rate_percent
      FROM referrals
      WHERE created_at >= DATEADD(day, -30, GETDATE())
    `);

    // Top verdächtige IPs
    const suspiciousIpsResult = await pool.request().query(`
      SELECT TOP 10
        ip_address,
        COUNT(*) as referral_count,
        COUNT(CASE WHEN is_valid = 0 THEN 1 END) as blocked_count,
        COUNT(DISTINCT jid) as unique_referrers
      FROM referrals
      WHERE ip_address IS NOT NULL AND created_at >= DATEADD(day, -30, GETDATE())
      GROUP BY ip_address
      HAVING COUNT(*) > 2
      ORDER BY blocked_count DESC, referral_count DESC
    `);

    // Häufigste Cheat-Gründe
    const cheatReasonsResult = await pool.request().query(`
      SELECT 
        cheat_reason,
        COUNT(*) as count
      FROM referrals
      WHERE cheat_reason IS NOT NULL AND created_at >= DATEADD(day, -30, GETDATE())
      GROUP BY cheat_reason
      ORDER BY count DESC
    `);

    // Tägliche Trends
    const dailyTrendsResult = await pool.request().query(`
      SELECT TOP 7
        CAST(created_at AS DATE) as date,
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN is_valid = 1 THEN 1 END) as valid_referrals,
        COUNT(CASE WHEN is_valid = 0 THEN 1 END) as blocked_referrals
      FROM referrals
      WHERE created_at >= DATEADD(day, -7, GETDATE())
      GROUP BY CAST(created_at AS DATE)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      data: {
        total_stats: totalStatsResult.recordset[0],
        suspicious_ips: suspiciousIpsResult.recordset,
        cheat_reasons: cheatReasonsResult.recordset,
        daily_trends: dailyTrendsResult.recordset,
      },
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

// POST /anticheat/validate/:id - Manually validate suspicious referral
router.post('/anticheat/validate/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_valid, admin_notes } = req.body;
    const pool = await getWebDb();

    // Check if referral exists
    const checkResult = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT id, points FROM referrals WHERE id = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Referral not found',
      });
    }

    const referral = checkResult.recordset[0];

    // Update validation status
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('is_valid', sql.Bit, is_valid)
      .input('points', sql.Int, is_valid ? referral.points : 0) // Punkte zurücksetzen bei ungültig
      .input('cheat_reason', sql.NVarChar, is_valid ? null : admin_notes || 'ADMIN_REVIEW')
      .input('updated_at', sql.DateTime, new Date()).query(`
        UPDATE referrals 
        SET is_valid = @is_valid,
            points = @points,
            cheat_reason = @cheat_reason,
            updated_at = @updated_at
        WHERE id = @id
      `);

    res.json({
      success: true,
      message: `Referral ${is_valid ? 'validated' : 'marked as invalid'} successfully`,
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
    });
  }
});

// Get anti-cheat statistics
router.get('/anticheat/stats', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    // Basis Statistiken
    const basicStatsQuery = `
      SELECT 
        COUNT(*) as totalReferrals,
        COUNT(CASE WHEN is_valid = 1 THEN 1 END) as validReferrals,
        COUNT(CASE WHEN is_valid = 0 THEN 1 END) as suspiciousReferrals,
        COUNT(DISTINCT ip_address) as uniqueIPs,
        COUNT(DISTINCT fingerprint) as uniqueFingerprints
      FROM referrals
      WHERE created_at >= DATEADD(day, -30, GETDATE())
    `;

    const basicResult = await pool.request().query(basicStatsQuery);
    const basicStats = basicResult.recordset[0];

    // Berechne Block Rate
    const blockRate =
      basicStats.totalReferrals > 0
        ? ((basicStats.suspiciousReferrals / basicStats.totalReferrals) * 100).toFixed(2)
        : 0;

    // Top Cheat Reasons
    const reasonsQuery = `
      SELECT TOP 5
        cheat_reason as reason,
        COUNT(*) as count
      FROM referrals
      WHERE cheat_reason IS NOT NULL
        AND created_at >= DATEADD(day, -30, GETDATE())
      GROUP BY cheat_reason
      ORDER BY COUNT(*) DESC
    `;

    const reasonsResult = await pool.request().query(reasonsQuery);

    // Tägliche Trends (letzte 7 Tage)
    const trendsQuery = `
      SELECT 
        CAST(created_at AS DATE) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN is_valid = 1 THEN 1 END) as valid,
        COUNT(CASE WHEN is_valid = 0 THEN 1 END) as blocked
      FROM referrals
      WHERE created_at >= DATEADD(day, -7, GETDATE())
      GROUP BY CAST(created_at AS DATE)
      ORDER BY date DESC
    `;

    const trendsResult = await pool.request().query(trendsQuery);

    res.json({
      success: true,
      data: {
        totalReferrals: basicStats.totalReferrals,
        validReferrals: basicStats.validReferrals,
        suspiciousReferrals: basicStats.suspiciousReferrals,
        blockRate: parseFloat(blockRate),
        uniqueIPs: basicStats.uniqueIPs,
        uniqueFingerprints: basicStats.uniqueFingerprints,
        topCheatReasons: reasonsResult.recordset,
        dailyTrends: trendsResult.recordset,
      },
    });
  } catch (err) {
    console.error('Error fetching anti-cheat statistics:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Get suspicious referrals for review
router.get('/anticheat/suspicious', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const { limit = 50, reason } = req.query;

    let query = `
      SELECT TOP (@limit)
        r.id,
        r.code,
        u_referrer.username as referrer_username,
        u_invited.username as invited_username,
        r.ip_address,
        r.fingerprint,
        r.cheat_reason,
        r.is_valid,
        r.points,
        r.created_at,
        -- Zusätzliche Analysedaten
        (SELECT COUNT(*) FROM referrals r2 WHERE r2.ip_address = r.ip_address AND r2.id != r.id) as same_ip_count,
        (SELECT COUNT(*) FROM referrals r3 WHERE r3.fingerprint = r.fingerprint AND r3.id != r.id) as same_fingerprint_count
      FROM referrals r
      LEFT JOIN users u_referrer ON r.jid = u_referrer.jid
      LEFT JOIN users u_invited ON r.invited_jid = u_invited.jid
      WHERE (r.is_valid = 0 OR r.cheat_reason IS NOT NULL)
    `;

    const request = pool.request();
    request.input('limit', sql.Int, parseInt(limit));

    if (reason) {
      query += ` AND r.cheat_reason = @reason`;
      request.input('reason', sql.NVarChar, reason);
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error('Error fetching suspicious referrals:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Get IP-based referral statistics
router.get('/anticheat/ip-stats', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const { min_referrals = 2 } = req.query;

    const query = `
      SELECT 
        ip_address,
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN is_valid = 1 THEN 1 END) as valid_referrals,
        COUNT(CASE WHEN is_valid = 0 THEN 1 END) as suspicious_referrals,
        COUNT(DISTINCT jid) as unique_referrers,
        COUNT(DISTINCT invited_jid) as unique_invited,
        MIN(created_at) as first_seen,
        MAX(created_at) as last_seen,
        -- Cheat Reasons (SQL Server kompatibel)
        STUFF((
          SELECT DISTINCT ', ' + cheat_reason 
          FROM referrals r2 
          WHERE r2.ip_address = r.ip_address 
          AND cheat_reason IS NOT NULL
          FOR XML PATH('')
        ), 1, 2, '') as cheat_reasons
      FROM referrals r
      WHERE ip_address IS NOT NULL
      GROUP BY ip_address
      HAVING COUNT(*) >= @min_referrals
      ORDER BY COUNT(*) DESC
    `;

    const request = pool.request();
    request.input('min_referrals', sql.Int, parseInt(min_referrals));

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error('Error fetching IP statistics:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Get referral settings
router.get('/settings', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const query = `
      SELECT setting_key, setting_value, description, updated_at
      FROM referral_settings
      ORDER BY setting_key
    `;

    const result = await pool.request().query(query);

    // Konvertiere zu key-value Objekt für einfachere Frontend-Nutzung
    const settings = {};
    const settingsArray = result.recordset;

    settingsArray.forEach((setting) => {
      settings[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        updated_at: setting.updated_at,
      };
    });

    res.json({
      success: true,
      data: {
        settings: settings,
        raw: settingsArray,
      },
    });
  } catch (err) {
    console.error('Error fetching referral settings:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

// Update referral settings
router.put('/settings', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid settings object',
      });
    }

    const updatedSettings = [];

    // Update jede Setting einzeln
    for (const [key, value] of Object.entries(settings)) {
      try {
        const updateQuery = `
          UPDATE referral_settings 
          SET setting_value = @value, updated_at = @updated_at
          WHERE setting_key = @key
        `;

        await pool
          .request()
          .input('key', sql.NVarChar, key)
          .input('value', sql.NVarChar, String(value))
          .input('updated_at', sql.DateTime, new Date())
          .query(updateQuery);

        updatedSettings.push({ key, value });
      } catch (settingError) {
        console.error(`Error updating setting ${key}:`, settingError);
      }
    }

    res.json({
      success: true,
      message: `${updatedSettings.length} settings updated successfully`,
      updated: updatedSettings,
    });
  } catch (err) {
    console.error('Error updating referral settings:', err);
    res.status(500).json({
      success: false,
      error: 'Database error',
      details: err.message,
    });
  }
});

module.exports = router;
