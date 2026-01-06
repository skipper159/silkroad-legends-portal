const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all modals (Admin)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  await poolConnect;
  try {
    const result = await pool
      .request()
      .query('SELECT * FROM site_modals ORDER BY priority DESC, created_at DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching modals:', err);
    res.status(500).json({ error: 'Failed to fetch modals' });
  }
});

// Get active modals (Public)
router.get('/active', async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request().query(`
            SELECT * FROM site_modals 
            WHERE is_active = 1 
            AND (start_date IS NULL OR start_date <= GETDATE()) 
            AND (end_date IS NULL OR end_date >= GETDATE())
            ORDER BY priority DESC, created_at DESC
        `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching active modals:', err);
    res.status(500).json({ error: 'Failed to fetch active modals' });
  }
});

// Create new modal
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const {
    title,
    content,
    image_url,
    button_text,
    button_url,
    start_date,
    end_date,
    is_active,
    priority,
    show_once,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  await poolConnect;
  try {
    await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('imageUrl', sql.NVarChar, image_url)
      .input('buttonText', sql.NVarChar, button_text)
      .input('buttonUrl', sql.NVarChar, button_url)
      .input('startDate', sql.DateTime2, start_date || null)
      .input('endDate', sql.DateTime2, end_date || null)
      .input('isActive', sql.Bit, is_active ? 1 : 0)
      .input('priority', sql.Int, priority || 0)
      .input('showOnce', sql.Bit, show_once ? 1 : 0).query(`
                INSERT INTO site_modals (
                    title, content, image_url, button_text, button_url, 
                    start_date, end_date, is_active, priority, show_once
                ) VALUES (
                    @title, @content, @imageUrl, @buttonText, @buttonUrl,
                    @startDate, @endDate, @isActive, @priority, @showOnce
                )
            `);

    res.json({ message: 'Modal created successfully' });
  } catch (err) {
    console.error('Error creating modal:', err);
    res.status(500).json({ error: 'Failed to create modal' });
  }
});

// Update modal
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    content,
    image_url,
    button_text,
    button_url,
    start_date,
    end_date,
    is_active,
    priority,
    show_once,
  } = req.body;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('imageUrl', sql.NVarChar, image_url)
      .input('buttonText', sql.NVarChar, button_text)
      .input('buttonUrl', sql.NVarChar, button_url)
      .input('startDate', sql.DateTime2, start_date || null)
      .input('endDate', sql.DateTime2, end_date || null)
      .input('isActive', sql.Bit, is_active ? 1 : 0)
      .input('priority', sql.Int, priority || 0)
      .input('showOnce', sql.Bit, show_once ? 1 : 0).query(`
                UPDATE site_modals SET
                    title = @title,
                    content = @content,
                    image_url = @imageUrl,
                    button_text = @buttonText,
                    button_url = @buttonUrl,
                    start_date = @startDate,
                    end_date = @endDate,
                    is_active = @isActive,
                    priority = @priority,
                    show_once = @showOnce,
                    updated_at = GETDATE()
                WHERE id = @id
            `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Modal not found' });
    }

    res.json({ message: 'Modal updated successfully' });
  } catch (err) {
    console.error('Error updating modal:', err);
    res.status(500).json({ error: 'Failed to update modal' });
  }
});

// Delete modal
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM site_modals WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Modal not found' });
    }

    res.json({ message: 'Modal deleted successfully' });
  } catch (err) {
    console.error('Error deleting modal:', err);
    res.status(500).json({ error: 'Failed to delete modal' });
  }
});

module.exports = router;
