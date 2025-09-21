const { pool, poolConnect, sql } = require('../db');
const SilkManagerEnhanced = require('../models/silkManagerEnhanced');

class SilkStatsService {
  constructor() {
    this.cacheTimeout = 3600000; // 1 hour in milliseconds
    this.lastCalculation = null;
    this.cachedStats = null;
  }

  async ensureConnection() {
    await poolConnect;
  }

  /**
   * Erstelle Silk Statistics Tabellen falls sie nicht existieren
   */
  async ensureTablesExist() {
    await this.ensureConnection();

    try {
      // Prüfe ob silk_server_stats Tabelle in SRO_CMS existiert
      const tableCheck = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM [SRO_CMS].INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo' 
        AND TABLE_NAME = 'silk_server_stats'
      `);

      if (tableCheck.recordset[0].count === 0) {
        console.log('🔧 Erstelle silk_server_stats Tabelle in SRO_CMS...');

        await pool.request().query(`
          CREATE TABLE [SRO_CMS].[dbo].[silk_server_stats] (
              [id] [int] IDENTITY(1,1) NOT NULL,
              [total_premium_silk] [bigint] NOT NULL DEFAULT 0,
              [total_silk] [bigint] NOT NULL DEFAULT 0,
              [total_accounts] [int] NOT NULL DEFAULT 0,
              [accounts_with_silk] [int] NOT NULL DEFAULT 0,
              [vip_accounts] [int] NOT NULL DEFAULT 0,
              [total_donations] [int] NOT NULL DEFAULT 0,
              [total_donated_usd] [decimal](18,2) NOT NULL DEFAULT 0,
              [total_donated_silk] [bigint] NOT NULL DEFAULT 0,
              [unique_donors] [int] NOT NULL DEFAULT 0,
              [calculation_duration_seconds] [int] NULL,
              [last_calculated] [datetime2](7) NOT NULL DEFAULT GETDATE(),
              [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
              CONSTRAINT [PK_silk_server_stats] PRIMARY KEY CLUSTERED ([id] ASC)
          )
        `);

        console.log('✅ silk_server_stats Tabelle erstellt');
      }

      // Prüfe ob silk_account_cache Tabelle existiert
      const cacheCheck = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo' 
        AND TABLE_NAME = 'silk_account_cache'
      `);

      if (cacheCheck.recordset[0].count === 0) {
        console.log('🔧 Erstelle silk_account_cache Tabelle...');

        await pool.request().query(`
          CREATE TABLE [dbo].[silk_account_cache] (
              [portal_jid] [int] NOT NULL,
              [premium_silk] [int] NOT NULL DEFAULT 0,
              [silk] [int] NOT NULL DEFAULT 0,
              [vip_level] [tinyint] NOT NULL DEFAULT 0,
              [error_code] [int] NOT NULL DEFAULT 0,
              [last_updated] [datetime2](7) NOT NULL DEFAULT GETDATE(),
              CONSTRAINT [PK_silk_account_cache] PRIMARY KEY CLUSTERED ([portal_jid] ASC)
          )
        `);

        console.log('✅ silk_account_cache Tabelle erstellt');
      }
    } catch (error) {
      console.error('❌ Fehler beim Erstellen der Silk Stats Tabellen:', error.message);
      throw error;
    }
  }

