const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/auth');

// Get all pages for admin
router.get('/pages', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { search, status } = req.query;
    const pool = await getWebDb();

    let query = `
      SELECT p.id, p.title, p.slug, p.content, p.meta_description, 
             p.is_published, p.is_featured, p.created_at, p.updated_at,
             u.username as author_name
      FROM pages p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (p.title LIKE @search OR p.content LIKE @search OR p.slug LIKE @search)`;
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    if (status === 'published') {
      query += ` AND p.is_published = 1`;
    } else if (status === 'draft') {
      query += ` AND p.is_published = 0`;
    }

    query += ` ORDER BY p.updated_at DESC`;

    const request = pool.request();
    params.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Create new page
router.post('/pages', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { title, slug, content, meta_description, is_published, is_featured } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const pool = await getWebDb();

    // Generate slug if not provided
    const pageSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existing = await pool
      .request()
      .input('slug', sql.NVarChar, pageSlug)
      .query('SELECT id FROM pages WHERE slug = @slug');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const result = await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('slug', sql.NVarChar, pageSlug)
      .input('content', sql.NText, content)
      .input('meta_description', sql.NVarChar, meta_description || '')
      .input('is_published', sql.Bit, is_published || false)
      .input('is_featured', sql.Bit, is_featured || false)
      .input('author_id', sql.BigInt, req.user.id).query(`
        INSERT INTO pages (title, slug, content, meta_description, is_published, is_featured, author_id, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@title, @slug, @content, @meta_description, @is_published, @is_featured, @author_id, GETDATE(), GETDATE())
      `);

    res.json({
      message: 'Page created successfully',
      id: result.recordset[0].id,
      slug: pageSlug,
    });
  } catch (err) {
    console.error('Error creating page:', err);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

// Update page
router.put('/pages/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, meta_description, is_published, is_featured } = req.body;

    const pool = await getWebDb();

    // Check if slug already exists (excluding current page)
    if (slug) {
      const existing = await pool
        .request()
        .input('slug', sql.NVarChar, slug)
        .input('id', sql.Int, id)
        .query('SELECT id FROM pages WHERE slug = @slug AND id != @id');

      if (existing.recordset.length > 0) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('slug', sql.NVarChar, slug)
      .input('content', sql.NText, content)
      .input('meta_description', sql.NVarChar, meta_description || '')
      .input('is_published', sql.Bit, is_published !== undefined ? is_published : false)
      .input('is_featured', sql.Bit, is_featured !== undefined ? is_featured : false).query(`
        UPDATE pages 
        SET title = @title, slug = @slug, content = @content, 
            meta_description = @meta_description, is_published = @is_published, 
            is_featured = @is_featured, updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Page updated successfully' });
  } catch (err) {
    console.error('Error updating page:', err);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// Delete page
router.delete('/pages/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query('DELETE FROM pages WHERE id = @id');

    res.json({ message: 'Page deleted successfully' });
  } catch (err) {
    console.error('Error deleting page:', err);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// Get page by ID
router.get('/pages/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT p.*, u.username as author_name
        FROM pages p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching page:', err);
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

// Toggle page publication status
router.patch('/pages/:id/toggle-publish', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query(`
        UPDATE pages 
        SET is_published = CASE WHEN is_published = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Page publication status updated successfully' });
  } catch (err) {
    console.error('Error toggling page publication status:', err);
    res.status(500).json({ error: 'Failed to update page status' });
  }
});

// Toggle page featured status
router.patch('/pages/:id/toggle-featured', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query(`
        UPDATE pages 
        SET is_featured = CASE WHEN is_featured = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Page featured status updated successfully' });
  } catch (err) {
    console.error('Error toggling page featured status:', err);
    res.status(500).json({ error: 'Failed to update page featured status' });
  }
});

module.exports = router;
