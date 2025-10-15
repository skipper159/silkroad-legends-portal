const express = require('express');
const router = express.Router();
const { pool, poolConnect, sql } = require('../db');
const SilkManagerEnhanced = require('../models/silkManagerEnhanced');
const SilkStatsService = require('../services/silkStatsService');
const SilkCacheService = require('../services/silkCacheService');
const adminAuth = require('../middleware/adminAuth');

// Apply admin authentication middleware to all routes in this router
router.use(adminAuth);

/**
 * GET /api/admin/silk/accounts
 * Hole alle Game Accounts mit ihren Silk Balances (mit Pagination, Suche und Caching)
 */
router.get('/accounts', async (req, res) => {
  try {
    await poolConnect;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search?.trim() || '';
    const useCache = req.query.cache !== 'false'; // Default: Cache verwenden

    console.log(
      `🔍 Silk Admin: Hole Accounts (Page ${page}, Limit ${limit}, Search: "${searchTerm}", Cache: ${useCache})`
    );

    // Build search conditions
    let whereClause = 'WHERE tb.PortalJID IS NOT NULL';
    let searchParams = [];

    if (searchTerm) {
      whereClause += ' AND (tb.StrUserID LIKE @search OR mu.UserID LIKE @search)';
      searchParams.push({ name: 'search', type: sql.VarChar, value: `%${searchTerm}%` });
    }

    // Count total accounts
    const countQuery = `
      SELECT COUNT(*) as total
      FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User] tb
      INNER JOIN [GB_JoymaxPortal].[dbo].[MU_User] mu ON tb.PortalJID = mu.JID
      ${whereClause}
    `;

    const countRequest = pool.request();
    searchParams.forEach((param) => countRequest.input(param.name, param.type, param.value));
    const countResult = await countRequest.query(countQuery);
    const totalCount = countResult.recordset[0].total;

    // Get paginated accounts with basic info
    const accountsQuery = `
      SELECT 
        tb.JID as GameJID,
        tb.StrUserID as Username,
        tb.PortalJID,
        tb.RegDate as GameRegDate,
        mu.UserID as PortalUsername,
        mu.NickName,
        mu.LoginDate as LastLogin
      FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User] tb
      INNER JOIN [GB_JoymaxPortal].[dbo].[MU_User] mu ON tb.PortalJID = mu.JID
      ${whereClause}
      ORDER BY tb.RegDate DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;

    const accountsRequest = pool
      .request()
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit);
    searchParams.forEach((param) => accountsRequest.input(param.name, param.type, param.value));

    const accountsResult = await accountsRequest.query(accountsQuery);
    const accounts = accountsResult.recordset;

    // Optimierte Bulk Silk Balance Abfrage mit Caching
    console.log(
      `💰 Fetching Silk balances for ${accounts.length} accounts (${
        useCache ? 'CACHED BULK' : 'DIRECT BULK'
      })...`
    );
    const portalJIDs = accounts.map((account) => account.PortalJID);

    const startTime = Date.now();
    let silkBalances;

    if (useCache) {
      silkBalances = await SilkCacheService.getBulkSilkBalances(portalJIDs);
    } else {
      silkBalances = await SilkManagerEnhanced.getBulkJCash(portalJIDs);
    }

    const queryTime = Date.now() - startTime;
    console.log(`⚡ Silk Balance Query Zeit: ${queryTime}ms`);

    // Kombiniere Account-Daten mit Silk Balances
    const accountsWithSilk = accounts.map((account) => {
      const silkBalance = silkBalances[account.PortalJID] || {
        premiumSilk: 0,
        silk: 0,
        vipLevel: 0,
        errorCode: -1,
      };

      return {
        gameJID: account.GameJID,
        portalJID: account.PortalJID,
        username: account.Username,
        portalUsername: account.PortalUsername,
        nickname: account.NickName,
        gameRegDate: account.GameRegDate,
        lastLogin: account.LastLogin,
        silkBalance: {
          premiumSilk: silkBalance.premiumSilk,
          silk: silkBalance.silk,
          vipLevel: silkBalance.vipLevel,
          errorCode: silkBalance.errorCode,
        },
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      data: accountsWithSilk,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        limit: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      performance: {
        queryTime: queryTime,
        cacheUsed: useCache,
        cacheStats: useCache ? SilkCacheService.getStats() : null,
      },
    });
  } catch (error) {
    console.error('❌ Admin Silk Accounts API Fehler:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Silk Account Daten',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/silk/cache/warmup
 * Starte Cache Warm-up für bessere Performance
 */
router.post('/cache/warmup', async (req, res) => {
  try {
    console.log('🔥 Admin Silk: Cache Warm-up gestartet...');
    await SilkCacheService.warmup();

    res.json({
      success: true,
      message: 'Cache Warm-up abgeschlossen',
      stats: SilkCacheService.getStats(),
    });
  } catch (error) {
    console.error('❌ Cache Warm-up Fehler:', error);
    res.status(500).json({
      error: 'Cache Warm-up Fehler',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/admin/silk/cache
 * Cache leeren
 */
router.delete('/cache', async (req, res) => {
  try {
    SilkCacheService.clear();

    res.json({
      success: true,
      message: 'Cache geleert',
    });
  } catch (error) {
    console.error('❌ Cache Clear Fehler:', error);
    res.status(500).json({
      error: 'Cache Clear Fehler',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/silk/cache/stats
 * Cache Statistiken
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = SilkCacheService.getStats();

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error('❌ Cache Stats Fehler:', error);
    res.status(500).json({
      error: 'Cache Stats Fehler',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/silk/cache/warmup
 * Starte Cache Warm-up für bessere Performance
 */
router.post('/cache/warmup', async (req, res) => {
  try {
    console.log('🔥 Admin Silk: Cache Warm-up gestartet...');
    await SilkCacheService.warmup();

    res.json({
      success: true,
      message: 'Cache Warm-up abgeschlossen',
      stats: SilkCacheService.getStats(),
    });
  } catch (error) {
    console.error('❌ Cache Warm-up Fehler:', error);
    res.status(500).json({
      error: 'Cache Warm-up Fehler',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/admin/silk/cache
 * Cache leeren
 */
router.delete('/cache', async (req, res) => {
  try {
    SilkCacheService.clear();

    res.json({
      success: true,
      message: 'Cache geleert',
    });
  } catch (error) {
    console.error('❌ Cache Clear Fehler:', error);
    res.status(500).json({
      error: 'Cache Clear Fehler',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/silk/cache/stats
 * Cache Statistiken
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = SilkCacheService.getStats();

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error('❌ Cache Stats Fehler:', error);
    res.status(500).json({
      error: 'Cache Stats Fehler',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/silk/server-stats
 * Hole Server-weite Silk Statistiken (optimiert mit Caching)
 * @param {boolean} cached - Nur cached Daten zurückgeben (keine Live-Berechnung)
 * @param {boolean} refresh - Cache leeren und neu berechnen
 */
router.get('/server-stats', async (req, res) => {
  try {
    const { cached, refresh } = req.query;
    const cachedOnly = cached === 'true';
    const forceRefresh = refresh === 'true';

    console.log(
      `📊 Admin Silk: Hole Server Statistiken... (cached=${cachedOnly}, refresh=${forceRefresh})`
    );

    // Wenn cached=true, nur gespeicherte Stats zurückgeben
    if (cachedOnly) {
      try {
        const cachedStats = await SilkStatsService.getCachedServerStats();
        if (cachedStats) {
          return res.json({
            success: true,
            data: cachedStats,
            cached: true,
            message: 'Cached statistics retrieved',
          });
        } else {
          // Keine cached Stats verfügbar
          return res.json({
            success: true,
            data: {
              totalPremiumSilk: 0,
              totalSilk: 0,
              totalSilkValue: 0,
              totalAccounts: 0,
              accountsWithSilk: 0,
              vipAccounts: 0,
              donations: {
                totalDonations: 0,
                totalDonatedUSD: 0,
                totalDonatedSilk: 0,
                uniqueDonors: 0,
              },
              lastCalculated: null,
              calculationDuration: 0,
            },
            cached: false,
            message: 'No cached statistics available',
          });
        }
      } catch (cacheError) {
        console.error('❌ Cache Error:', cacheError);
        return res.status(500).json({
          success: false,
          error: 'Cache access failed',
        });
      }
    }

    // Ansonsten vollständige Live-Berechnung (wie bisher)
    const serverStats = await SilkStatsService.getServerStats(forceRefresh);

    res.json({
      success: true,
      data: serverStats,
      cached: false,
      message: 'Fresh statistics calculated',
    });
  } catch (error) {
    console.error('❌ Server Stats API Fehler:', error);
    res.status(500).json({
      error: 'Fehler beim Berechnen der Server Statistiken',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/silk/trends
 * Hole Silk Trend Daten für Charts
 */
router.get('/trends', async (req, res) => {
  try {
    const days = Math.min(30, Math.max(1, parseInt(req.query.days) || 7));

    console.log(`📈 Admin Silk: Hole ${days} Tage Trend Daten...`);

    const trends = await SilkStatsService.getSilkTrends(days);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('❌ Silk Trends API Fehler:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Silk Trends',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/silk/give
 * Gebe Admin Silk an einen Account
 */
router.post('/give', async (req, res) => {
  try {
    const { targetJID, amount, reason } = req.body;

    if (!targetJID || !amount || amount <= 0) {
      return res.status(400).json({
        error: 'Ungültige Parameter (targetJID, amount > 0 erforderlich)',
      });
    }

    console.log(`🎁 Admin Silk: Gebe ${amount} Silk an JID ${targetJID}`);

    const result = await SilkManagerEnhanced.giveAdminSilk(
      targetJID,
      parseInt(amount),
      reason || 'Admin Silk Gift'
    );

    if (result.success) {
      console.log('✅ Admin Silk erfolgreich vergeben');
      res.json({
        success: true,
        data: result,
      });
    } else {
      console.error('❌ Admin Silk Fehler:', result.error);
      res.status(500).json({
        error: 'Fehler beim Vergeben von Admin Silk',
        details: result.error,
      });
    }
  } catch (error) {
    console.error('❌ Give Silk API Fehler:', error);
    res.status(500).json({
      error: 'Fehler beim Vergeben von Silk',
      details: error.message,
    });
  }
});

/**
 * GET /api/admin/silk/account/:jid
 * Hole detaillierte Silk Informationen für einen Account
 */
router.get('/account/:jid', async (req, res) => {
  try {
    const jid = parseInt(req.params.jid);

    if (!jid) {
      return res.status(400).json({ error: 'Ungültige JID' });
    }

    console.log(`🔍 Silk Details für JID ${jid}`);

    // Hole Account Info
    const accountInfo = await SilkManagerEnhanced.getAccountInfo(jid);

    // Hole Silk Balance
    const silkBalance = await SilkManagerEnhanced.getJCash(jid);

    // Hole Donation History
    const donationHistoryResult = await pool
      .request()
      .input('portalJID', sql.Int, accountInfo.portalJID).query(`
        SELECT TOP 10
          amount,
          silk_amount,
          transaction_id,
          payment_method,
          status,
          created_at
        FROM [SRO_CMS].[dbo].[donate_logs]
        WHERE JID = @portalJID
        ORDER BY created_at DESC
      `);

    res.json({
      success: true,
      data: {
        accountInfo: accountInfo,
        silkBalance: silkBalance,
        donationHistory: donationHistoryResult.recordset,
      },
    });
  } catch (error) {
    console.error('❌ Account Details API Fehler:', error);
    res.status(500).json({
      error: 'Fehler beim Laden der Account Details',
      details: error.message,
    });
  }
});

module.exports = router;
