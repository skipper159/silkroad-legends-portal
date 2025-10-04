const express = require('express');
const router = express.Router();
const { getWebDb, getGameDb, sql } = require('../db');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/vouchers/redeem - User endpoint to redeem a voucher code
 * Requires user authentication
 */
router.post('/redeem', verifyToken, async (req, res) => {
  try {
    const { code, targetJid } = req.body;
    const userId = req.user.id;
    const userJid = req.user.jid;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Voucher code is required' });
    }

    // Use targetJid if provided, otherwise fall back to user's JID
    const targetGameJid = targetJid || userJid;

    if (!targetGameJid) {
      return res.status(400).json({ success: false, message: 'No game account specified' });
    }

    console.log(`🔍 Voucher Redeem - User: ${userId}, Target JID: ${targetGameJid}, Code: ${code}`);

    const pool = await getWebDb();
    const SilkManagerEnhanced = require('../models/silkManagerEnhanced');

    // Get user's JID if not in token
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

    if (!targetGameJid) {
      return res.status(400).json({ success: false, message: 'User JID not found' });
    }

    // Resolve to Portal JID (wichtig für JoymaxPortal System)
    const portalJid = await SilkManagerEnhanced.resolvePortalJID(targetGameJid);

    // Find voucher by code
    const voucherResult = await pool.request().input('code', sql.VarChar, code.trim()).query(`
        SELECT id, code, type, amount, max_uses, used_count, expires_at, 
               CASE WHEN status = 'Active' THEN 1 ELSE 0 END as active, jid, created_at
        FROM vouchers 
        WHERE code = @code
      `);

    if (voucherResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    const voucher = voucherResult.recordset[0];

    // Validation checks
    if (!voucher.active) {
      return res.status(400).json({ success: false, message: 'Voucher is not active' });
    }

    if (voucher.used_count >= voucher.max_uses) {
      return res.status(400).json({ success: false, message: 'Voucher usage limit reached' });
    }

    if (voucher.expires_at && new Date() > new Date(voucher.expires_at)) {
      return res.status(400).json({ success: false, message: 'Voucher has expired' });
    }

    // Start transaction for voucher redemption
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Update voucher status and usage
      await transaction
        .request()
        .input('voucherId', sql.Int, voucher.id)
        .input('userJid', sql.BigInt, portalJid) // Verwende Portal JID
        .query(`
          UPDATE vouchers 
          SET used_count = used_count + 1,
              status = CASE WHEN used_count + 1 >= max_uses THEN 'Redeemed' ELSE 'Active' END,
              valid_date = CASE WHEN jid IS NULL THEN GETDATE() ELSE valid_date END,
              jid = CASE WHEN jid IS NULL THEN @userJid ELSE jid END,
              updated_at = GETDATE()
          WHERE id = @voucherId
        `);

      // Process silk reward if voucher type is 'silk'
      if (voucher.type === 1 && voucher.amount > 0) {
        const gamePool = await getGameDb();

        // First, deactivate all existing entries for this JID and SilkType 3
        await gamePool.request().input('jid', sql.Int, portalJid).input('silkType', sql.TinyInt, 3)
          .query(`
            UPDATE APH_ChangedSilk 
            SET AvailableStatus = 'N'
            WHERE JID = @jid AND SilkType = @silkType AND AvailableStatus = 'Y'
          `);

        // Get the latest silk balance for this JID and SilkType 3 (Premium Silk)
        const currentSilkResult = await gamePool
          .request()
          .input('jid', sql.Int, portalJid)
          .input('silkType', sql.TinyInt, 3).query(`
            SELECT TOP 1 ISNULL(cs.RemainedSilk, 0) as currentTotal
            FROM APH_ChangedSilk cs
            WHERE cs.JID = @jid AND cs.SilkType = @silkType
            ORDER BY cs.ChangeDate DESC
          `);

        const currentSilkTotal = currentSilkResult.recordset[0]?.currentTotal || 0;
        const newTotalSilk = currentSilkTotal + voucher.amount;

        // Insert into APH_ChangedSilk (Transaction log) - Verwende Portal JID
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 10); // Set to 10 years in the future

        const silkResult = await gamePool
          .request()
          .input('jid', sql.Int, portalJid) // Portal JID für JoymaxPortal System
          .input('remainedSilk', sql.Int, newTotalSilk) // Alter + Neuer Wert
          .input('changedSilk', sql.Int, voucher.amount) // Nur der neue Voucher-Wert
          .input('silkType', sql.TinyInt, 3) // 3 = Premium Silk (for vouchers)
          .input('sellingTypeID', sql.TinyInt, 2) // 2 = Gift/Free
          .input('changeDate', sql.DateTime, new Date())
          .input('availableDate', sql.DateTime, futureDate)
          .input('availableStatus', sql.Char(1), 'Y').query(`
            INSERT INTO APH_ChangedSilk 
            (InvoiceID, PTInvoiceID, ManagerGiftID, JID, RemainedSilk, ChangedSilk, 
             SilkType, SellingTypeID, ChangeDate, AvailableDate, AvailableStatus)
            VALUES 
            (NULL, NULL, NULL, @jid, @remainedSilk, @changedSilk, 
             @silkType, @sellingTypeID, @changeDate, @availableDate, @availableStatus);
            SELECT SCOPE_IDENTITY() as NewCSID;
          `);

        const newCSID = silkResult.recordset[0].NewCSID;

        // Update or Insert into APH_SilkBalance (Current silk balance)
        await gamePool
          .request()
          .input('csid', sql.Int, newCSID)
          .input('silkType', sql.TinyInt, 3) // 3 = Premium Silk (korrigiert für vouchers)
          .input('silkAmount', sql.Int, voucher.amount)
          .input('balanceDate', sql.DateTime, new Date()).query(`
            MERGE APH_SilkBalance AS target
            USING (SELECT @csid AS CSID, @silkType AS SilkType, @silkAmount AS SilkAmount, @balanceDate AS BalanceDate) AS source
            ON (target.CSID = source.CSID AND target.SilkType = source.SilkType)
            WHEN MATCHED THEN
              UPDATE SET SilkAmount = target.SilkAmount + source.SilkAmount, BalanceDate = source.BalanceDate
            WHEN NOT MATCHED THEN
              INSERT (CSID, SilkType, SilkAmount, BalanceDate)
              VALUES (source.CSID, source.SilkType, source.SilkAmount, source.BalanceDate);
          `);

        console.log(
          `Successfully added ${voucher.amount} premium silk to Portal JID ${portalJid} (CSID: ${newCSID})`
        );
        console.log(`Previous total: ${currentSilkTotal}, New total: ${newTotalSilk}`);
      }

      // Log the voucher redemption
      await transaction
        .request()
        .input('voucherId', sql.BigInt, voucher.id)
        .input('jid', sql.Int, targetGameJid) // Target Game JID for logs
        .input('username', sql.NVarChar, req.user.username)
        .input('ip', sql.NVarChar, req.ip || req.connection.remoteAddress || 'unknown')
        .input('redeemedAt', sql.DateTime2, new Date()).query(`
          INSERT INTO voucher_logs (voucher_id, jid, username, ip, redeemed_at, created_at, updated_at)
          VALUES (@voucherId, @jid, @username, @ip, @redeemedAt, GETDATE(), GETDATE())
        `);

      await transaction.commit();

      res.json({
        success: true,
        message: `Voucher redeemed successfully! Account JID ${targetGameJid} received ${
          voucher.amount
        } ${voucher.type === 1 ? 'silk' : 'reward'}.`,
        data: {
          type: voucher.type === 1 ? 'silk' : 'reward',
          value: voucher.amount,
          targetJid: targetGameJid,
        },
      });
    } catch (silkError) {
      await transaction.rollback();
      console.error('Error during voucher redemption:', silkError);
      res.status(500).json({ success: false, message: 'Error processing voucher redemption' });
    }
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

/**
 * GET /api/vouchers/history - User endpoint to get voucher redemption history
 * Requires user authentication
 * Optional query parameter: gameAccountJid - filter by specific game account
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userJid = req.user.jid;
    const { gameAccountJid } = req.query; // New optional parameter
    const pool = await getWebDb();
    const SilkManagerEnhanced = require('../models/silkManagerEnhanced');

    console.log(`🔍 Voucher History Debug - User ID: ${userId}, User JID: ${userJid}, Filter by Game Account: ${gameAccountJid}`);

    // If gameAccountJid is specified, verify the user owns this game account
    if (gameAccountJid) {
      const ownershipCheck = await pool
        .request()
        .input('userId', sql.BigInt, userId)
        .input('gameAccountJid', sql.Int, gameAccountJid)
        .query(`
          SELECT COUNT(*) AS count 
          FROM user_gameaccounts 
          WHERE user_id = @userId AND gameaccount_jid = @gameAccountJid
        `);

      if (ownershipCheck.recordset[0].count === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only view voucher history for your own game accounts' 
        });
      }

      // Get voucher history for specific game account
      console.log(`🔍 Querying voucher_logs for specific Game Account JID: ${gameAccountJid}`);
      
      const result = await pool
        .request()
        .input('gameJid', sql.Int, gameAccountJid)
        .query(`
          SELECT vl.id, v.code as voucher_code, v.type, v.amount, v.amount as value,
                 'Redeemed' as status, vl.redeemed_at, vl.created_at,
                 v.max_uses, v.used_count, vl.jid as game_account_jid,
                 ga.StrUserID as game_account_name
          FROM voucher_logs vl
          INNER JOIN vouchers v ON vl.voucher_id = v.id
          LEFT JOIN SILKROAD_R_ACCOUNT.dbo.TB_User ga ON vl.jid = ga.JID
          WHERE vl.jid = @gameJid
          ORDER BY vl.redeemed_at DESC
        `);

      console.log(`🔍 Query returned ${result.recordset.length} voucher history records for game account ${gameAccountJid}`);

      return res.json({
        success: true,
        data: result.recordset || [],
      });
    }

    // Original logic for all user's vouchers
    // Get user's JID if not in token
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

    console.log(`🔍 Effective JID before Portal resolution: ${effectiveJid}`);

    // Keep original Game JID for voucher_logs lookup
    const originalGameJid = effectiveJid;

    // Try to resolve Portal JID
    if (effectiveJid) {
      try {
        effectiveJid = await SilkManagerEnhanced.resolvePortalJID(effectiveJid);
        console.log(`🔍 Resolved Portal JID: ${effectiveJid}`);
      } catch (error) {
        console.log('Could not resolve Portal JID, using original JID');
      }
    }

    // If still no JID, get all vouchers for user's game accounts
    if (!effectiveJid && !originalGameJid) {
      // Get all vouchers for all user's game accounts
      const userGameAccountsResult = await pool
        .request()
        .input('userId', sql.BigInt, userId)
        .query(`
          SELECT gameaccount_jid 
          FROM user_gameaccounts 
          WHERE user_id = @userId
        `);

      if (userGameAccountsResult.recordset.length === 0) {
        return res.json({
          success: true,
          data: [],
        });
      }

      const gameAccountJids = userGameAccountsResult.recordset.map(row => row.gameaccount_jid);
      console.log(`🔍 Querying voucher_logs for all user's game accounts: ${gameAccountJids.join(', ')}`);

      // Build dynamic query for multiple JIDs
      const jidConditions = gameAccountJids.map((_, index) => `vl.jid = @jid${index}`).join(' OR ');
      const query = `
        SELECT vl.id, v.code as voucher_code, v.type, v.amount, v.amount as value,
               'Redeemed' as status, vl.redeemed_at, vl.created_at,
               v.max_uses, v.used_count, vl.jid as game_account_jid,
               ga.StrUserID as game_account_name
        FROM voucher_logs vl
        INNER JOIN vouchers v ON vl.voucher_id = v.id
        LEFT JOIN SILKROAD_R_ACCOUNT.dbo.TB_User ga ON vl.jid = ga.JID
        WHERE ${jidConditions}
        ORDER BY vl.redeemed_at DESC
      `;

      const request = pool.request();
      gameAccountJids.forEach((jid, index) => {
        request.input(`jid${index}`, sql.Int, jid);
      });

      const result = await request.query(query);

      console.log(`🔍 Query returned ${result.recordset.length} voucher history records for all user's accounts`);

      return res.json({
        success: true,
        data: result.recordset || [],
      });
    }

    console.log(
      `🔍 Querying voucher_logs with Game JID: ${originalGameJid} and Portal JID: ${effectiveJid}`
    );

    // Get voucher redemption history from voucher_logs joined with vouchers
    // Search by both original Game JID and resolved Portal JID to cover all cases
    const result = await pool
      .request()
      .input('gameJid', sql.BigInt, originalGameJid || 0)
      .input('portalJid', sql.BigInt, effectiveJid || 0).query(`
        SELECT vl.id, v.code as voucher_code, v.type, v.amount, v.amount as value,
               'Redeemed' as status, vl.redeemed_at, vl.created_at,
               v.max_uses, v.used_count, vl.jid as game_account_jid,
               ga.StrUserID as game_account_name
        FROM voucher_logs vl
        INNER JOIN vouchers v ON vl.voucher_id = v.id
        LEFT JOIN SILKROAD_R_ACCOUNT.dbo.TB_User ga ON vl.jid = ga.JID
        WHERE vl.jid = @gameJid OR vl.jid = @portalJid
        ORDER BY vl.redeemed_at DESC
      `);

    console.log(`🔍 Query returned ${result.recordset.length} voucher history records`);

    res.json({
      success: true,
      data: result.recordset || [],
    });
  } catch (error) {
    console.error('Error fetching voucher history:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
