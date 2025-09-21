// routes/silk.js - GB_JoymaxPortal Compatible Implementation
const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql, getWebDb, accountPoolConnect, accountPool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const SilkManager = require('../models/silkManagerEnhanced');

// Get user's silk balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔍 Starting silk balance lookup for User ID: ${userId}`);

    // 1. Hole das verknüpfte JID aus der Web-Datenbank
    const webDb = await getWebDb();
    const userResult = await webDb
      .request()
      .input('userId', sql.BigInt, userId)
      .query('SELECT jid FROM users WHERE id = @userId');

    console.log(`🔍 Web DB query result:`, userResult.recordset);

    if (userResult.recordset.length === 0 || !userResult.recordset[0].jid) {
      console.log(`❌ No game account linked for User ID: ${userId}`);
      return res.status(404).json({
        success: false,
        error: 'No game account linked to this user',
      });
    }

    const gameJID = userResult.recordset[0].jid;
    console.log(`🔍 User ID ${userId} → Game JID ${gameJID}`);

    // 2. Hole PortalJID aus TB_User (Account Pool - SILKROAD_R_ACCOUNT)
    await accountPoolConnect;
    const gameAccountResult = await accountPool
      .request()
      .input('jid', sql.Int, gameJID)
      .query('SELECT PortalJID FROM TB_User WHERE JID = @jid');

    console.log(`🔍 TB_User query result:`, gameAccountResult.recordset);

    if (gameAccountResult.recordset.length === 0) {
      console.log(`❌ Game account not found for JID: ${gameJID}`);
      return res.status(404).json({
        success: false,
        error: 'Game account not found',
      });
    }

    const portalJID = gameAccountResult.recordset[0].PortalJID;
    console.log(`🔍 Game JID ${gameJID} → Portal JID ${portalJID}`);

    const balanceData = await SilkManager.getJCash(portalJID);

    // Wenn Account noch keine Silk-Einträge hat, gib Default-Werte zurück
    if (balanceData.errorCode !== 0) {
      console.log(
        `ℹ️ Neuer Account ${portalJID} - noch keine Silk-Einträge (ErrorCode: ${balanceData.errorCode})`
      );
      return res.json({
        success: true,
        data: {
          jid: portalJID,
          silk: 0,
          premiumSilk: 0,
          vipLevel: 0,
          monthUsage: 0,
          threeMonthUsage: 0,
        },
      });
    }

    res.json({
      success: true,
      data: {
        jid: portalJID,
        silk: balanceData.silk,
        premiumSilk: balanceData.premiumSilk,
        vipLevel: balanceData.vipLevel,
        monthUsage: balanceData.monthUsage,
        threeMonthUsage: balanceData.threeMonthUsage,
      },
    });
  } catch (error) {
    console.error('Error getting silk balance:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Process PayPal donation
router.post('/process-paypal', authenticateToken, async (req, res) => {
  try {
    const { amount, transactionId, silkRate = 100 } = req.body;

    if (!amount || !transactionId || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount or transaction ID',
      });
    }

    const userId = req.user.id;
    const result = await SilkManager.processPayPalDonation(userId, amount, transactionId, silkRate);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message || 'PayPal donation processing failed',
        errorCode: result.errorCode,
      });
    }

    res.json({
      success: true,
      message: 'Donation processed successfully',
      data: {
        jid: result.jid,
        amount: result.amount,
        silk: result.silk,
        transactionId: result.transactionId,
        invoiceId: result.invoiceId,
      },
    });
  } catch (error) {
    console.error('Error processing PayPal donation:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get donation history
router.get('/donation-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await SilkManager.getDonationHistory(userId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error getting donation history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Add vote points (typically called by external vote sites)
router.post('/add-vote-points', async (req, res) => {
  try {
    const { jid, points, site } = req.body;

    if (!jid || !points || !site || points <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JID, points, or site',
      });
    }

    const result = await SilkManager.addVotePoints(jid, points, site);

    res.json({
      success: true,
      message: 'Vote points added successfully',
      data: {
        jid: jid,
        points: points,
        site: site,
      },
    });
  } catch (error) {
    console.error('Error adding vote points:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Admin: Give Gift Silk (requires admin authentication)
router.post('/admin/give-silk', authenticateToken, async (req, res) => {
  try {
    const { targetJID, amount, silkType, message, grCode = 1 } = req.body;

    if (!targetJID || !amount || !silkType || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid target JID, amount, or silk type',
      });
    }

    // Note: In production, add proper admin role check here
    const managerJID = req.user.id; // Admin JID

    const result = await SilkManager.giveAdminSilk(
      managerJID,
      targetJID,
      amount,
      silkType,
      message || 'Admin Gift Silk',
      grCode
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message,
        errorCode: result.errorCode,
      });
    }

    res.json({
      success: true,
      message: 'Gift Silk given successfully',
      data: {
        managerJID: managerJID,
        targetJID: targetJID,
        amount: amount,
        silkType: silkType,
        message: message,
      },
    });
  } catch (error) {
    console.error('Error giving admin silk:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

module.exports = router;
