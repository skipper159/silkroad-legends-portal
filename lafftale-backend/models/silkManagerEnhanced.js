const { pool, poolConnect, sql } = require('../db');

class SilkManagerEnhanced {
  constructor() {
    this.connected = false;
  }

  async ensureConnection() {
    if (!this.connected) {
      await poolConnect;
      this.connected = true;
    }
  }

  /**
   * Konvertiert Game JID (TB_User.JID) zu Portal JID (TB_User.PortalJID = MU_User.JID)
   * @param {number} jid - Game JID oder Portal JID
   * @param {string} context - Optional: 'game' wenn bekannt dass es Game JID ist
   * @returns {Promise<number>} Portal JID für Silk-Operationen
   */
  async resolvePortalJID(jid, context = 'auto') {
    await this.ensureConnection();

    try {
      // Wenn explizit als Game JID markiert, direkt zur Portal JID konvertieren
      if (context === 'game') {
        const gameCheck = await pool.request().input('gameJid', sql.Int, jid).query(`
            SELECT JID as GameJID, StrUserID, PortalJID 
            FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User] 
            WHERE JID = @gameJid AND PortalJID IS NOT NULL
          `);

        if (gameCheck.recordset.length > 0) {
          const portalJID = gameCheck.recordset[0].PortalJID;
          console.log(
            `🔄 Game JID ${jid} (${gameCheck.recordset[0].StrUserID}) → Portal JID ${portalJID}`
          );
          return portalJID;
        }
        throw new Error(`Game JID ${jid} nicht gefunden oder hat keine PortalJID`);
      }

      // Auto-Modus: Prüfe zuerst ob JID im Game System existiert (primäre Logik)
      const gameCheck = await pool.request().input('gameJid', sql.Int, jid).query(`
          SELECT JID as GameJID, StrUserID, PortalJID 
          FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User] 
          WHERE JID = @gameJid AND PortalJID IS NOT NULL
        `);

      if (gameCheck.recordset.length > 0) {
        const portalJID = gameCheck.recordset[0].PortalJID;
        console.log(
          `🔄 Game JID ${jid} (${gameCheck.recordset[0].StrUserID}) → Portal JID ${portalJID}`
        );
        return portalJID;
      }

      // Fallback: Prüfe ob JID bereits eine Portal JID ist
      const portalCheck = await pool.request().input('jid', sql.Int, jid).query(`
          SELECT JID, UserID 
          FROM [GB_JoymaxPortal].[dbo].[MU_User] 
          WHERE JID = @jid
        `);

      if (portalCheck.recordset.length > 0) {
        console.log(`✅ JID ${jid} ist Portal JID (${portalCheck.recordset[0].UserID})`);
        return jid;
      }

      throw new Error(`JID ${jid} existiert weder als Game JID noch als Portal JID`);
    } catch (error) {
      console.error('❌ JID Resolution Fehler:', error.message);
      throw error;
    }
  }

