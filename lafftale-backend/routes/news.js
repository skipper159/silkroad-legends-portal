// routes/news.js
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { pool, poolConnect, sql } = require('../db');

// Get all published news/posts
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit).query(`
        SELECT id, title, slug, excerpt, created_at, updated_at
        FROM news 
        WHERE published = 1
        ORDER BY created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool
      .request()
      .query('SELECT COUNT(*) as total FROM news WHERE published = 1');

    res.json({
      news: result.recordset,
      pagination: {
        page,
        limit,
        total: countResult.recordset[0].total,
        pages: Math.ceil(countResult.recordset[0].total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get single news post by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('slug', sql.NVarChar, slug)
      .query('SELECT * FROM news WHERE slug = @slug AND published = 1');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'News post not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching news post:', err);
    res.status(500).json({ error: 'Failed to fetch news post' });
  }
});

// Admin routes - require authentication
router.use(adminAuth);

// Get all news (including unpublished) for admin
router.get('/admin/all', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit).query(`
        SELECT id, title, slug, excerpt, published, created_at, updated_at
        FROM news 
        ORDER BY created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM news');

    res.json({
      news: result.recordset,
      pagination: {
        page,
        limit,
        total: countResult.recordset[0].total,
        pages: Math.ceil(countResult.recordset[0].total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching admin news:', err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Create new news post
router.post('/', async (req, res) => {
  const { title, slug, content, excerpt, published } = req.body;

  if (!title || !slug || !content) {
    return res.status(400).json({ error: 'Title, slug, and content are required' });
  }

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('slug', sql.NVarChar, slug)
      .input('content', sql.Text, content)
      .input('excerpt', sql.NVarChar, excerpt || '')
      .input('published', sql.Bit, published || false)
      .input('createdAt', sql.DateTime, new Date())
      .input('updatedAt', sql.DateTime, new Date()).query(`
        INSERT INTO news (title, slug, content, excerpt, published, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@title, @slug, @content, @excerpt, @published, @createdAt, @updatedAt)
      `);

    res.status(201).json({
      message: 'News post created successfully',
      id: result.recordset[0].id,
    });
  } catch (err) {
    console.error('Error creating news post:', err);
    if (err.number === 2627) {
      // Unique constraint violation
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create news post' });
  }
});

// Update news post
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, slug, content, excerpt, published } = req.body;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('slug', sql.NVarChar, slug)
      .input('content', sql.Text, content)
      .input('excerpt', sql.NVarChar, excerpt || '')
      .input('published', sql.Bit, published || false)
      .input('updatedAt', sql.DateTime, new Date()).query(`
        UPDATE news 
        SET title = @title, slug = @slug, content = @content, 
            excerpt = @excerpt, published = @published, updated_at = @updatedAt
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'News post not found' });
    }

    res.json({ message: 'News post updated successfully' });
  } catch (err) {
    console.error('Error updating news post:', err);
    if (err.number === 2627) {
      // Unique constraint violation
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to update news post' });
  }
});

// Delete news post
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  await poolConnect;
  try {
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM news WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'News post not found' });
    }

    res.json({ message: 'News post deleted successfully' });
  } catch (err) {
    console.error('Error deleting news post:', err);
    res.status(500).json({ error: 'Failed to delete news post' });
  }
});

module.exports = router;
