const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get all footer sections (admin)
router.get('/footer-sections', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const query = `
      SELECT 
        id,
        section_key,
        section_name,
        is_visible,
        display_order,
        created_at,
        updated_at
      FROM footer_sections
      ORDER BY display_order ASC
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching footer sections:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

// Toggle section visibility
router.patch(
  '/footer-sections/:id/toggle-visibility',
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await getWebDb();

      const result = await pool.request().input('id', sql.Int, id).query(`
        UPDATE footer_sections
        SET is_visible = CASE WHEN is_visible = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id;
        
        SELECT is_visible, section_name FROM footer_sections WHERE id = @id;
      `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Footer section not found',
        });
      }

      res.json({
        success: true,
        is_visible: result.recordset[0].is_visible,
        message: `${result.recordset[0].section_name} visibility updated`,
      });
    } catch (error) {
      console.error('Error toggling footer section visibility:', error);
      res.status(500).json({
        success: false,
        message: 'Database error',
        error: error.message,
      });
    }
  }
);

// Update section display order
router.put('/footer-sections/:id/order', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { display_order } = req.body;

    if (display_order === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Display order is required',
      });
    }

    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('display_order', sql.Int, display_order).query(`
        UPDATE footer_sections
        SET display_order = @display_order,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Footer section not found',
      });
    }

    res.json({
      success: true,
      message: 'Display order updated successfully',
    });
  } catch (error) {
    console.error('Error updating footer section order:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});

module.exports = router;
