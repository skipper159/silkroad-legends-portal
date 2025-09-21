const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/auth');

// Get all vote sites for admin
router.get('/votes', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const result = await pool.request().query(`
      SELECT id, name, url, reward_silk, reward_exp, vote_delay_hours, 
             is_active, created_at, updated_at,
             (SELECT COUNT(*) FROM vote_history vh WHERE vh.vote_site_id = vs.id) as total_votes
      FROM vote_sites vs
      ORDER BY name ASC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching vote sites:', err);
    res.status(500).json({ error: 'Failed to fetch vote sites' });
  }
});

// Create new vote site
router.post('/votes', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { name, url, reward_silk, reward_exp, vote_delay_hours, description } = req.body;

    if (!name || !url || !reward_silk) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pool = await getWebDb();

    const result = await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('url', sql.NVarChar, url)
      .input('reward_silk', sql.Int, reward_silk)
      .input('reward_exp', sql.Int, reward_exp || 0)
      .input('vote_delay_hours', sql.Int, vote_delay_hours || 24)
      .input('description', sql.NVarChar, description || '').query(`
        INSERT INTO vote_sites (name, url, reward_silk, reward_exp, vote_delay_hours, description, is_active, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@name, @url, @reward_silk, @reward_exp, @vote_delay_hours, @description, 1, GETDATE(), GETDATE())
      `);

    res.json({
      message: 'Vote site created successfully',
      id: result.recordset[0].id,
    });
  } catch (err) {
    console.error('Error creating vote site:', err);
    res.status(500).json({ error: 'Failed to create vote site' });
  }
});

// Update vote site
router.put('/votes/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, reward_silk, reward_exp, vote_delay_hours, description, is_active } =
      req.body;

    const pool = await getWebDb();

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('url', sql.NVarChar, url)
      .input('reward_silk', sql.Int, reward_silk)
      .input('reward_exp', sql.Int, reward_exp || 0)
      .input('vote_delay_hours', sql.Int, vote_delay_hours || 24)
      .input('description', sql.NVarChar, description || '')
      .input('is_active', sql.Bit, is_active !== undefined ? is_active : 1).query(`
        UPDATE vote_sites 
        SET name = @name, url = @url, reward_silk = @reward_silk, 
            reward_exp = @reward_exp, vote_delay_hours = @vote_delay_hours,
            description = @description, is_active = @is_active, updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Vote site updated successfully' });
  } catch (err) {
    console.error('Error updating vote site:', err);
    res.status(500).json({ error: 'Failed to update vote site' });
  }
});

// Delete vote site
router.delete('/votes/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query('DELETE FROM vote_sites WHERE id = @id');

    res.json({ message: 'Vote site deleted successfully' });
  } catch (err) {
    console.error('Error deleting vote site:', err);
    res.status(500).json({ error: 'Failed to delete vote site' });
  }
});

// Get vote history/statistics
router.get('/votes/statistics', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const pool = await getWebDb();

    const result = await pool.request().input('days', sql.Int, parseInt(timeframe)).query(`
        SELECT 
          vs.name as site_name,
          COUNT(vh.id) as vote_count,
          SUM(vs.reward_silk) as total_silk_given,
          AVG(CAST(vs.reward_silk as FLOAT)) as avg_silk_per_vote
        FROM vote_sites vs
        LEFT JOIN vote_history vh ON vs.id = vh.vote_site_id 
          AND vh.voted_at >= DATEADD(day, -@days, GETDATE())
        GROUP BY vs.id, vs.name, vs.reward_silk
        ORDER BY vote_count DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching vote statistics:', err);
    res.status(500).json({ error: 'Failed to fetch vote statistics' });
  }
});

// Get recent votes
router.get('/votes/recent', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const pool = await getWebDb();

    const result = await pool.request().input('limit', sql.Int, parseInt(limit)).query(`
        SELECT TOP(@limit)
          vh.id, vh.voted_at, vh.ip_address,
          u.username, u.email,
          vs.name as site_name, vs.reward_silk
        FROM vote_history vh
        JOIN users u ON vh.user_id = u.id
        JOIN vote_sites vs ON vh.vote_site_id = vs.id
        ORDER BY vh.voted_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching recent votes:', err);
    res.status(500).json({ error: 'Failed to fetch recent votes' });
  }
});

// Toggle vote site status
router.patch('/votes/:id/toggle', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query(`
        UPDATE vote_sites 
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Vote site status updated successfully' });
  } catch (err) {
    console.error('Error toggling vote site status:', err);
    res.status(500).json({ error: 'Failed to update vote site status' });
  }
});

// Get user vote history (for admin review)
router.get('/votes/user/:userId', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 100 } = req.query;
    const pool = await getWebDb();

    const result = await pool
      .request()
      .input('userId', sql.BigInt, userId)
      .input('limit', sql.Int, parseInt(limit)).query(`
        SELECT TOP(@limit)
          vh.id, vh.voted_at, vh.ip_address,
          vs.name as site_name, vs.reward_silk
        FROM vote_history vh
        JOIN vote_sites vs ON vh.vote_site_id = vs.id
        WHERE vh.user_id = @userId
        ORDER BY vh.voted_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching user vote history:', err);
    res.status(500).json({ error: 'Failed to fetch user vote history' });
  }
});

module.exports = router;
