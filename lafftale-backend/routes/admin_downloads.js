const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/auth');

// Get all downloads for admin
router.get('/downloads', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { search, category } = req.query;
    const pool = await getWebDb();

    let query = `
      SELECT id, title, description, file_url, file_size, version, category, 
             download_count, is_active, created_at, updated_at 
      FROM downloads 
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (title LIKE @search OR description LIKE @search)`;
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    if (category && category !== 'all') {
      query += ` AND category = @category`;
      params.push({ name: 'category', type: sql.NVarChar, value: category });
    }

    query += ` ORDER BY created_at DESC`;

    const request = pool.request();
    params.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching admin downloads:', err);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

// Create new download
router.post('/downloads', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, file_url, file_size, version, category } = req.body;

    if (!title || !file_url || !version || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pool = await getWebDb();

    const result = await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('file_url', sql.NVarChar, file_url)
      .input('file_size', sql.BigInt, file_size || 0)
      .input('version', sql.NVarChar, version)
      .input('category', sql.NVarChar, category).query(`
        INSERT INTO downloads (title, description, file_url, file_size, version, category, download_count, is_active, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@title, @description, @file_url, @file_size, @version, @category, 0, 1, GETDATE(), GETDATE())
      `);

    res.json({
      message: 'Download created successfully',
      id: result.recordset[0].id,
    });
  } catch (err) {
    console.error('Error creating download:', err);
    res.status(500).json({ error: 'Failed to create download' });
  }
});

// Update download
router.put('/downloads/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, file_url, file_size, version, category, is_active } = req.body;

    const pool = await getWebDb();

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('file_url', sql.NVarChar, file_url)
      .input('file_size', sql.BigInt, file_size || 0)
      .input('version', sql.NVarChar, version)
      .input('category', sql.NVarChar, category)
      .input('is_active', sql.Bit, is_active !== undefined ? is_active : 1).query(`
        UPDATE downloads 
        SET title = @title, description = @description, file_url = @file_url, 
            file_size = @file_size, version = @version, category = @category, 
            is_active = @is_active, updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Download updated successfully' });
  } catch (err) {
    console.error('Error updating download:', err);
    res.status(500).json({ error: 'Failed to update download' });
  }
});

// Delete download
router.delete('/downloads/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query('DELETE FROM downloads WHERE id = @id');

    res.json({ message: 'Download deleted successfully' });
  } catch (err) {
    console.error('Error deleting download:', err);
    res.status(500).json({ error: 'Failed to delete download' });
  }
});

// Toggle download status
router.patch('/downloads/:id/toggle', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query(`
        UPDATE downloads 
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Download status updated successfully' });
  } catch (err) {
    console.error('Error toggling download status:', err);
    res.status(500).json({ error: 'Failed to update download status' });
  }
});

module.exports = router;
