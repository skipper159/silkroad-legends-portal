// routes/settings.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { pool, poolConnect, sql } = require('../db');

// Get all settings
router.get('/', async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request().query('SELECT * FROM settings ORDER BY [key]');

    // Convert to key-value object for easier frontend handling
    const settings = {};
    result.recordset.forEach((setting) => {
      settings[setting.key] = setting.value;
    });

    res.json(settings);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get specific setting
router.get('/:key', async (req, res) => {
  const { key } = req.params;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('key', sql.NVarChar, key)
      .query('SELECT * FROM settings WHERE [key] = @key');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching setting:', err);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Admin routes - require authentication
router.use(adminAuth);

// Update or create setting
router.put('/:key', async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value && value !== '') {
    return res.status(400).json({ error: 'Value is required' });
  }

  await poolConnect;
  try {
    // Check if setting exists
    const existing = await pool
      .request()
      .input('key', sql.NVarChar, key)
      .query('SELECT [key] FROM settings WHERE [key] = @key');

    if (existing.recordset.length > 0) {
      // Update existing setting
      await pool
        .request()
        .input('key', sql.NVarChar, key)
        .input('value', sql.NVarChar, value)
        .input('updatedAt', sql.DateTime2, new Date())
        .query('UPDATE settings SET value = @value, updated_at = @updatedAt WHERE [key] = @key');
    } else {
      // Create new setting
      await pool
        .request()
        .input('key', sql.NVarChar, key)
        .input('value', sql.NVarChar, value)
        .input('createdAt', sql.DateTime2, new Date())
        .input('updatedAt', sql.DateTime2, new Date())
        .query(
          'INSERT INTO settings ([key], value, created_at, updated_at) VALUES (@key, @value, @createdAt, @updatedAt)'
        );
    }

    res.json({ message: 'Setting updated successfully' });
  } catch (err) {
    console.error('Error updating setting:', err);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Delete setting
router.delete('/:key', async (req, res) => {
  const { key } = req.params;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('key', sql.NVarChar, key)
      .query('DELETE FROM settings WHERE [key] = @key');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ message: 'Setting deleted successfully' });
  } catch (err) {
    console.error('Error deleting setting:', err);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

// Get all settings (admin view with metadata)
router.get('/admin/all', async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request().query('SELECT * FROM settings ORDER BY [key]');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching all settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

module.exports = router;
