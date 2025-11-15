const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * GET /api/vouchers - Admin endpoint to retrieve all vouchers
 * Requires admin authentication
 */
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
        SELECT id, code, amount, type, valid_date, jid, status, 
               created_at, updated_at 
        FROM vouchers 
        ORDER BY created_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

/**
 * POST /api/vouchers/redeem - User endpoint to redeem a voucher code
 * Requires user authentication
 */
router.post('/redeem', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;
    const userJid = req.user.jid;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Voucher code required' });
    }

    const pool = await getWebDb();

    // If no JID, try to get it from users table
    let effectiveJid = userJid;
    if (!effectiveJid && userId) {
      const userResult = await pool
        .request()
        .input('userId', sql.BigInt, userId)
        .query('SELECT jid FROM users WHERE id = @userId');

      if (userResult.recordset.length > 0) {
        effectiveJid = userResult.recordset[0].jid;
      }
    }

    if (!effectiveJid) {
      return res.status(400).json({
        success: false,
        message: 'User account not properly linked to game account',
      });
    }

    // Check if voucher exists and is valid
    const voucherResult = await pool.request().input('code', sql.NVarChar, code).query(`
        SELECT id, type, amount, max_uses, used_count, valid_date, expires_at, status, jid 
        FROM vouchers 
        WHERE code = @code AND status = 'Active' AND used_count < max_uses 
        AND (valid_date IS NULL OR valid_date > GETDATE())
        AND (expires_at IS NULL OR expires_at > GETDATE())
      `);

    if (voucherResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found, expired, or already used',
      });
    }

    const voucher = voucherResult.recordset[0];

    // Check if this voucher was already redeemed by checking if jid is set
    if (voucher.jid !== null) {
      return res.status(400).json({
        success: false,
        message: 'This voucher has already been used',
      });
    }

    // Start transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Update voucher with user info
      await transaction
        .request()
        .input('voucherId', sql.BigInt, voucher.id)
        .input('userJid', sql.BigInt, effectiveJid).query(`
          UPDATE vouchers 
          SET jid = @userJid, 
              used_count = used_count + 1, 
              status = CASE WHEN used_count + 1 >= max_uses THEN 'Redeemed' ELSE 'Active' END,
              updated_at = GETDATE()
          WHERE id = @voucherId
        `);

      // Apply reward based on voucher type
      if (voucher.type === 1) {
        // Assuming 1 = silk
        // Add silk to user account
        const { getGameDb } = require('../db');
        const gamePool = await getGameDb();

        await gamePool
          .request()
          .input('jid', sql.Int, effectiveJid)
          .input('amount', sql.Int, voucher.amount).query(`
            UPDATE SK_Silk 
            SET silk_own = silk_own + @amount 
            WHERE JID = @jid
          `);
      }

      await transaction.commit();

      res.json({
        success: true,
        message: `Voucher redeemed successfully! You received ${voucher.amount} ${
          voucher.type === 1 ? 'silk' : 'reward'
        }.`,
        data: {
          type: voucher.type === 1 ? 'silk' : 'reward',
          value: voucher.amount,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

/**
 * POST /api/vouchers - Admin endpoint to create a new voucher
 * Requires admin authentication
 */
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { code, type, value, max_uses = 1, expires_at, active = true } = req.body;

    if (!code || !type || !value) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const pool = await getWebDb();

    // Check if code already exists
    const existingVoucher = await pool
      .request()
      .input('code', sql.VarChar, code)
      .query('SELECT id FROM vouchers WHERE code = @code');

    if (existingVoucher.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Voucher code already exists' });
    }

    const result = await pool
      .request()
      .input('code', sql.VarChar, code)
      .input('type', sql.VarChar, type)
      .input('value', sql.Int, value)
      .input('max_uses', sql.Int, max_uses)
      .input('uses_left', sql.Int, max_uses)
      .input('expires_at', sql.DateTime, expires_at || null)
      .input('active', sql.Bit, active).query(`
        INSERT INTO vouchers (code, type, value, max_uses, uses_left, expires_at, active, created_at, updated_at)
        VALUES (@code, @type, @value, @max_uses, @uses_left, @expires_at, @active, GETDATE(), GETDATE());
        SELECT SCOPE_IDENTITY() as id;
      `);

    res.status(201).json({
      success: true,
      data: { id: result.recordset[0].id, code, type, value },
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

/**
 * PUT /api/vouchers/:id - Admin endpoint to update an existing voucher
 * Requires admin authentication
 */
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, max_uses, expires_at, active } = req.body;

    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('code', sql.VarChar, code)
      .input('type', sql.VarChar, type)
      .input('value', sql.Int, value)
      .input('max_uses', sql.Int, max_uses)
      .input('expires_at', sql.DateTime, expires_at || null)
      .input('active', sql.Bit, active).query(`
        UPDATE vouchers 
        SET code = @code, type = @type, value = @value, max_uses = @max_uses,
            expires_at = @expires_at, active = @active, updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    res.json({ success: true, message: 'Voucher updated successfully' });
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

/**
 * DELETE /api/vouchers/:id - Admin endpoint to delete a voucher
 * Requires admin authentication
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getWebDb();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM vouchers WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

/**
 * GET /api/vouchers/usage - Admin endpoint to get voucher usage history
 * Requires admin authentication
 */
router.get('/usage', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();
    const result = await pool.request().query(`
        SELECT v.id, v.code as voucher_code, v.type, v.amount, 
               v.status, v.jid, v.created_at, v.updated_at,
               u.username 
        FROM vouchers v
        LEFT JOIN users u ON v.jid = u.jid
        WHERE v.jid IS NOT NULL
        ORDER BY v.updated_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching voucher usage:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

/**
 * GET /api/vouchers/my-history - User endpoint to get personal voucher usage history
 * Requires user authentication
 */
router.get('/my-history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userJid = req.user.jid;

    const pool = await getWebDb();

    // If no JID, try to get it from users table
    let effectiveJid = userJid;
    if (!effectiveJid && userId) {
      const userResult = await pool
        .request()
        .input('userId', sql.BigInt, userId)
        .query('SELECT jid FROM users WHERE id = @userId');

      if (userResult.recordset.length > 0) {
        effectiveJid = userResult.recordset[0].jid;
      }
    }

    // If still no JID, return empty history
    if (!effectiveJid) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get vouchers that this user has redeemed (where jid matches user's jid)
    const result = await pool.request().input('userJid', sql.BigInt, effectiveJid).query(`
        SELECT id, code as voucher_code, type, amount as value, 
               status, valid_date as redeemed_at, created_at
        FROM vouchers 
        WHERE jid = @userJid AND status = 'Redeemed'
        ORDER BY created_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset || [],
    });
  } catch (error) {
    console.error('Error fetching user voucher history:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
