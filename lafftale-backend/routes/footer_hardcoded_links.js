const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');

// Get all hardcoded links (public endpoint)
router.get('/', async (req, res) => {
  try {
    const pool = await getWebDb();

    const query = `
      SELECT 
        link_key,
        title,
        url,
        section,
        is_visible,
        display_order
      FROM footer_hardcoded_links
      WHERE is_visible = 1
      ORDER BY section ASC, display_order ASC
    `;

    const result = await pool.request().query(query);

    // Group by section for easier access
    const linksBySection = {
      quick_links: [],
      legal_links: [],
    };

    result.recordset.forEach((link) => {
      if (linksBySection[link.section]) {
        linksBySection[link.section].push({
          key: link.link_key,
          title: link.title,
          url: link.url,
          order: link.display_order,
        });
      }
    });

    res.json({
      success: true,
      data: linksBySection,
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

module.exports = router;
