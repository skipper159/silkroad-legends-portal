const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/auth');
const crypto = require('crypto');

// Get all vouchers for admin
router.get('/', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { search, status } = req.query;
    const pool = await getWebDb();

    let query = `
      SELECT v.id, v.code, v.type, v.amount, v.max_uses, v.used_count, 
             v.valid_date, v.expires_at, v.status, v.description, v.created_at, v.updated_at,
             u.username as created_by_username,
             CASE WHEN v.status = 'Active' THEN 1 ELSE 0 END as is_active
      FROM vouchers v
      LEFT JOIN users u ON v.created_by = u.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (v.code LIKE @search OR CAST(v.type AS NVARCHAR) LIKE @search)`;
      params.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
    }

    if (status === 'active') {
      query += ` AND v.status = 'Active' AND (v.valid_date IS NULL OR v.valid_date > GETDATE()) AND (v.expires_at IS NULL OR v.expires_at > GETDATE())`;
    } else if (status === 'expired') {
      query += ` AND ((v.valid_date IS NOT NULL AND v.valid_date <= GETDATE()) OR (v.expires_at IS NOT NULL AND v.expires_at <= GETDATE()))`;
    } else if (status === 'inactive') {
      query += ` AND v.status = 'Disabled'`;
    }

    query += ` ORDER BY v.created_at DESC`;

    const request = pool.request();
    params.forEach((param) => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching vouchers:', err);
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

// Create new voucher
router.post('/', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { code, type, amount, value, max_uses, valid_date, expires_at, description, is_active } =
      req.body;

    // Accept both 'amount' and 'value' for backwards compatibility
    const voucherAmount = amount || value;

    // Set status based on is_active flag (default: Active)
    const status = is_active !== false ? 'Active' : 'Disabled';

    // Convert string type to integer
    const getTypeNumber = (typeString) => {
      switch (typeString?.toLowerCase()) {
        case 'silk':
        case '1':
          return 1;
        case 'gold':
        case '2':
          return 2;
        case 'experience':
        case '3':
          return 3;
        case 'item':
        case '4':
          return 4;
        default:
          return null;
      }
    };

    const typeNumber = getTypeNumber(type);

    if (!typeNumber || !voucherAmount) {
      return res.status(400).json({
        error: 'Missing required fields: type and amount/value',
        received: { type, typeNumber, voucherAmount },
      });
    }

    const pool = await getWebDb();

    // Generate code if not provided
    const voucherCode = code || crypto.randomBytes(8).toString('hex').toUpperCase();

    // Check if code already exists
    const existing = await pool
      .request()
      .input('code', sql.NVarChar, voucherCode)
      .query('SELECT id FROM vouchers WHERE code = @code');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ error: 'Voucher code already exists' });
    }

    const result = await pool
      .request()
      .input('code', sql.NVarChar, voucherCode)
      .input('type', sql.Int, typeNumber)
      .input('amount', sql.Int, voucherAmount)
      .input('max_uses', sql.Int, max_uses || 1)
      .input('valid_date', sql.DateTime, valid_date || null)
      .input('expires_at', sql.DateTime, expires_at || null)
      .input('description', sql.NVarChar, description || '')
      .input('status', sql.NVarChar, status)
      .input('created_by', sql.BigInt, req.user.id).query(`
        INSERT INTO vouchers (code, type, amount, max_uses, used_count, valid_date, expires_at, description, status, created_by, created_at, updated_at)
        OUTPUT INSERTED.id
        VALUES (@code, @type, @amount, @max_uses, 0, @valid_date, @expires_at, @description, @status, @created_by, GETDATE(), GETDATE())
      `);

    res.json({
      message: 'Voucher created successfully',
      id: result.recordset[0].id,
      code: voucherCode,
    });
  } catch (err) {
    console.error('Error creating voucher:', err);
    res.status(500).json({ error: 'Failed to create voucher' });
  }
});

// Update voucher
router.put('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, amount, max_uses, valid_date, expires_at, description, status, is_active } =
      req.body;

    const pool = await getWebDb();

    // Determine status: use status if provided, otherwise convert is_active to status
    const voucherStatus = status || (is_active !== false ? 'Active' : 'Disabled');

    // Check if code already exists (excluding current voucher)
    if (code) {
      const existing = await pool
        .request()
        .input('code', sql.NVarChar, code)
        .input('id', sql.Int, id)
        .query('SELECT id FROM vouchers WHERE code = @code AND id != @id');

      if (existing.recordset.length > 0) {
        return res.status(400).json({ error: 'Voucher code already exists' });
      }
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('code', sql.NVarChar, code)
      .input('type', sql.Int, parseInt(type))
      .input('amount', sql.Int, amount)
      .input('max_uses', sql.Int, max_uses || 1)
      .input('valid_date', sql.DateTime, valid_date || null)
      .input('expires_at', sql.DateTime, expires_at || null)
      .input('description', sql.NVarChar, description || '')
      .input('status', sql.NVarChar, voucherStatus).query(`
        UPDATE vouchers 
        SET code = @code, type = @type, amount = @amount, max_uses = @max_uses,
            valid_date = @valid_date, expires_at = @expires_at, description = @description, status = @status,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Voucher updated successfully' });
  } catch (err) {
    console.error('Error updating voucher:', err);
    res.status(500).json({ error: 'Failed to update voucher' });
  }
});

// Delete voucher
router.delete('/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query('DELETE FROM vouchers WHERE id = @id');

    res.json({ message: 'Voucher deleted successfully' });
  } catch (err) {
    console.error('Error deleting voucher:', err);
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
});

// Get voucher usage history
router.get('/:id/usage', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    const result = await pool.request().input('id', sql.Int, id).query(`
        SELECT vh.id, vh.used_at, u.username, u.email
        FROM voucher_history vh
        JOIN users u ON vh.user_id = u.id
        WHERE vh.voucher_id = @id
        ORDER BY vh.used_at DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching voucher usage:', err);
    res.status(500).json({ error: 'Failed to fetch voucher usage' });
  }
});

// Toggle voucher status
router.patch('/:id/toggle', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();

    await pool.request().input('id', sql.Int, id).query(`
        UPDATE vouchers 
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
            updated_at = GETDATE()
        WHERE id = @id
      `);

    res.json({ message: 'Voucher status updated successfully' });
  } catch (err) {
    console.error('Error toggling voucher status:', err);
    res.status(500).json({ error: 'Failed to update voucher status' });
  }
});

module.exports = router;
