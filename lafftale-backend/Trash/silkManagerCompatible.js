const { pool, poolConnect, sql } = require('../db');

/**
 * GB_JoymaxPortal kompatible Silk Management System
 * Vollständige Integration in das bestehende Silk-Infrastruktursystem
 */
class SilkManagerCompatible {
  /**
   * Gibt Silk/JCash Informationen für einen Account zurück
   * Verwendet die originale B_GetJCash Stored Procedure
   * @param {number} jid Portal JID
   * @returns {Promise<Object>} Silk Information
   */
  static async getJCash(jid) {
    await poolConnect;
    
    try {
      const result = await pool
        .request()
        .input('JID', sql.Int, jid)
        .query(`
          DECLARE @ReturnValue Int, @PremiumSilk Int, @Silk Int, @VipLevel Int, @UsageMonth Int, @Usage3Month Int;
          SET NOCOUNT ON;
          EXECUTE @ReturnValue = [GB_JoymaxPortal].[dbo].[B_GetJCash] @JID, @PremiumSilk OUTPUT, @Silk OUTPUT, @VipLevel OUTPUT, @UsageMonth OUTPUT, @Usage3Month OUTPUT;
          SELECT @ReturnValue AS ErrorCode, @PremiumSilk AS PremiumSilk, @Silk AS Silk, @VipLevel AS VipLevel, @UsageMonth AS MonthUsage, @Usage3Month AS ThreeMonthUsage;
        `);
      
      if (result.recordset.length > 0) {
        const jcash = result.recordset[0];
        return {
          errorCode: jcash.ErrorCode,
          premiumSilk: jcash.PremiumSilk || 0,
          silk: jcash.Silk || 0,
          vipLevel: jcash.VipLevel || 0,
          monthUsage: jcash.MonthUsage || 0,
          threeMonthUsage: jcash.ThreeMonthUsage || 0
        };
      }
      
      return { errorCode: -131076, premiumSilk: 0, silk: 0, vipLevel: 0, monthUsage: 0, threeMonthUsage: 0 };
      
    } catch (error) {
      console.error('❌ Fehler beim Abrufen der JCash Daten:', error);
      return { errorCode: -1, premiumSilk: 0, silk: 0, vipLevel: 0, monthUsage: 0, threeMonthUsage: 0 };
    }
  }

  /**
   * Gibt Admin Silk (Gift Silk) über die M_SetExtraSilk Procedure
   * Diese Methode nutzt das vollständige GB_JoymaxPortal Silk-System
   * @param {number} managerJID Manager JID (für Audit Trail)
   * @param {number} targetJID Ziel-Account JID
   * @param {number} amount Silk Betrag
   * @param {number} silkType 1=Normal Gift Silk, 4=Premium Gift Silk
   * @param {string} message Log Message
   * @param {number} grCode Gift Reason Code (aus K_SilkGiftReason)
   * @returns {Promise<Object>} Result
   */
  static async giveAdminSilk(managerJID, targetJID, amount, silkType, message, grCode = 1) {
    await poolConnect;
    
    try {
      const result = await pool
        .request()
        .input('ManagerJID', sql.Int, managerJID)
        .input('JID', sql.Int, targetJID)
        .input('Amount', sql.Int, amount)
        .input('SilkType', sql.TinyInt, silkType)
        .input('ManagerIP', sql.Binary, Buffer.from([127, 0, 0, 1])) // Localhost IP
        .input('GRCode', sql.SmallInt, grCode)
        .input('MessageForLog', sql.VarChar, message)
        .query(`
          DECLARE @ReturnValue int;
          EXECUTE @ReturnValue = [GB_JoymaxPortal].[dbo].[M_SetExtraSilk] 
            @ManagerJID, @JID, @Amount, @SilkType, @ManagerIP, @GRCode, @MessageForLog;
          SELECT @ReturnValue AS ErrorCode;
        `);
      
      const errorCode = result.recordset[0].ErrorCode;
      
      if (errorCode === 0) {
        console.log(`✅ Admin Silk gegeben: JID ${targetJID} -> +${amount} (Type: ${silkType})`);
        return { success: true, errorCode: 0, message: 'Silk erfolgreich hinzugefügt' };
      } else {
        console.error(`❌ Admin Silk fehlgeschlagen: ErrorCode ${errorCode}`);
        return { success: false, errorCode, message: this.getErrorMessage(errorCode) };
      }
      
    } catch (error) {
      console.error('❌ Fehler beim Geben von Admin Silk:', error);
      return { success: false, errorCode: -1, message: error.message };
    }
  }

