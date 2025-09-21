/**
 * Silk Cache Service für performante Admin Dashboard Abfragen
 */
class SilkCacheService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 Minuten Cache
    this.isWarming = false;
  }

  /**
   * Hole Silk Balance aus Cache oder DB
   * @param {number} portalJID - Portal JID
   * @returns {Promise<Object>} Silk Balance
   */
  async getSilkBalance(portalJID) {
    const now = Date.now();
    const cacheKey = `silk_${portalJID}`;

    // Prüfe Cache
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey) > now) {
      return this.cache.get(cacheKey);
    }

    // Lade aus DB (wird automatisch gecacht)
    const SilkManagerEnhanced = require('../models/silkManagerEnhanced');
    const silkBalance = await SilkManagerEnhanced.getJCash(portalJID);

    // Cache Ergebnis
    this.cache.set(cacheKey, silkBalance);
    this.cacheExpiry.set(cacheKey, now + this.defaultTTL);

    return silkBalance;
  }

  /**
   * Bulk Silk Balance mit Cache-Optimierung
   * @param {number[]} portalJIDs - Array von Portal JIDs
   * @returns {Promise<Object>} Map von Portal JID zu Silk Balance
   */
  async getBulkSilkBalances(portalJIDs) {
    const now = Date.now();
    const results = {};
    const uncachedJIDs = [];

    // Sammle cached und uncached JIDs
    portalJIDs.forEach((jid) => {
      const cacheKey = `silk_${jid}`;
      if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey) > now) {
        results[jid] = this.cache.get(cacheKey);
      } else {
        uncachedJIDs.push(jid);
      }
    });

    console.log(`📋 Cache: ${Object.keys(results).length} hits, ${uncachedJIDs.length} misses`);

    // Lade fehlende Daten aus DB
    if (uncachedJIDs.length > 0) {
      const SilkManagerEnhanced = require('../models/silkManagerEnhanced');
      const freshData = await SilkManagerEnhanced.getBulkJCash(uncachedJIDs);

      // Cache neue Daten
      Object.entries(freshData).forEach(([jid, balance]) => {
        const cacheKey = `silk_${jid}`;
        this.cache.set(cacheKey, balance);
        this.cacheExpiry.set(cacheKey, now + this.defaultTTL);
        results[jid] = balance;
      });
    }

    return results;
  }

  /**
   * Cache-Statistiken
   */
  getStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cacheExpiry.entries()).filter(
      ([_, expiry]) => expiry > now
    ).length;

    return {
      totalEntries: this.cache.size,
      validEntries: validEntries,
      expiredEntries: this.cache.size - validEntries,
      hitRate: this.hitCount ? this.hitCount / (this.hitCount + this.missCount) : 0,
    };
  }

  /**
   * Cache leeren
   */
  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('🧹 Silk Cache geleert');
  }

  /**
   * Expired Entries automatisch löschen
   */
  cleanup() {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (expiry <= now) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`🧹 Cache Cleanup: ${deletedCount} expired entries gelöscht`);
    }
  }

  /**
   * Cache Warm-up für häufig verwendete Daten
   */
  async warmup() {
    if (this.isWarming) {
      console.log('⏳ Cache Warm-up läuft bereits...');
      return;
    }

    this.isWarming = true;
    console.log('🔥 Cache Warm-up gestartet...');

    try {
      const { pool, poolConnect, sql } = require('../db');
      await poolConnect;

      // Lade Top 100 aktive Accounts
      const result = await pool.request().query(`
        SELECT TOP 100 tb.PortalJID
        FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User] tb
        INNER JOIN [GB_JoymaxPortal].[dbo].[MU_User] mu ON tb.PortalJID = mu.JID
        WHERE tb.PortalJID IS NOT NULL
        ORDER BY mu.LoginDate DESC
      `);

      const topJIDs = result.recordset.map((row) => row.PortalJID);
      await this.getBulkSilkBalances(topJIDs);

      console.log(`🔥 Cache Warm-up abgeschlossen: ${topJIDs.length} Accounts`);
    } catch (error) {
      console.error('❌ Cache Warm-up Fehler:', error.message);
    } finally {
      this.isWarming = false;
    }
  }
}

// Singleton Instance
const silkCacheService = new SilkCacheService();

// Automatisches Cleanup alle 10 Minuten
setInterval(() => {
  silkCacheService.cleanup();
}, 10 * 60 * 1000);

module.exports = silkCacheService;
