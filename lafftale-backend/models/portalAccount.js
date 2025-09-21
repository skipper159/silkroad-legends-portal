const { pool, poolConnect, sql } = require('../db');

/**
 * Portal Account Management nach SRO-CMS Pattern
 * Erstellt Accounts in GB_JoymaxPortal.MU_User und verknüpft sie korrekt
 */
class PortalAccount {
  /**
   * Erstellt Portal Account (GB_JoymaxPortal.MU_User)
   * @param {string} username
   * @param {string} password
   * @param {Object} txRequest Optional: transaction.request() für atomare Operationen
   * @returns {Promise<number>} JID des erstellten Accounts
   */
  static async createPortalAccount(username, password, txRequest = null) {
    await poolConnect;
    const req = txRequest || pool.request();

    try {
      // MD5 Hash wie in SRO-CMS
      const crypto = require('crypto');
      const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

      const result = await req
        .input('UserID', sql.VarChar(32), username)
        .input('UserPwd', sql.Char(32), hashedPassword)
        .input('Gender', sql.Char(1), 'M')
        .input('Birthday', sql.DateTime, new Date())
        .input('NickName', sql.VarChar(32), username)
        .input('CountryCode', sql.Char(2), 'EG')
        .input('AbusingCount', sql.Int, 0).query(`
          INSERT INTO [GB_JoymaxPortal].[dbo].[MU_User] 
          (UserID, UserPwd, Gender, Birthday, NickName, CountryCode, AbusingCount)
          OUTPUT INSERTED.JID
          VALUES (@UserID, @UserPwd, @Gender, @Birthday, @NickName, @CountryCode, @AbusingCount)
        `);

      const jid = result.recordset[0].JID;
      console.log(`Portal Account erstellt: ${username} -> JID: ${jid}`);
      return jid;
    } catch (error) {
      console.error('Fehler beim Erstellen des Portal Accounts:', error);
      throw new Error(`Portal Account Creation Failed: ${error.message}`);
    }
  }

  /**
   * Erstellt Email Eintrag (GB_JoymaxPortal.MU_Email)
   * @param {number} jid
   * @param {string} email
   * @param {Object} txRequest Optional: transaction.request() für atomare Operationen
   */
  static async createPortalEmail(jid, email, txRequest = null) {
    await poolConnect;
    const req = txRequest || pool.request();

    try {
      await req.input('JID', sql.Int, jid).input('EmailAddr', sql.VarChar(255), email)
        .query(`
          INSERT INTO [GB_JoymaxPortal].[dbo].[MU_Email] (JID, EmailAddr)
          VALUES (@JID, @EmailAddr)
        `);

      console.log(`Portal Email erstellt: JID ${jid} -> ${email}`);
    } catch (error) {
      console.error('Fehler beim Erstellen der Portal Email:', error);
      throw new Error(`Portal Email Creation Failed: ${error.message}`);
    }
  }

  /**
   * Erstellt Game Account (SILKROAD_R_ACCOUNT.TB_User)
   * @param {number} jid Portal JID
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @param {string} ip
   */
  static async createGameAccount(jid, username, password, email, ip) {
    await poolConnect;

    try {
      // MD5 Hash wie in SRO-CMS
      const crypto = require('crypto');
      const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

      await pool
        .request()
        .input('PortalJID', sql.Int, jid)
        .input('StrUserID', sql.VarChar(32), username)
        .input('ServiceCompany', sql.TinyInt, 11)
        .input('password', sql.VarChar(32), hashedPassword)
        .input('Active', sql.TinyInt, 1)
        .input('UserIP', sql.VarChar(15), ip)
        .input('CountryCode', sql.Char(2), 'EG')
        .input('VisitDate', sql.DateTime, new Date())
        .input('RegDate', sql.DateTime, new Date())
        .input('sec_primary', sql.TinyInt, 3)
        .input('sec_content', sql.TinyInt, 3)
        .input('sec_grade', sql.TinyInt, 0)
        .input('AccPlayTime', sql.Int, 0)
        .input('LatestUpdateTime_ToPlayTime', sql.Int, 0).query(`
          INSERT INTO [SILKROAD_R_ACCOUNT].[dbo].[TB_User] 
          (PortalJID, StrUserID, ServiceCompany, password, Active, UserIP, CountryCode, 
           VisitDate, RegDate, sec_primary, sec_content, sec_grade, AccPlayTime, LatestUpdateTime_ToPlayTime)
          VALUES (@PortalJID, @StrUserID, @ServiceCompany, @password, @Active, @UserIP, @CountryCode,
                  @VisitDate, @RegDate, @sec_primary, @sec_content, @sec_grade, @AccPlayTime, @LatestUpdateTime_ToPlayTime)
        `);

      console.log(`Game Account erstellt: JID ${jid} -> ${username}`);
    } catch (error) {
      console.error('Fehler beim Erstellen des Game Accounts:', error);
      throw new Error(`Game Account Creation Failed: ${error.message}`);
    }
  }