  /**
   * Verarbeitet eine PayPal Donation mit vollständiger GB_JoymaxPortal Integration
   * Erstellt korrekte APH_Details und APH_ChangedSilk Einträge
   * @param {number} jid Portal JID
   * @param {number} amount Dollar Betrag
   * @param {string} transactionId PayPal Transaction ID
   * @param {number} silkRate Silk pro Dollar (default: 100)
   * @param {number} managerJID Manager JID für Admin-Transaktionen (default: 1)
   */
  static async processPayPalDonation(jid, amount, transactionId, silkRate = 100, managerJID = 1) {
    await poolConnect;
    
    const transaction = pool.transaction();
    
    try {
      await transaction.begin();
      
      const silkAmount = Math.floor(amount * silkRate);
      const currentDate = new Date();
      const invoiceID = `PAY${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}${String(currentDate.getSeconds()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      // APH_Details Eintrag erstellen (Payment Record)
      await transaction.request()
        .input('InvoiceID', sql.VarChar, invoiceID)
        .input('PaymentDate', sql.DateTime, currentDate)
        .input('StatusCode', sql.Int, 5000) // Success Status
        .input('PMCode', sql.Int, 98) // PayPal Payment Method
        .input('SolutionCode', sql.Int, 98) // Custom Payment Solution
        .input('PGStatusCode', sql.Int, 1000)
        .input('JID', sql.Int, jid)
        .input('PayerEmail', sql.VarChar, '')
        .input('PayerIP', sql.Binary, Buffer.from([127, 0, 0, 1]))
        .input('CountryCode', sql.VarChar, 'US')
        .input('ItemCode', sql.Int, 1)
        .input('SuppliedJCash', sql.Int, 0)
        .input('SuppliedJCashMileage', sql.Int, silkAmount)
        .input('CurrencyCode', sql.Int, 2) // USD
        .input('SellingPrice', sql.Int, Math.floor(amount * 100)) // Cents
        .input('SellingCount', sql.Int, 1)
        .query(`
          INSERT INTO [GB_JoymaxPortal].[dbo].[APH_Details] 
          (InvoiceID, PaymentDate, StatusCode, PMCode, SolutionCode, PGStatusCode, JID, PayerEmail, PayerIP, CountryCode, ItemCode, SuppliedJCash, SuppliedJCashMileage, CurrencyCode, SellingPrice, SellingCount)
          VALUES (@InvoiceID, @PaymentDate, @StatusCode, @PMCode, @SolutionCode, @PGStatusCode, @JID, @PayerEmail, @PayerIP, @CountryCode, @ItemCode, @SuppliedJCash, @SuppliedJCashMileage, @CurrencyCode, @SellingPrice, @SellingCount)
        `);
      
      // APH_ChangedSilk Eintrag erstellen (Silk Balance Change)
      const availableDate = new Date(currentDate.getTime() + (5 * 365 * 24 * 60 * 60 * 1000)); // 5 Jahre verfügbar
      
      await transaction.request()
        .input('InvoiceID', sql.VarChar, invoiceID)
        .input('PTInvoiceID', sql.VarChar, null)
        .input('ManagerGiftID', sql.Int, null)
        .input('JID', sql.Int, jid)
        .input('RemainedSilk', sql.Int, silkAmount)
        .input('ChangedSilk', sql.Int, silkAmount)
        .input('SilkType', sql.TinyInt, 3) // Premium Silk für Donations
        .input('SellingTypeID', sql.TinyInt, 1) // Charged
        .input('ChangeDate', sql.DateTime, currentDate)
        .input('AvailableDate', sql.DateTime, availableDate)
        .input('AvailableStatus', sql.Char, 'Y')
        .query(`
          INSERT INTO [GB_JoymaxPortal].[dbo].[APH_ChangedSilk] 
          (InvoiceID, PTInvoiceID, ManagerGiftID, JID, RemainedSilk, ChangedSilk, SilkType, SellingTypeID, ChangeDate, AvailableDate, AvailableStatus)
          VALUES (@InvoiceID, @PTInvoiceID, @ManagerGiftID, @JID, @RemainedSilk, @ChangedSilk, @SilkType, @SellingTypeID, @ChangeDate, @AvailableDate, @AvailableStatus)
        `);
      
      // Silk Balance Update (APH_SilkBalance)
      const balanceResult = await this.getJCash(jid);
      await transaction.request()
        .input('JID', sql.Int, jid)
        .input('SilkType', sql.TinyInt, 3)
        .input('SilkAmount', sql.Int, balanceResult.premiumSilk + silkAmount)
        .query(`
          IF EXISTS (SELECT 1 FROM [GB_JoymaxPortal].[dbo].[APH_SilkBalance] WHERE JID = @JID AND SilkType = @SilkType)
            UPDATE [GB_JoymaxPortal].[dbo].[APH_SilkBalance] SET SilkAmount = @SilkAmount WHERE JID = @JID AND SilkType = @SilkType
          ELSE
            INSERT INTO [GB_JoymaxPortal].[dbo].[APH_SilkBalance] (JID, SilkType, SilkAmount) VALUES (@JID, @SilkType, @SilkAmount)
        `);
      
      // SRO_CMS Donation Log
      await this.logDonation(jid, 'paypal', amount, silkAmount, transactionId, transaction);
      
      await transaction.commit();
      
      console.log(`✅ PayPal Donation vollständig verarbeitet: JID ${jid} -> $${amount} = ${silkAmount} Premium Silk (Invoice: ${invoiceID})`);
      
      return {
        success: true,
        jid: jid,
        amount: amount,
        silk: silkAmount,
        transactionId: transactionId,
        invoiceId: invoiceID
      };
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ PayPal Donation Verarbeitung fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Erstellt Donation Log Eintrag in SRO_CMS
   * @param {number} jid Portal JID
   * @param {string} method Payment Methode
   * @param {number} amount Dollar Betrag
   * @param {number} silk Silk Betrag
   * @param {string} transactionId Transaction ID
   * @param {Object} transaction SQL Transaction (optional)
   */
  static async logDonation(jid, method, amount, silk, transactionId, transaction = null) {
    const request = transaction ? transaction.request() : pool.request();
    
    try {
      await request
        .input('jid', sql.Int, jid)
        .input('method', sql.NVarChar, method)
        .input('amount', sql.Int, Math.floor(amount * 100)) // Store as cents
        .input('value', sql.Int, silk) // Silk amount
        .input('transaction_id', sql.NVarChar, transactionId)
        .input('status', sql.NVarChar, 'completed')
        .input('desc', sql.NVarChar, `${method.toUpperCase()} Donation: $${amount} -> ${silk} Silk`)
        .input('currency', sql.NVarChar, 'USD')
        .input('created_at', sql.DateTime, new Date())
        .input('updated_at', sql.DateTime, new Date())
        .query(`
          INSERT INTO [SRO_CMS].[dbo].[donate_logs] (jid, method, amount, value, transaction_id, status, [desc], currency, created_at, updated_at)
          VALUES (@jid, @method, @amount, @value, @transaction_id, @status, @desc, @currency, @created_at, @updated_at)
        `);
      
    } catch (error) {
      console.error('❌ Fehler beim Logging der Donation:', error);
      throw error;
    }
  }

  /**
   * Gibt Donation History für einen Account zurück
   * @param {number} jid Portal JID
   * @returns {Promise<Array>} Donation History
   */
  static async getDonationHistory(jid) {
    await poolConnect;
    
    try {
      const result = await pool
        .request()
        .input('jid', sql.Int, jid)
        .query(`
          SELECT TOP 50 method, amount, value as silk, transaction_id, status, [desc], currency, created_at
          FROM [SRO_CMS].[dbo].[donate_logs]
          WHERE jid = @jid
          ORDER BY created_at DESC
        `);
      
      return result.recordset;
      
    } catch (error) {
      console.error('❌ Fehler beim Abrufen der Donation History:', error);
      return [];
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
      await pool
        .request()
        .input('jid', sql.Int, jid)
        .input('points', sql.Int, points)
        .query(`
          UPDATE [SRO_CMS].[dbo].[users] 
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
        .input('created_at', sql.DateTime, new Date())
        .query(`
          INSERT INTO [SRO_CMS].[dbo].[vote_logs] (jid, site, points, created_at)
          VALUES (@jid, @site, @points, @created_at)
        `);
      
      console.log(`✅ Vote Points hinzugefügt: JID ${jid} -> +${points} (Site: ${site})`);
      
    } catch (error) {
      console.error('❌ Fehler beim Hinzufügen von Vote Points:', error);
      throw new Error(`Vote Points Failed: ${error.message}`);
    }
  }

  /**
   * Übersetzt ErrorCode in verständliche Nachricht
   * @param {number} errorCode Error Code von Stored Procedures
   * @returns {string} Error Message
   */
  static getErrorMessage(errorCode) {
    const errorMessages = {
      0: 'Erfolgreich',
      '-65543': 'Ungültige Parameter',
      '-65544': 'Keine Zeilen betroffen',
      '-393259': 'Ungültiger Silk Type',
      '-131076': 'Account nicht gefunden',
      '-131078': 'Account ist blockiert',
      '-393220': 'Silk Limit überschritten',
      '-393217': 'Manager nicht gefunden'
    };
    
    return errorMessages[errorCode] || `Unbekannter Fehler: ${errorCode}`;
  }
}

module.exports = SilkManagerCompatible;