const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/sites', async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
      SELECT id, title as name, url, image as logo_url, 
             reward as reward_silk, timeout as cooldown_hours, active as is_active
      FROM votes 
      WHERE active = 1 
      ORDER BY title
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching vote sites:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:user_id', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const pool = await getWebDb();

    // Check if vote_logs table exists
    try {
      const result = await pool.request().input('user_id', sql.Int, user_id).query(`
          SELECT v.id as site_id, v.title as site_name,
                 CASE 
                   WHEN vl.voted_at IS NULL THEN 1
                   WHEN DATEADD(HOUR, v.timeout, vl.voted_at) < GETDATE() THEN 1
                   ELSE 0
                 END as can_vote,
                 CASE 
                   WHEN vl.voted_at IS NOT NULL AND DATEADD(HOUR, v.timeout, vl.voted_at) >= GETDATE() 
                   THEN DATEADD(HOUR, v.timeout, vl.voted_at)
                   ELSE NULL
                 END as next_vote_at,
                 COALESCE(
                   (SELECT COUNT(*) FROM vote_logs WHERE vote_id = v.id AND jid = @user_id), 
                   0
                 ) as total_votes
          FROM votes v
          LEFT JOIN (
            SELECT vote_id, jid, MAX(voted_at) as voted_at
            FROM vote_logs 
            WHERE jid = @user_id
            GROUP BY vote_id, jid
          ) vl ON v.id = vl.vote_id
          WHERE v.active = 1
          ORDER BY v.title
        `);

      res.json({ sites: result.recordset });
    } catch (dbError) {
      // If vote_logs table doesn't exist, return default status
      const defaultResult = await pool.request().query(`
        SELECT id as site_id, title as site_name,
               1 as can_vote,
               NULL as next_vote_at,
               0 as total_votes
        FROM votes WHERE active = 1
        ORDER BY title
      `);

      res.json({ sites: defaultResult.recordset });
    }
  } catch (error) {
    console.error('Error fetching user vote status:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/postback', async (req, res) => {
  try {
    const { site, user_id, ip, verification_token } = req.body;
    const pool = await getWebDb();

    // Find the vote site by name or param
    const siteResult = await pool.request().input('site', sql.VarChar, site).query(`
        SELECT id, title, reward, timeout 
        FROM votes 
        WHERE (site = @site OR param = @site) AND active = 1
      `);

    if (siteResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vote site not found',
      });
    }

    const voteSite = siteResult.recordset[0];

    // Try to log the vote (if table exists)
    try {
      await pool
        .request()
        .input('vote_id', sql.Int, voteSite.id)
        .input('jid', sql.Int, user_id)
        .input('ip_address', sql.VarChar, ip)
        .input('voted_at', sql.DateTime, new Date()).query(`
          INSERT INTO vote_logs (vote_id, jid, ip_address, voted_at)
          VALUES (@vote_id, @jid, @ip_address, @voted_at)
        `);
    } catch (logError) {
      console.warn('Vote logging failed (table might not exist):', logError.message);
    }

    res.json({
      success: true,
      reward: {
        type: 'silk',
        amount: voteSite.reward,
        site_name: voteSite.title,
      },
    });
  } catch (error) {
    console.error('Error processing vote postback:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/history/:user_id', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 20 } = req.query;
    const pool = await getWebDb();

    try {
      const result = await pool
        .request()
        .input('user_id', sql.Int, user_id)
        .input('limit', sql.Int, parseInt(limit)).query(`
          SELECT TOP(@limit) vl.id, v.title as site_name, v.reward as reward_silk,
                 vl.ip_address, vl.voted_at
          FROM vote_logs vl
          INNER JOIN votes v ON vl.vote_id = v.id
          WHERE vl.jid = @user_id
          ORDER BY vl.voted_at DESC
        `);

      res.json(result.recordset);
    } catch (dbError) {
      // If vote_logs table doesn't exist, return empty history
      res.json([]);
    }
  } catch (error) {
    console.error('Error fetching vote history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints for vote site management

router.get('/admin/sites', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
      SELECT id, title, url, site, image, ip, param, reward, timeout, 
             active, created_at, updated_at 
      FROM votes 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching votes for admin:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.post('/admin/sites', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, url, site, image, ip, param, reward, timeout, active } = req.body;
    const pool = await getWebDb();

    const result = await pool
      .request()
      .input('title', sql.VarChar, title)
      .input('url', sql.VarChar, url)
      .input('site', sql.VarChar, site || '')
      .input('image', sql.VarChar, image || '')
      .input('ip', sql.VarChar, ip || '')
      .input('param', sql.VarChar, param || '')
      .input('reward', sql.Int, reward || 0)
      .input('timeout', sql.Int, timeout || 24)
      .input('active', sql.Bit, active !== false).query(`
        INSERT INTO votes (title, url, site, image, ip, param, reward, timeout, active, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@title, @url, @site, @image, @ip, @param, @reward, @timeout, @active, GETDATE(), GETDATE())
      `);

    res.status(201).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('Error creating vote site:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.put('/admin/sites/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, site, image, ip, param, reward, timeout, active } = req.body;
    const pool = await getWebDb();

    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.VarChar, title)
      .input('url', sql.VarChar, url)
      .input('site', sql.VarChar, site || '')
      .input('image', sql.VarChar, image || '')
      .input('ip', sql.VarChar, ip || '')
      .input('param', sql.VarChar, param || '')
      .input('reward', sql.Int, reward || 0)
      .input('timeout', sql.Int, timeout || 24)
      .input('active', sql.Bit, active !== false).query(`
        UPDATE votes 
        SET title = @title, url = @url, site = @site, image = @image, 
            ip = @ip, param = @param, reward = @reward, timeout = @timeout, 
            active = @active, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Vote site not found' });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('Error updating vote site:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.delete('/admin/sites/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    const result = await pool.request().input('id', sql.Int, id).query(`
        DELETE FROM votes 
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Vote site not found' });
    }

    res.json({ success: true, message: 'Vote site deleted successfully' });
  } catch (error) {
    console.error('Error deleting vote site:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
