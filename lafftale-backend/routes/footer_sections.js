const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');

// Get all footer sections (public endpoint)
router.get('/', async (req, res) => {
  try {
    const pool = await getWebDb();

    const query = `
      SELECT 
        section_key,
        is_visible
      FROM footer_sections
      ORDER BY display_order ASC
    `;

    const result = await pool.request().query(query);

    // Convert to object for easier access
    const sections = {};
    result.recordset.forEach((section) => {
      sections[section.section_key] = section.is_visible;
    });

    res.json({
      success: true,
      data: sections,
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

module.exports = router;