  /**
   * Bulk Silk Balance Abfrage für mehrere Portal JIDs (optimiert für Admin Dashboard)
   * @param {number[]} portalJIDs - Array von Portal JIDs
   * @returns {Promise<Object>} Map von Portal JID zu Silk Balance
   */
  async getBulkJCash(portalJIDs) {
    await this.ensureConnection();

    if (!Array.isArray(portalJIDs) || portalJIDs.length === 0) {
      return {};
    }

    try {
      console.log(`💰 Bulk Silk Query für ${portalJIDs.length} Portal JIDs...`);

      // Erstelle IN-Clause für Bulk-Abfrage
      const jidList = portalJIDs.map((jid) => parseInt(jid)).filter((jid) => !isNaN(jid));
      const placeholders = jidList.map((_, index) => `@jid${index}`).join(',');

      const request = pool.request();
      jidList.forEach((jid, index) => {
        request.input(`jid${index}`, sql.Int, jid);
      });

      // Optimierte Bulk-Abfrage direkt auf SK_Silk Tabelle
      const result = await request.query(`
        SELECT 
          JID,
          ISNULL(silk_own, 0) as PremiumSilk,
          ISNULL(silk_gift, 0) as Silk,
          0 as VipLevel,
          0 as MonthUsage,
          0 as ThreeMonthUsage,
          0 as ErrorCode
        FROM [GB_JoymaxPortal].[dbo].[SK_Silk] 
        WHERE JID IN (${placeholders})
        ORDER BY JID
      `);

      const silkMap = {};

      // Initialisiere alle JIDs mit Null-Werten
      jidList.forEach((jid) => {
        silkMap[jid] = {
          errorCode: 0,
          premiumSilk: 0,
          silk: 0,
          vipLevel: 0,
          monthUsage: 0,
          threeMonthUsage: 0,
        };
      });

      // Überschreibe mit echten Daten wo verfügbar
      result.recordset.forEach((row) => {
        silkMap[row.JID] = {
          errorCode: row.ErrorCode,
          premiumSilk: row.PremiumSilk || 0,
          silk: row.Silk || 0,
          vipLevel: row.VipLevel || 0,
          monthUsage: row.MonthUsage || 0,
          threeMonthUsage: row.ThreeMonthUsage || 0,
        };
      });

      console.log(`✅ Bulk Silk Query abgeschlossen: ${Object.keys(silkMap).length} Ergebnisse`);
      return silkMap;
    } catch (error) {
      console.error('❌ getBulkJCash Fehler:', error.message);

      // Fallback: Einzelne Abfragen mit Rate Limiting (Batches von 5)
      const results = {};
      const batchSize = 5;

      for (let i = 0; i < portalJIDs.length; i += batchSize) {
        const batch = portalJIDs.slice(i, i + batchSize);
        const batchPromises = batch.map(async (jid) => {
          try {
            const result = await this.getJCash(jid);
            return { jid, result };
          } catch (err) {
            return {
              jid,
              result: {
                errorCode: -1,
                premiumSilk: 0,
                silk: 0,
                vipLevel: 0,
                monthUsage: 0,
                threeMonthUsage: 0,
              },
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(({ jid, result }) => {
          results[jid] = result;
        });

        // Rate limiting zwischen Batches (100ms Pause)
        if (i + batchSize < portalJIDs.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return results;
    }
  }

  /**
   * Hole Silk Balance für beliebige JID (Game oder Portal)
   * @param {number} jid - Game JID oder Portal JID
   * @returns {Promise<Object>} Silk Balance Daten
   */
  async getJCash(jid) {
    await this.ensureConnection();

    try {
      // Konvertiere zu Portal JID falls nötig
      const portalJID = await this.resolvePortalJID(jid);

      // Verwende das exakte SQL Pattern aus SilkManagerCompatible
      const result = await pool.request().input('JID', sql.Int, portalJID).query(`
          DECLARE @ReturnValue Int, @PremiumSilk Int, @Silk Int, @VipLevel Int, @UsageMonth Int, @Usage3Month Int;
          SET NOCOUNT ON;
          EXECUTE @ReturnValue = [GB_JoymaxPortal].[dbo].[B_GetJCash] @JID, @PremiumSilk OUTPUT, @Silk OUTPUT, @VipLevel OUTPUT, @UsageMonth OUTPUT, @Usage3Month OUTPUT;
          SELECT @ReturnValue AS ErrorCode, @PremiumSilk AS PremiumSilk, @Silk AS Silk, @VipLevel AS VipLevel, @UsageMonth AS MonthUsage, @Usage3Month AS ThreeMonthUsage;
        `);

      if (result.recordset.length > 0) {
        const jcash = result.recordset[0];
        console.log(`💰 Silk Balance für Portal JID ${portalJID}:`, {
          premiumSilk: jcash.PremiumSilk,
          silk: jcash.Silk,
          vipLevel: jcash.VipLevel,
        });
        return {
          errorCode: jcash.ErrorCode,
          premiumSilk: jcash.PremiumSilk || 0,
          silk: jcash.Silk || 0,
          vipLevel: jcash.VipLevel || 0,
          monthUsage: jcash.MonthUsage || 0,
          threeMonthUsage: jcash.ThreeMonthUsage || 0,
        };
      }

      return {
        errorCode: -131076,
        premiumSilk: 0,
        silk: 0,
        vipLevel: 0,
        monthUsage: 0,
        threeMonthUsage: 0,
      };
    } catch (error) {
      console.error('❌ getJCash Fehler:', error.message);
      return {
        errorCode: -1,
        premiumSilk: 0,
        silk: 0,
        vipLevel: 0,
        monthUsage: 0,
        threeMonthUsage: 0,
      };
    }
  }

  /**
   * Gebe Admin Silk für beliebige JID (Game oder Portal)
   * @param {number} jid - Game JID oder Portal JID
   * @param {number} amount - Silk Menge
   * @param {string} reason - Admin Grund
   * @returns {Promise<Object>} Ergebnis
   */
  async giveAdminSilk(jid, amount, reason = 'Admin Silk') {
    await this.ensureConnection();

    try {
      // Konvertiere zu Portal JID falls nötig
      const portalJID = await this.resolvePortalJID(jid);

      const result = await pool
        .request()
        .input('JID', sql.Int, portalJID)
        .input('Silk', sql.Int, amount)
        .input('SilkType', sql.TinyInt, 2) // 2 = Premium Silk
        .input('Reason', sql.VarChar, reason)
        .execute('[GB_JoymaxPortal].[dbo].[M_SetExtraSilk]');

      console.log(`🎁 Admin Silk vergeben: ${amount} Silk für Portal JID ${portalJID}`);

      return {
        success: true,
        portalJID: portalJID,
        amount: amount,
        reason: reason,
      };
    } catch (error) {
      console.error('❌ giveAdminSilk Fehler:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * PayPal Donation verarbeiten für beliebige JID (Game oder Portal)
   * @param {number} jid - Game JID oder Portal JID
   * @param {number} amount - Donation Betrag in USD
   * @param {string} transactionId - PayPal Transaction ID
   * @returns {Promise<Object>} Ergebnis
   */
  async processPayPalDonation(jid, amount, transactionId) {
    await this.ensureConnection();

    try {
      // Konvertiere zu Portal JID falls nötig
      const portalJID = await this.resolvePortalJID(jid);

      // Berechne Silk basierend auf USD (1 USD = 100 Silk)
      const silkAmount = Math.floor(amount * 100);

      // Gebe Silk
      const silkResult = await pool
        .request()
        .input('JID', sql.Int, portalJID)
        .input('Silk', sql.Int, silkAmount)
        .input('SilkType', sql.TinyInt, 2) // 2 = Premium Silk
        .input('Reason', sql.VarChar, `PayPal Donation - ${transactionId}`)
        .execute('[GB_JoymaxPortal].[dbo].[M_SetExtraSilk]');

      // Log Donation in SRO_CMS
      await pool
        .request()
        .input('JID', sql.Int, portalJID)
        .input('amount', sql.Decimal(10, 2), amount)
        .input('silk_amount', sql.Int, silkAmount)
        .input('transaction_id', sql.VarChar, transactionId)
        .input('status', sql.VarChar, 'completed')
        .input('payment_method', sql.VarChar, 'paypal').query(`
          INSERT INTO [SRO_CMS].[dbo].[donate_logs] 
          (JID, amount, silk_amount, transaction_id, status, payment_method, created_at)
          VALUES (@JID, @amount, @silk_amount, @transaction_id, @status, @payment_method, GETDATE())
        `);

      console.log(
        `💸 PayPal Donation verarbeitet: $${amount} → ${silkAmount} Silk für Portal JID ${portalJID}`
      );

      return {
        success: true,
        portalJID: portalJID,
        usdAmount: amount,
        silkAmount: silkAmount,
        transactionId: transactionId,
      };
    } catch (error) {
      console.error('❌ processPayPalDonation Fehler:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Hole Account Info für beliebige JID (Game oder Portal)
   * @param {number} jid - Game JID oder Portal JID
   * @returns {Promise<Object>} Account Informationen
   */
  async getAccountInfo(jid) {
    await this.ensureConnection();

    try {
      // Konvertiere zu Portal JID falls nötig
      const portalJID = await this.resolvePortalJID(jid);

      // Hole Portal Info (verwende korrekte Spaltennamen)
      const portalInfo = await pool.request().input('jid', sql.Int, portalJID).query(`
          SELECT JID, UserID, NickName, Birthday, LoginDate 
          FROM [GB_JoymaxPortal].[dbo].[MU_User] 
          WHERE JID = @jid
        `);

      // Hole Game Info falls verfügbar
      const gameInfo = await pool.request().input('portalJid', sql.Int, portalJID).query(`
          SELECT JID as GameJID, StrUserID, RegDate as GameRegDate 
          FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User] 
          WHERE PortalJID = @portalJid
        `);

      const account = {
        portalJID: portalJID,
        username: portalInfo.recordset[0]?.UserID,
        nickname: portalInfo.recordset[0]?.NickName,
        birthday: portalInfo.recordset[0]?.Birthday,
        lastLogin: portalInfo.recordset[0]?.LoginDate,
        gameJID: gameInfo.recordset[0]?.GameJID || null,
        gameRegDate: gameInfo.recordset[0]?.GameRegDate || null,
      };

      console.log(`👤 Account Info für Portal JID ${portalJID}:`, account);
      return account;
    } catch (error) {
      console.error('❌ getAccountInfo Fehler:', error.message);
      throw error;
    }
  }
}

module.exports = new SilkManagerEnhanced();