  /**
   * Hole die neuesten Server Statistiken (cached oder fresh)
   */
  async getServerStats(forceRefresh = false) {
    await this.ensureTablesExist();

    try {
      // Prüfe Cache
      if (!forceRefresh && this.cachedStats && this.lastCalculation) {
        const timeSinceLastCalc = Date.now() - this.lastCalculation.getTime();
        if (timeSinceLastCalc < this.cacheTimeout) {
          console.log('📊 Verwende cached Server Stats');
          return {
            ...this.cachedStats,
            cached: true,
            lastCalculated: this.lastCalculation,
          };
        }
      }

      // Prüfe DB Cache
      const dbCacheResult = await pool.request().query(`
        SELECT TOP 1 *
        FROM [SRO_CMS].[dbo].[silk_server_stats]
        ORDER BY last_calculated DESC
      `);

      if (dbCacheResult.recordset.length > 0 && !forceRefresh) {
        const latest = dbCacheResult.recordset[0];
        const lastCalc = new Date(latest.last_calculated);
        const timeSinceLastCalc = Date.now() - lastCalc.getTime();

        if (timeSinceLastCalc < this.cacheTimeout) {
          console.log('📊 Verwende DB cached Server Stats');
          return {
            totalPremiumSilk: latest.total_premium_silk,
            totalSilk: latest.total_silk,
            totalSilkValue: latest.total_premium_silk + latest.total_silk,
            totalAccounts: latest.total_accounts,
            accountsWithSilk: latest.accounts_with_silk,
            vipAccounts: latest.vip_accounts,
            donations: {
              totalDonations: latest.total_donations,
              totalDonatedUSD: parseFloat(latest.total_donated_usd),
              totalDonatedSilk: latest.total_donated_silk,
              uniqueDonors: latest.unique_donors,
            },
            calculationDuration: latest.calculation_duration_seconds,
            lastCalculated: lastCalc,
            cached: true,
          };
        }
      }

      // Berechne neue Statistiken
      console.log('🔄 Berechne neue Server Silk Statistiken...');
      return await this.calculateFreshStats();
    } catch (error) {
      console.error('❌ Fehler beim Abrufen der Server Stats:', error.message);
      throw error;
    }
  }

  /**
   * Berechne frische Server Statistiken
   */
  async calculateFreshStats() {
    const startTime = Date.now();

    try {
      // Hole alle Portal JIDs
      const portalJIDsResult = await pool.request().query(`
        SELECT DISTINCT PortalJID
        FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User]
        WHERE PortalJID IS NOT NULL
      `);

      const portalJIDs = portalJIDsResult.recordset.map((row) => row.PortalJID);
      console.log(`🔍 Analysiere ${portalJIDs.length} Portal Accounts...`);

      // Batch Silk Balance Calculation
      let totalPremiumSilk = 0;
      let totalSilk = 0;
      let totalAccounts = 0;
      let accountsWithSilk = 0;
      let vipAccounts = 0;

      // Process in chunks to avoid timeout
      const chunkSize = 20; // Smaller chunks for better performance
      for (let i = 0; i < portalJIDs.length; i += chunkSize) {
        const chunk = portalJIDs.slice(i, i + chunkSize);

        const chunkResults = await Promise.all(
          chunk.map(async (portalJID) => {
            try {
              const balance = await SilkManagerEnhanced.getJCash(portalJID);
              return { portalJID, ...balance };
            } catch (error) {
              console.error(`❌ Fehler bei Portal JID ${portalJID}:`, error.message);
              return { portalJID, premiumSilk: 0, silk: 0, vipLevel: 0, errorCode: -1 };
            }
          })
        );

        // Aktualisiere Account Cache
        for (const result of chunkResults) {
          if (result.errorCode === 0) {
            totalPremiumSilk += result.premiumSilk;
            totalSilk += result.silk;
            totalAccounts++;

            if (result.premiumSilk > 0 || result.silk > 0) {
              accountsWithSilk++;
            }

            if (result.vipLevel > 0) {
              vipAccounts++;
            }

            // Cache in DB
            await this.updateAccountCache(result);
          }
        }

        // Progress logging
        const processed = Math.min(i + chunkSize, portalJIDs.length);
        console.log(`📈 Fortschritt: ${processed}/${portalJIDs.length} Accounts analysiert`);
      }

      // Hole Donation Statistiken aus SRO_CMS Datenbank
      const donationStatsResult = await pool.request().query(`
        SELECT 
          COUNT(*) as totalDonations,
          COALESCE(SUM(amount), 0) as totalDonatedUSD,
          COALESCE(SUM(value), 0) as totalDonatedSilk,
          COUNT(DISTINCT JID) as uniqueDonors
        FROM [SRO_CMS].[dbo].[donate_logs]
        WHERE status = 'completed'
      `);

      const donationStats = donationStatsResult.recordset[0];
      const endTime = Date.now();
      const calculationDuration = Math.round((endTime - startTime) / 1000);

      const serverStats = {
        totalPremiumSilk: totalPremiumSilk,
        totalSilk: totalSilk,
        totalSilkValue: totalPremiumSilk + totalSilk,
        totalAccounts: totalAccounts,
        accountsWithSilk: accountsWithSilk,
        vipAccounts: vipAccounts,
        donations: {
          totalDonations: donationStats.totalDonations,
          totalDonatedUSD: parseFloat(donationStats.totalDonatedUSD || 0),
          totalDonatedSilk: donationStats.totalDonatedSilk,
          uniqueDonors: donationStats.uniqueDonors,
        },
        calculationDuration: calculationDuration,
        lastCalculated: new Date(),
        cached: false,
      };

      // Speichere in DB
      await this.saveStatsToDb(serverStats);

      // Update Memory Cache
      this.cachedStats = serverStats;
      this.lastCalculation = new Date();

      console.log(`📊 Server Silk Statistiken berechnet in ${calculationDuration} Sekunden`);
      return serverStats;
    } catch (error) {
      console.error('❌ Fehler bei Fresh Stats Berechnung:', error.message);
      throw error;
    }
  }

