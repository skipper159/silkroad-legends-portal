// routes/news.js
const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all published news/posts with optional category filtering
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const category = req.query.category;

  try {
    const pool = await getWebDb();
    const request = pool.request().input('offset', sql.Int, offset).input('limit', sql.Int, limit);

    let query = `
      SELECT id, title, slug, category, image, created_at, updated_at, content, featured, views, excerpt
      FROM news 
      WHERE active = 1
    `;

    let countQuery = 'SELECT COUNT(*) as total FROM news WHERE active = 1';

    // Filter by category if provided
    if (category) {
      query += ' AND category = @category';
      countQuery += ' AND category = @category';
      request.input('category', sql.NVarChar, category);
    }

    query += `
      ORDER BY created_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const result = await request.query(query);

    // Count query needs separate request with category parameter if provided
    const countRequest = pool.request();
    if (category) {
      countRequest.input('category', sql.NVarChar, category);
    }
    const countResult = await countRequest.query(countQuery);

    res.json({
      success: true,
      data: result.recordset,
      pagination: {
        page,
        limit,
        total: countResult.recordset[0].total,
        pages: Math.ceil(countResult.recordset[0].total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: err.message,
    });
  }
});

// Get all news categories
router.get('/categories', async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
      SELECT DISTINCT category 
      FROM news 
      WHERE active = 1
      ORDER BY category
    `);

    res.json({
      success: true,
      data: result.recordset.map((item) => item.category),
    });
  } catch (err) {
    console.error('Error fetching news categories:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news categories',
      error: err.message,
    });
  }
});

// Get single news post by slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('slug', sql.NVarChar, slug)
      .query('SELECT * FROM news WHERE slug = @slug AND active = 1');

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'News post not found',
      });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    console.error('Error fetching news post:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news post',
      error: err.message,
    });
  }
});

// Admin routes - require authentication
// Get all news (including unpublished) for admin
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit).query(`
        SELECT id, title, slug, category, image, active, created_at, updated_at, featured, views, content, excerpt
        FROM news 
        ORDER BY created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM news');

    res.json({
      success: true,
      data: result.recordset,
      pagination: {
        page,
        limit,
        total: countResult.recordset[0].total,
        pages: Math.ceil(countResult.recordset[0].total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching admin news:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: err.message,
    });
  }
});

// Create new news post
router.post('/admin', verifyToken, verifyAdmin, async (req, res) => {
  const { title, slug, content, category, image, active } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({
      success: false,
      message: 'Title, content, and category are required',
    });
  }

  try {
    const pool = await getWebDb();

    // Get author_id from authenticated user
    const authorId = req.user.id;

    // Generate slug if not provided
    const finalSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const result = await pool
      .request()
      .input('authorId', sql.Int, authorId)
      .input('title', sql.NVarChar, title)
      .input('slug', sql.NVarChar, finalSlug)
      .input('content', sql.Text, content)
      .input('category', sql.NVarChar, category)
      .input('image', sql.NVarChar, image || null)
      .input('excerpt', sql.NVarChar, req.body.excerpt || null)
      .input('active', sql.Bit, active || false)
      .input('createdAt', sql.DateTime, new Date())
      .input('updatedAt', sql.DateTime, new Date())
      .input('publishedAt', sql.DateTime, active ? new Date() : new Date()).query(`
        INSERT INTO news (author_id, title, slug, content, category, image, excerpt, active, created_at, updated_at, published_at)
        OUTPUT INSERTED.id
        VALUES (@authorId, @title, @slug, @content, @category, @image, @excerpt, @active, @createdAt, @updatedAt, @publishedAt)
      `);

    res.status(201).json({
      success: true,
      message: 'News post created successfully',
      data: { id: result.recordset[0].id },
    });
  } catch (err) {
    console.error('Error creating news post:', err);
    if (err.number === 2627) {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create news post',
      error: err.message,
    });
  }
});

// Update news post
router.put('/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, slug, content, category, image, active } = req.body;

  try {
    const pool = await getWebDb();

    // Build dynamic update query
    let updateFields = [];
    const request = pool.request().input('id', sql.Int, id);

    if (title) {
      updateFields.push('title = @title');
      request.input('title', sql.NVarChar, title);
    }

    if (slug) {
      updateFields.push('slug = @slug');
      request.input('slug', sql.NVarChar, slug);
    }

    if (content) {
      updateFields.push('content = @content');
      request.input('content', sql.Text, content);
    }

    if (category) {
      updateFields.push('category = @category');
      request.input('category', sql.NVarChar, category);
    }

    if (image !== undefined) {
      updateFields.push('image = @image');
      request.input('image', sql.NVarChar, image);
    }

    if (req.body.excerpt !== undefined) {
      updateFields.push('excerpt = @excerpt');
      request.input('excerpt', sql.NVarChar, req.body.excerpt);
    }

    if (active !== undefined) {
      updateFields.push('active = @active');
      request.input('active', sql.Bit, active);
    }

    updateFields.push('updated_at = @updatedAt');
    request.input('updatedAt', sql.DateTime, new Date());

    if (updateFields.length === 1) {
      // Only updated_at was added
      return res.status(400).json({
        success: false,
        message: 'At least one field is required for update',
      });
    }

    const updateQuery = `
      UPDATE news 
      SET ${updateFields.join(', ')} 
      WHERE id = @id;
      
      SELECT @@ROWCOUNT as count;
    `;

    const result = await request.query(updateQuery);

    if (result.recordset[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: 'News post not found',
      });
    }

    res.json({
      success: true,
      message: 'News post updated successfully',
    });
  } catch (err) {
    console.error('Error updating news post:', err);
    if (err.number === 2627) {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update news post',
      error: err.message,
    });
  }
});

// Delete news post
router.delete('/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getWebDb();

    const result = await pool.request().input('id', sql.Int, id).query(`
        DELETE FROM news 
        WHERE id = @id;
        
        SELECT @@ROWCOUNT as count;
      `);

    if (result.recordset[0].count === 0) {
      return res.status(404).json({
        success: false,
        message: 'News post not found',
      });
    }

    res.json({
      success: true,
      message: 'News post deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting news post:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete news post',
      error: err.message,
    });
  }
});

module.exports = router;
