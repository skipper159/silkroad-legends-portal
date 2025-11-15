const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all footer links (admin)
router.get('/footer-links', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    const pool = await getWebDb();

    let query = `
      SELECT 
        id,
        title,
        url,
        image,
        display_order,
        is_active,
        created_at,
        updated_at
      FROM footer_links
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (title LIKE @search OR url LIKE @search)`;
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    query += ` ORDER BY display_order ASC, created_at DESC`;

    const request = pool.request();
    params.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching footer links:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

// Create new footer link
router.post('/footer-links', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, url, image, display_order } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title and URL are required',
      });
    }

    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('url', sql.NVarChar, url)
      .input('image', sql.NVarChar, image || null)
      .input('display_order', sql.Int, display_order || 0).query(`
        INSERT INTO footer_links (title, url, image, display_order, is_active, created_at, updated_at)
        VALUES (@title, @url, @image, @display_order, 1, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() as id;
      `);

    res.status(201).json({
      success: true,
      data: { id: result.recordset[0].id, title, url },
      message: 'Footer link created successfully',
    });
  } catch (error) {
    console.error('Error creating footer link:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

// Update footer link
router.put('/footer-links/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, image, display_order } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title and URL are required',
      });
    }

    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('url', sql.NVarChar, url)
      .input('image', sql.NVarChar, image || null)
      .input('display_order', sql.Int, display_order || 0).query(`
        UPDATE footer_links
        SET title = @title,
            url = @url,
            image = @image,
            display_order = @display_order,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Footer link not found',
      });
    }

    res.json({
      success: true,
      message: 'Footer link updated successfully',
    });
  } catch (error) {
    console.error('Error updating footer link:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

// Delete footer link
router.delete('/footer-links/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    const result = await pool.request().input('id', sql.Int, id).query(`
        DELETE FROM footer_links
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Footer link not found',
      });
    }

    res.json({
      success: true,
      message: 'Footer link deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting footer link:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

// Toggle active status
router.patch('/footer-links/:id/toggle-active', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE footer_links
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id;
        
        SELECT is_active FROM footer_links WHERE id = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Footer link not found',
      });
    }

    res.json({
      success: true,
      is_active: result.recordset[0].is_active,
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error('Error toggling footer link status:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

module.exports = router;
