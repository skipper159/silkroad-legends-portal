const { pool, poolConnect, sql } = require('../db');

/**
 * Silk Management System nach SRO-CMS Pattern
 * Verwaltet Silk/JCash für Accounts mit korrekter JID-Verknüpfung
 */
class SilkManager {
  /**
   * Gibt Silk/JCash Informationen für einen Account zurück
   * @param {number} jid Portal JID
   * @returns {Promise<Object>} Silk Information
   */
  static async getJCash(jid) {
    await poolConnect;

    try {
      const result = await pool.request().input('JID', sql.Int, jid).query(`
          DECLARE @ReturnValue Int, @PremiumSilk Int, @Silk Int, @VipLevel Int, @UsageMonth Int, @Usage3Month Int;
          SET NOCOUNT ON;
          EXECUTE @ReturnValue = [GB_JoymaxPortal].[dbo].[B_GetJCash] @JID, @PremiumSilk OUTPUT, @Silk OUTPUT, @VipLevel OUTPUT, @UsageMonth OUTPUT, @Usage3Month OUTPUT;
          SELECT @ReturnValue AS ErrorCode, @PremiumSilk AS PremiumSilk, @Silk AS Silk, @UsageMonth AS MonthUsage, @Usage3Month AS ThreeMonthUsage;
        `);

      if (result.recordset.length > 0) {
        const jcash = result.recordset[0];
        return {
          errorCode: jcash.ErrorCode,
          premiumSilk: jcash.PremiumSilk || 0,
          silk: jcash.Silk || 0,
          vipLevel: 0, // Will be set by VIP info if needed
          monthUsage: jcash.MonthUsage || 0,
          threeMonthUsage: jcash.ThreeMonthUsage || 0,
        };
      }

      return {
        errorCode: -1,
        premiumSilk: 0,
        silk: 0,
        vipLevel: 0,
        monthUsage: 0,
        threeMonthUsage: 0,
      };
    } catch (error) {
      console.error('Fehler beim Abrufen der JCash Daten:', error);
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
   * Setzt Silk für einen Account (SILKROAD_R_ACCOUNT.SK_Silk)
   * @param {number} jid Portal JID
   * @param {number} silkType 0=Normal Silk, 1=Premium Silk
   * @param {number} amount Silk Betrag
   */
  static async setSilk(jid, silkType, amount) {
    await poolConnect;

    try {
      // Prüfe ob Silk Eintrag bereits existiert
      const existingResult = await pool.request().input('JID', sql.Int, jid).query(`
          SELECT JID FROM [SILKROAD_R_ACCOUNT].[dbo].[SK_Silk] WHERE JID = @JID
        `);

      if (existingResult.recordset.length > 0) {
        // Update existing record
        await pool.request().input('JID', sql.Int, jid).input('SilkPoint', sql.BigInt, amount)
          .query(`
            UPDATE [SILKROAD_R_ACCOUNT].[dbo].[SK_Silk] 
            SET SilkPoint = @SilkPoint
            WHERE JID = @JID
          `);
      } else {
        // Create new record
        await pool.request().input('JID', sql.Int, jid).input('SilkPoint', sql.BigInt, amount)
          .query(`
            INSERT INTO [SILKROAD_R_ACCOUNT].[dbo].[SK_Silk] (JID, SilkPoint)
            VALUES (@JID, @SilkPoint)
          `);
      }

      console.log(`Silk gesetzt: JID ${jid} -> ${amount} (Type: ${silkType})`);
    } catch (error) {
      console.error('Fehler beim Setzen von Silk:', error);
      throw new Error(`Silk Update Failed: ${error.message}`);
    }
  }

  /**
   * Fügt Silk zu einem Account hinzu (APH_ChangedSilk für History)
   * @param {number} jid Portal JID
   * @param {number} silkType 1=Normal Silk, 3=Premium Silk
   * @param {number} amount Silk Betrag
   */
  static async addSilk(jid, silkType, amount) {
    await poolConnect;

    try {
      // Aktuelle Silk Menge abrufen
      const currentSilk = await this.getJCash(jid);
      let newAmount = 0;

      if (silkType === 1) {
        newAmount = currentSilk.silk + amount;
        await this.setSilk(jid, 0, newAmount);
      } else if (silkType === 3) {
        newAmount = currentSilk.premiumSilk + amount;
        await this.setSilk(jid, 1, newAmount);
      }

      // History Eintrag erstellen
      await pool
        .request()
        .input('JID', sql.Int, jid)
        .input('SilkType', sql.TinyInt, silkType)
        .input('SilkQuantity', sql.BigInt, amount)
        .input('ChangedDate', sql.DateTime, new Date()).query(`
          INSERT INTO [GB_JoymaxPortal].[dbo].[APH_ChangedSilk] 
          (JID, SilkType, SilkQuantity, ChangedDate)
          VALUES (@JID, @SilkType, @SilkQuantity, @ChangedDate)
        `);

      console.log(`Silk hinzugefügt: JID ${jid} -> +${amount} (Type: ${silkType})`);
      return newAmount;
    } catch (error) {
      console.error('Fehler beim Hinzufügen von Silk:', error);
      throw new Error(`Add Silk Failed: ${error.message}`);
    }
  }

  /**
   * Erstellt Donation Log Eintrag
   * @param {number} jid Portal JID
   * @param {string} method Payment Methode (paypal, stripe, etc.)
   * @param {number} amount Dollar Betrag
   * @param {number} silk Silk Betrag
   * @param {string} transactionId Transaction ID
   */
  static async logDonation(jid, method, amount, silk, transactionId) {
    await poolConnect;

    try {
      await pool
        .request()
        .input('jid', sql.Int, jid)
        .input('method', sql.NVarChar, method)
        .input('amount', sql.Decimal(10, 2), amount)
        .input('silk', sql.Int, silk)
        .input('transaction_id', sql.NVarChar, transactionId)
        .input('status', sql.NVarChar, 'completed')
        .input('created_at', sql.DateTime, new Date())
        .input('updated_at', sql.DateTime, new Date()).query(`
          INSERT INTO donate_logs (jid, method, amount, silk, transaction_id, status, created_at, updated_at)
          VALUES (@jid, @method, @amount, @silk, @transaction_id, @status, @created_at, @updated_at)
        `);

      console.log(`Donation geloggt: JID ${jid} -> $${amount} = ${silk} Silk`);
    } catch (error) {
      console.error('Fehler beim Logging der Donation:', error);
      throw new Error(`Donation Log Failed: ${error.message}`);
    }
  }

  /**
   * Verarbeitet eine PayPal Donation
   * @param {number} jid Portal JID
   * @param {number} amount Dollar Betrag
   * @param {string} transactionId PayPal Transaction ID
   * @param {number} silkRate Silk pro Dollar (default: 100)
   */
  static async processPayPalDonation(jid, amount, transactionId, silkRate = 100) {
    await poolConnect;

    const transaction = pool.transaction();

    try {
      await transaction.begin();

      const silkAmount = Math.floor(amount * silkRate);

      // Silk hinzufügen (Premium Silk für Donations)
      await this.addSilk(jid, 3, silkAmount);

      // Donation loggen
      await this.logDonation(jid, 'paypal', amount, silkAmount, transactionId);

      await transaction.commit();

      console.log(
        `✅ PayPal Donation verarbeitet: JID ${jid} -> $${amount} = ${silkAmount} Premium Silk`
      );

      return {
        success: true,
        jid: jid,
        amount: amount,
        silk: silkAmount,
        transactionId: transactionId,
      };
    } catch (error) {
      await transaction.rollback();
      console.error('❌ PayPal Donation Verarbeitung fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Erstellt Vote Points für einen Account
   * @param {number} jid Portal JID
   * @param {number} points Vote Points
   * @param {string} site Vote Site Name
   */
  static async addVotePoints(jid, points, site) {
    await poolConnect;

    try {
      // Update user points in SRO_CMS users table
      await pool.request().input('jid', sql.Int, jid).input('points', sql.Int, points).query(`
          UPDATE users 
          SET points = points + @points,
              updated_at = GETDATE()
          WHERE jid = @jid
        `);

      // Log vote entry
      await pool
        .request()
        .input('jid', sql.Int, jid)
        .input('site', sql.NVarChar, site)
        .input('points', sql.Int, points)
        .input('created_at', sql.DateTime, new Date()).query(`
          INSERT INTO vote_logs (jid, site, points, created_at)
          VALUES (@jid, @site, @points, @created_at)
        `);

      console.log(`Vote Points hinzugefügt: JID ${jid} -> +${points} (Site: ${site})`);
    } catch (error) {
      console.error('Fehler beim Hinzufügen von Vote Points:', error);
      throw new Error(`Vote Points Failed: ${error.message}`);
    }
  }
}

module.exports = SilkManager;
