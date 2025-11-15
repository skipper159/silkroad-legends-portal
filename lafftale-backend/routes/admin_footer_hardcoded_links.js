const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all hardcoded links (admin)
router.get('/footer-hardcoded-links', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const query = `
      SELECT 
        id,
        link_key,
        title,
        url,
        section,
        is_visible,
        display_order,
        created_at,
        updated_at
      FROM footer_hardcoded_links
      ORDER BY section ASC, display_order ASC
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching hardcoded links:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

// Toggle hardcoded link visibility
router.patch(
  '/footer-hardcoded-links/:id/toggle-visibility',
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getWebDb();

      const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE footer_hardcoded_links
        SET is_visible = CASE WHEN is_visible = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id;
        
        SELECT is_visible, title FROM footer_hardcoded_links WHERE id = @id;
      `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Hardcoded link not found',
        });
      }

      res.json({
        success: true,
        is_visible: result.recordset[0].is_visible,
        message: `${result.recordset[0].title} visibility updated`,
      });
    } catch (error) {
      console.error('Error toggling hardcoded link visibility:', error);
      res.status(500).json({
        success: false,
        message: 'Database error',
        error: error.message,
      });
    }
  }
);

// Update hardcoded link
router.put('/footer-hardcoded-links/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, display_order } = req.body;

    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title)
      .input('url', sql.NVarChar, url)
      .input('display_order', sql.Int, display_order).query(`
        UPDATE footer_hardcoded_links
        SET title = @title,
            url = @url,
            display_order = @display_order,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hardcoded link not found',
      });
    }

    res.json({
      success: true,
      message: 'Hardcoded link updated successfully',
    });
  } catch (error) {
    console.error('Error updating hardcoded link:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

module.exports = router;