  /**
   * Erstellt zusätzliche Portal Info Einträge
   * @param {number} jid
   * @param {string} username
   * @param {string} email
   * @param {string} ip
   */
  static async createPortalInfos(jid, username, email, ip) {
    // Überspringe Portal Info Creation - Tabellen existieren nicht in dieser DB-Version
    console.log(`✅ Portal Info Einträge für JID ${jid} übersprungen (Tabellen nicht vorhanden)`);
    return; // Erfolgreiche Rückkehr ohne Fehler
  }

  /**
   * Web-Portal Account Erstellung (NUR Portal + Email, KEIN Game Account)
   * @param {string} username
   * @param {string} password
   * @param {string} email
   * @param {string} ip
   * @returns {Promise<number>} JID des erstellten Accounts
   */
  static async createFullAccount(username, password, email, ip) {
    await poolConnect;

    const transaction = pool.transaction();

    try {
      await transaction.begin();
      const txReq = transaction.request();

      // ✅ Zusätzliche Prä-Checks für Atomarität
      const usernameExists = await this.checkUsernameExists(username);
      if (usernameExists) {
        throw new Error('Username already exists');
      }

      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        throw new Error('Email already exists');
      }

      // 1. Portal Account erstellen (mit Transaction)
      const jid = await this.createPortalAccount(username, password, txReq);

      // 2. Portal Email erstellen (mit Transaction)
      await this.createPortalEmail(jid, email, txReq);

      // ❌ Portal Info Einträge ÜBERSPRUNGEN (Tabellen existieren nicht)
      // ❌ Game Account ÜBERSPRUNGEN (wird separat beim ersten Spiel-Login erstellt)

      await transaction.commit();

      console.log(`✅ Web-Portal Account erstellt - Username: ${username}, JID: ${jid} (OHNE Game Account)`);
      return jid;
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('❌ Transaction Rollback Fehler:', rollbackError);
      }
      console.error('❌ Vollständige Account Erstellung fehlgeschlagen:', error);
      throw error;
    }
  }

  /**
   * Prüft ob Username bereits existiert
   * @param {string} username
   * @returns {Promise<boolean>}
   */
  static async checkUsernameExists(username) {
    await poolConnect;

    try {
      const result = await pool.request().input('UserID', sql.VarChar(32), username).query(`
          SELECT COUNT(*) as count 
          FROM [GB_JoymaxPortal].[dbo].[MU_User] 
          WHERE UserID = @UserID
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Fehler beim Prüfen des Usernames:', error);
      return false;
    }
  }

  /**
   * Prüft ob Email bereits existiert
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  static async checkEmailExists(email) {
    await poolConnect;

    try {
      const result = await pool.request().input('EmailAddr', sql.VarChar(255), email).query(`
          SELECT COUNT(*) as count 
          FROM [GB_JoymaxPortal].[dbo].[MU_Email] 
          WHERE EmailAddr = @EmailAddr
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Fehler beim Prüfen der Email:', error);
      return false;
    }
  }
}

module.exports = PortalAccount;