  /**
   * Aktualisiere Account Cache
   */
  async updateAccountCache(accountData) {
    try {
      await pool
        .request()
        .input('portalJID', sql.Int, accountData.portalJID)
        .input('premiumSilk', sql.Int, accountData.premiumSilk)
        .input('silk', sql.Int, accountData.silk)
        .input('vipLevel', sql.TinyInt, accountData.vipLevel)
        .input('errorCode', sql.Int, accountData.errorCode).query(`
          MERGE [silk_account_cache] AS target
          USING (SELECT @portalJID as portal_jid) AS source ON target.portal_jid = source.portal_jid
          WHEN MATCHED THEN
            UPDATE SET 
              premium_silk = @premiumSilk,
              silk = @silk,
              vip_level = @vipLevel,
              error_code = @errorCode,
              last_updated = GETDATE()
          WHEN NOT MATCHED THEN
            INSERT (portal_jid, premium_silk, silk, vip_level, error_code, last_updated)
            VALUES (@portalJID, @premiumSilk, @silk, @vipLevel, @errorCode, GETDATE());
        `);
    } catch (error) {
      console.error(
        `❌ Account Cache Update Fehler für JID ${accountData.portalJID}:`,
        error.message
      );
    }
  }

  /**
   * Speichere Server Stats in DB
   */
  async saveStatsToDb(stats) {
    try {
      await pool
        .request()
        .input('totalPremiumSilk', sql.BigInt, stats.totalPremiumSilk)
        .input('totalSilk', sql.BigInt, stats.totalSilk)
        .input('totalAccounts', sql.Int, stats.totalAccounts)
        .input('accountsWithSilk', sql.Int, stats.accountsWithSilk)
        .input('vipAccounts', sql.Int, stats.vipAccounts)
        .input('totalDonations', sql.Int, stats.donations.totalDonations)
        .input('totalDonatedUSD', sql.Decimal(18, 2), stats.donations.totalDonatedUSD)
        .input('totalDonatedSilk', sql.BigInt, stats.donations.totalDonatedSilk)
        .input('uniqueDonors', sql.Int, stats.donations.uniqueDonors)
        .input('calculationDuration', sql.Int, stats.calculationDuration).query(`
          INSERT INTO [SRO_CMS].[dbo].[silk_server_stats] (
            total_premium_silk, total_silk, total_accounts, accounts_with_silk,
            vip_accounts, total_donations, total_donated_usd, total_donated_silk,
            unique_donors, calculation_duration_seconds, last_calculated
          ) VALUES (
            @totalPremiumSilk, @totalSilk, @totalAccounts, @accountsWithSilk,
            @vipAccounts, @totalDonations, @totalDonatedUSD, @totalDonatedSilk,
            @uniqueDonors, @calculationDuration, GETDATE()
          )
        `);

      // Lösche alte Einträge (behalte nur die letzten 50)
      await pool.request().query(`
        DELETE FROM [SRO_CMS].[dbo].[silk_server_stats] 
        WHERE id NOT IN (
          SELECT TOP 50 id 
          FROM [SRO_CMS].[dbo].[silk_server_stats] 
          ORDER BY last_calculated DESC
        )
      `);
    } catch (error) {
      console.error('❌ DB Save Stats Fehler:', error.message);
    }
  }

