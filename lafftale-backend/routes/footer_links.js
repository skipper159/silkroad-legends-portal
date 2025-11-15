const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');

// Get all active footer links (public endpoint)
router.get('/', async (req, res) => {
  try {
    const pool = await getWebDb();

    const query = `
      SELECT 
        id,
        title,
        url,
        image,
        display_order
      FROM footer_links
      WHERE is_active = 1
      ORDER BY display_order ASC, created_at DESC
    `;

    const result = await pool.request().query(query);

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

module.exports = router;
