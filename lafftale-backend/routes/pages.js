const express = require('express');
const router = express.Router();
const { getVPlusDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const pool = await getVPlusDb();
    const result = await pool
      .request()
      .query(
        'SELECT id, title, slug, excerpt, updated_at FROM pages WHERE active = 1 ORDER BY created_at DESC'
      );

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('slug', sql.VarChar, slug)
      .query('SELECT * FROM pages WHERE slug = @slug AND active = 1');

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, slug, content, excerpt, active = true } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const pool = await getWebDb();

    // Check if slug already exists
    const existingPage = await pool
      .request()
      .input('slug', sql.VarChar, slug)
      .query('SELECT id FROM pages WHERE slug = @slug');

    if (existingPage.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    const result = await pool
      .request()
      .input('title', sql.VarChar, title)
      .input('slug', sql.VarChar, slug)
      .input('content', sql.Text, content)
      .input('excerpt', sql.VarChar, excerpt)
      .input('active', sql.Bit, active).query(`
        INSERT INTO pages (title, slug, content, excerpt, active, created_at, updated_at)
        VALUES (@title, @slug, @content, @excerpt, @active, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() as id;
      `);

    res.status(201).json({
      success: true,
      data: { id: result.recordset[0].id, title, slug },
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, excerpt, active } = req.body;

    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.VarChar, title)
      .input('slug', sql.VarChar, slug)
      .input('content', sql.Text, content)
      .input('excerpt', sql.VarChar, excerpt)
      .input('active', sql.Bit, active).query(`
        UPDATE pages 
        SET title = @title, slug = @slug, content = @content, 
            excerpt = @excerpt, active = @active, updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, message: 'Page updated successfully' });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM pages WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