  /**
   * Hole Silk Trend Daten
   */
  async getSilkTrends(days = 7) {
    await this.ensureTablesExist();

    try {
      const result = await pool.request().input('days', sql.Int, days).query(`
          SELECT 
            total_premium_silk,
            total_silk,
            (total_premium_silk + total_silk) as total_silk_value,
            total_accounts,
            accounts_with_silk,
            last_calculated
          FROM [SRO_CMS].[dbo].[silk_server_stats]
          WHERE last_calculated >= DATEADD(day, -@days, GETDATE())
          ORDER BY last_calculated ASC
        `);

      return result.recordset.map((row) => ({
        totalPremiumSilk: row.total_premium_silk,
        totalSilk: row.total_silk,
        totalSilkValue: row.total_silk_value,
        totalAccounts: row.total_accounts,
        accountsWithSilk: row.accounts_with_silk,
        timestamp: row.last_calculated,
      }));
    } catch (error) {
      console.error('❌ Silk Trends Fehler:', error.message);
      return [];
    }
  }

  /**
   * Hole nur cached Server Statistiken (KEINE Live-Berechnung)
   * @returns {Promise<Object|null>} Cached Stats oder null wenn nicht verfügbar
   */
  async getCachedServerStats() {
    await this.ensureConnection();

    try {
      console.log('📊 Lade cached Server Statistiken...');

      const result = await pool.request().query(`
        SELECT TOP 1 
          total_premium_silk,
          total_silk,
          (total_premium_silk + total_silk) as total_silk_value,
          total_accounts,
          accounts_with_silk,
          vip_accounts,
          total_donations,
          total_donated_usd,
          total_donated_silk,
          unique_donors,
          calculation_duration_seconds,
          last_calculated
        FROM [SRO_CMS].[dbo].[silk_server_stats] 
        ORDER BY last_calculated DESC
      `);

      if (result.recordset.length > 0) {
        const stats = result.recordset[0];
        const serverStats = {
          totalPremiumSilk: parseInt(stats.total_premium_silk) || 0,
          totalSilk: parseInt(stats.total_silk) || 0,
          totalSilkValue: parseInt(stats.total_silk_value) || 0,
          totalAccounts: parseInt(stats.total_accounts) || 0,
          accountsWithSilk: parseInt(stats.accounts_with_silk) || 0,
          vipAccounts: parseInt(stats.vip_accounts) || 0,
          donations: {
            totalDonations: parseInt(stats.total_donations) || 0,
            totalDonatedUSD: parseFloat(stats.total_donated_usd) || 0,
            totalDonatedSilk: parseInt(stats.total_donated_silk) || 0,
            uniqueDonors: parseInt(stats.unique_donors) || 0,
          },
          calculationDuration: parseInt(stats.calculation_duration_seconds) || 0,
          lastCalculated: stats.last_calculated,
          cached: true,
        };

        console.log('✅ Cached Server Statistiken geladen:', {
          totalSilkValue: serverStats.totalSilkValue,
          accounts: serverStats.totalAccounts,
          lastCalculated: stats.last_calculated,
        });

        return serverStats;
      }

      console.log('⚠️ Keine cached Server Statistiken verfügbar');
      return null;
    } catch (error) {
      console.error('❌ getCachedServerStats Fehler:', error.message);
      throw error;
    }
  }
}

module.exports = new SilkStatsService();
