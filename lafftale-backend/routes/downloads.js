const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');


router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const pool = await getWebDb();

    let query = `
      SELECT 
        id,
        name as title,
        [desc] as description,
        url as file_url,
        image,
        created_at,
        updated_at
      FROM downloads
      ORDER BY created_at DESC
    `;

    const result = await pool.request().query(query);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching downloads:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message,
    });
  }
});


router.get('/categories', async (req, res) => {
  try {
    const pool = await getWebDb();
    // Since there's no category column, return empty categories for now
    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(
        'SELECT id, name as title, [desc] as description, url as file_url, image, created_at, updated_at FROM downloads WHERE id = @id'
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Download not found' });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('Error fetching download:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});


router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    // Get download info (no counter since the column doesn't exist)
    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT url as file_url, name as title FROM downloads WHERE id = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Download not found' });
    }

    res.json({
      success: true,
      data: {
        url: result.recordset[0].file_url,
        title: result.recordset[0].title,
      },
    });
  } catch (error) {
    console.error('Error processing download:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});


router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Support both frontend formats: {name, url} and {title, file_url}
    const name = req.body.name || req.body.title;
    const url = req.body.url || req.body.file_url;
    const description = req.body.description;
    const image = req.body.image;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Need either (name, url) or (title, file_url)',
        received: Object.keys(req.body),
      });
    }

    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('name', sql.VarChar, name)
      .input('desc', sql.Text, description || '')
      .input('url', sql.VarChar, url)
      .input('image', sql.VarChar, image || null).query(`
        INSERT INTO downloads (name, [desc], url, image, created_at, updated_at)
        VALUES (@name, @desc, @url, @image, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() as id;
      `);

    res.status(201).json({
      success: true,
      data: { id: result.recordset[0].id, name, url },
    });
  } catch (error) {
    console.error('Error creating download:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});


router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Support both frontend formats: {name, url} and {title, file_url}
    const name = req.body.name || req.body.title;
    const url = req.body.url || req.body.file_url;
    const description = req.body.description;
    const image = req.body.image;

    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.VarChar, name)
      .input('desc', sql.Text, description)
      .input('url', sql.VarChar, url)
      .input('image', sql.VarChar, image).query(`
        UPDATE downloads 
        SET name = @name, [desc] = @desc, url = @url,
            image = @image, updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Download not found' });
    }

    res.json({ success: true, message: 'Download updated successfully' });
  } catch (error) {
    console.error('Error updating download:', error);
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
      .query('DELETE FROM downloads WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Download not found' });
    }

    res.json({ success: true, message: 'Download deleted successfully' });
  } catch (error) {
    console.error('Error deleting download:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;

