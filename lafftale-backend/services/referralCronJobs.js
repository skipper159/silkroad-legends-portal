const { pool, poolConnect, sql } = require('../db');
const cron = require('node-cron');

/**
 * Delayed Reward Processing Service
 * Handles PENDING → ACTIVE → REJECTED workflow for referral rewards
 */
class ReferralCronJobs {
  constructor() {
    this.isProcessing = false;
    this.lastProcessed = null;
    this.processingStats = {
      totalProcessed: 0,
      totalActivated: 0,
      totalRejected: 0,
      lastRunDuration: 0,
    };
  }

  /**
   * Start the delayed reward processing cronjob
   * Runs every 6 hours by default (configurable via settings)
   */
  async startDelayedRewardProcessing() {
    try {
      await poolConnect;

      // Get cronjob interval from settings
      const intervalResult = await pool.request().query(`
        SELECT setting_value FROM referral_settings 
        WHERE setting_key = 'cronjob_interval_hours'
      `);

      const intervalHours =
        intervalResult.recordset.length > 0
          ? parseInt(intervalResult.recordset[0].setting_value)
          : 6;

      // Convert to cron format (every X hours)
      const cronExpression = `0 */${intervalHours} * * *`;

      console.log(
        `🕐 Starting Delayed Reward Cronjob (every ${intervalHours} hours: ${cronExpression})`
      );

      // Schedule the cronjob
      cron.schedule(
        cronExpression,
        async () => {
          console.log('🔄 Delayed Reward Cronjob triggered');
          await this.processDelayedRewards();
        },
        {
          scheduled: true,
          timezone: 'Europe/Berlin',
        }
      );

      // Also run once on startup after 1 minute
      setTimeout(async () => {
        console.log('🚀 Running initial delayed reward processing...');
        await this.processDelayedRewards();
      }, 60000);

      console.log('✅ Delayed Reward Cronjob system started successfully');
    } catch (error) {
      console.error('❌ Failed to start delayed reward cronjob:', error);
    }
  }

  /**
   * Process pending referrals and update their status
   */
  async processDelayedRewards(batchSize = 100, debug = false) {
    if (this.isProcessing) {
      console.log('⏳ Delayed reward processing already running, skipping...');
      return this.processingStats;
    }

    const startTime = Date.now();
    this.isProcessing = true;

    let stats = {
      processed: 0,
      activated: 0,
      rejected: 0,
      errors: 0,
      keepPending: 0,
    };

    try {
      await poolConnect;

      // Check if delayed rewards are enabled
      const enabledResult = await pool.request().query(`
        SELECT setting_value FROM referral_settings 
        WHERE setting_key = 'delayed_rewards_enabled'
      `);

      if (
        enabledResult.recordset.length === 0 ||
        enabledResult.recordset[0].setting_value !== 'true'
      ) {
        console.log('⚠️ Delayed rewards are disabled, skipping processing');
        return stats;
      }

      console.log(`🔍 Processing delayed rewards (batch size: ${batchSize})...`);

      // Get pending referrals ready for processing using inline query instead of view
      const pendingReferrals = await pool.request().input('batch_size', sql.Int, batchSize).query(`
          WITH account_metrics AS (
            SELECT 
                r.id as referral_id,
                r.invited_jid,
                r.jid as referrer_jid,
                r.created_at as referral_created,
                
                -- Account age calculation
                DATEDIFF(day, u.RegDate, GETDATE()) as account_age_days,
                
                -- Character metrics (highest level, total playtime)
                ISNULL(char_stats.highest_level, 0) as highest_char_level,
                ISNULL(acc_playtime.PlayTime, 0) / 3600.0 as total_playtime_hours,
                ISNULL(char_stats.total_chars, 0) as character_count,
                
            -- Login metrics (simplified - using account visit date as approximation)
            CASE WHEN u.VisitDate >= DATEADD(day, -7, GETDATE()) THEN 1 ELSE 0 END as unique_login_days,
            u.VisitDate as last_login,
                
                -- Requirements from settings
                (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_account_age_days') as req_age_days,
                (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_playtime_hours') as req_playtime_hours,
                (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_character_level') as req_char_level,
                (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_login_days') as req_login_days
                
            FROM referrals r
            JOIN [SILKROAD_R_ACCOUNT].[dbo].[TB_User] u ON r.invited_jid = u.JID
            
            -- Account playtime from rigid login event system (actual active system)
            LEFT JOIN (
                SELECT JID, 
                ([1] + [2] + [3] + [4] + [5] + [6] + [7] + [8] + [9] + [10] + 
                 [11] + [12] + [13] + [14] + [15] + [16] + [17] + [18] + [19] + [20] + 
                 [21] + [22] + [23] + [24] + [25] + [26] + [27] + [28]) as PlayTime
                FROM [SILKROAD_R_ACCOUNT].[dbo].[_Rigid_Login_Event_Calendar_Playtime]
            ) acc_playtime ON r.invited_jid = acc_playtime.JID
            
            -- Character statistics subquery
            LEFT JOIN (
                SELECT 
                    u.UserJID,
                    MAX(c.CurLevel) as highest_level,
                    COUNT(*) as total_chars
                FROM [SILKROAD_R_SHARD].[dbo].[_User] u
                JOIN [SILKROAD_R_SHARD].[dbo].[_Char] c ON u.CharID = c.CharID 
                WHERE c.Deleted = 0
                GROUP BY u.UserJID
            ) char_stats ON r.invited_jid = char_stats.UserJID
            
            WHERE r.status = 'PENDING'
              AND r.requires_validation = 1
              AND (r.next_process_at IS NULL OR r.next_process_at <= GETDATE())
          )
          SELECT TOP (@batch_size)
            referral_id,
            invited_jid,
            referrer_jid,
            account_age_days,
            total_playtime_hours,
            highest_char_level,
            unique_login_days,
            
            -- Requirement checks
            CASE WHEN account_age_days >= req_age_days THEN 1 ELSE 0 END as meets_age_requirement,
            CASE WHEN total_playtime_hours >= req_playtime_hours THEN 1 ELSE 0 END as meets_playtime_requirement,
            CASE WHEN highest_char_level >= req_char_level THEN 1 ELSE 0 END as meets_level_requirement,
            CASE WHEN unique_login_days >= req_login_days THEN 1 ELSE 0 END as meets_login_requirement,
            
            -- Overall qualification
            CASE WHEN 
                account_age_days >= req_age_days AND
                total_playtime_hours >= req_playtime_hours AND
                highest_char_level >= req_char_level AND
                unique_login_days >= req_login_days
            THEN 1 ELSE 0 END as qualifies_for_activation
            
          FROM account_metrics
          ORDER BY referral_created ASC
        `);

      if (pendingReferrals.recordset.length === 0) {
        console.log('✅ No pending referrals to process');
        return stats;
      }

      console.log(`📋 Found ${pendingReferrals.recordset.length} pending referrals to process`);

      // Get grace period setting
      const gracePeriodResult = await pool.request().query(`
        SELECT setting_value FROM referral_settings 
        WHERE setting_key = 'reward_grace_period_days'
      `);
      const gracePeriodDays =
        gracePeriodResult.recordset.length > 0
          ? parseInt(gracePeriodResult.recordset[0].setting_value)
          : 30;

      // Process each referral
      for (const referral of pendingReferrals.recordset) {
        try {
          stats.processed++;

          const {
            referral_id,
            invited_jid,
            referrer_jid,
            account_age_days,
            qualifies_for_activation,
          } = referral;

          if (debug) {
            console.log(
              `Processing referral ${referral_id} (JID: ${invited_jid}, Age: ${account_age_days} days)`
            );
          }

          if (qualifies_for_activation) {
            // ACTIVATE the referral
            await this.activateReferral(referral);
            stats.activated++;

            if (debug) {
              console.log(`✅ Activated referral ${referral_id}`);
            }
          } else if (account_age_days > gracePeriodDays) {
            // REJECT - Grace period exceeded
            await this.rejectReferral(
              referral,
              'GRACE_PERIOD_EXCEEDED',
              `Account age ${account_age_days} days exceeds grace period of ${gracePeriodDays} days`
            );
            stats.rejected++;

            if (debug) {
              console.log(`❌ Rejected referral ${referral_id} - Grace period exceeded`);
            }
          } else {
            // KEEP PENDING - Schedule next check
            await this.scheduleNextCheck(referral_id);
            stats.keepPending++;

            if (debug) {
              console.log(`⏳ Kept pending referral ${referral_id} - Requirements not met`);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing referral ${referral.referral_id}:`, error);
          stats.errors++;

          // Mark error in database
          await pool
            .request()
            .input('referral_id', sql.BigInt, referral.referral_id)
            .input('error_message', sql.NVarChar, error.message).query(`
              UPDATE referrals 
              SET process_attempts = process_attempts + 1,
                  next_process_at = DATEADD(hour, 2, GETDATE()),
                  validation_notes = 'Processing error: ' + @error_message
              WHERE id = @referral_id
            `);
        }
      }

      // Update processing stats
      const duration = Date.now() - startTime;
      this.processingStats = {
        totalProcessed: this.processingStats.totalProcessed + stats.processed,
        totalActivated: this.processingStats.totalActivated + stats.activated,
        totalRejected: this.processingStats.totalRejected + stats.rejected,
        lastRunDuration: duration,
      };
      this.lastProcessed = new Date();

      console.log(`🎉 Delayed reward processing complete in ${duration}ms:`);
      console.log(`   📊 Processed: ${stats.processed}`);
      console.log(`   ✅ Activated: ${stats.activated}`);
      console.log(`   ❌ Rejected: ${stats.rejected}`);
      console.log(`   ⏳ Kept Pending: ${stats.keepPending}`);
      console.log(`   💥 Errors: ${stats.errors}`);
    } catch (error) {
      console.error('❌ Fatal error in delayed reward processing:', error);
      stats.errors++;
    } finally {
      this.isProcessing = false;
    }

    return stats;
  }

  /**
   * Activate a referral and give rewards
   */
  async activateReferral(referral) {
    const { referral_id, invited_jid, referrer_jid } = referral;

    try {
      // Update referral status to ACTIVE
      await pool.request().input('referral_id', sql.BigInt, referral_id).query(`
          UPDATE referrals 
          SET status = 'ACTIVE',
              requires_validation = 0,
              reward_given_at = GETDATE(),
              last_processed_at = GETDATE(),
              process_attempts = process_attempts + 1,
              validation_notes = 'Auto-activated: All requirements met'
          WHERE id = @referral_id
        `);

      // TODO: Trigger actual reward distribution here
      // This would call your existing reward system
      // await this.giveReferralReward(referrer_jid, invited_jid);

      // Log the activation
      await pool
        .request()
        .input('referral_id', sql.BigInt, referral_id)
        .input('user_jid', sql.Int, invited_jid)
        .input('referrer_jid', sql.Int, referrer_jid)
        .input('old_status', sql.NVarChar, 'PENDING')
        .input('new_status', sql.NVarChar, 'ACTIVE')
        .input('processing_reason', sql.NVarChar, 'ACTIVATED_REQUIREMENTS_MET')
        .input('meets_age', sql.Bit, referral.meets_age_requirement)
        .input('meets_playtime', sql.Bit, referral.meets_playtime_requirement)
        .input('meets_level', sql.Bit, referral.meets_level_requirement)
        .input('meets_login', sql.Bit, referral.meets_login_requirement)
        .input('account_age', sql.Int, referral.account_age_days)
        .input('playtime_hours', sql.Decimal(10, 2), referral.total_playtime_hours)
        .input('char_level', sql.Int, referral.highest_char_level)
        .input('login_days', sql.Int, referral.unique_login_days).query(`
          INSERT INTO delayed_reward_logs 
          (referral_id, user_jid, referrer_jid, old_status, new_status, processing_reason,
           meets_age_requirement, meets_playtime_requirement, meets_level_requirement, meets_login_requirement,
           account_age_days, total_playtime_hours, highest_char_level, unique_login_days,
           reward_given, processed_at)
          VALUES 
          (@referral_id, @user_jid, @referrer_jid, @old_status, @new_status, @processing_reason,
           @meets_age, @meets_playtime, @meets_level, @meets_login,
           @account_age, @playtime_hours, @char_level, @login_days,
           1, GETDATE())
        `);

      console.log(`✅ Referral ${referral_id} activated successfully`);
    } catch (error) {
      console.error(`❌ Error activating referral ${referral_id}:`, error);
      throw error;
    }
  }

  /**
   * Reject a referral
   */
  async rejectReferral(referral, reason, details) {
    const { referral_id, invited_jid, referrer_jid } = referral;

    try {
      // Update referral status to REJECTED
      await pool
        .request()
        .input('referral_id', sql.BigInt, referral_id)
        .input('cheat_reason', sql.NVarChar, reason)
        .input('validation_notes', sql.NVarChar, `Rejected: ${details}`).query(`
          UPDATE referrals 
          SET status = 'REJECTED',
              requires_validation = 0,
              cheat_reason = @cheat_reason,
              last_processed_at = GETDATE(),
              process_attempts = process_attempts + 1,
              validation_notes = @validation_notes
          WHERE id = @referral_id
        `);

      // Log the rejection
      await pool
        .request()
        .input('referral_id', sql.BigInt, referral_id)
        .input('user_jid', sql.Int, invited_jid)
        .input('referrer_jid', sql.Int, referrer_jid)
        .input('old_status', sql.NVarChar, 'PENDING')
        .input('new_status', sql.NVarChar, 'REJECTED')
        .input('processing_reason', sql.NVarChar, reason)
        .input('account_age', sql.Int, referral.account_age_days)
        .input('playtime_hours', sql.Decimal(10, 2), referral.total_playtime_hours || 0)
        .input('char_level', sql.Int, referral.highest_char_level || 0)
        .input('login_days', sql.Int, referral.unique_login_days || 0).query(`
          INSERT INTO delayed_reward_logs 
          (referral_id, user_jid, referrer_jid, old_status, new_status, processing_reason,
           account_age_days, total_playtime_hours, highest_char_level, unique_login_days,
           reward_given, processed_at)
          VALUES 
          (@referral_id, @user_jid, @referrer_jid, @old_status, @new_status, @processing_reason,
           @account_age, @playtime_hours, @char_level, @login_days,
           0, GETDATE())
        `);

      console.log(`❌ Referral ${referral_id} rejected: ${reason}`);
    } catch (error) {
      console.error(`❌ Error rejecting referral ${referral_id}:`, error);
      throw error;
    }
  }

  /**
   * Schedule next processing check for a pending referral
   */
  async scheduleNextCheck(referralId) {
    try {
      await pool.request().input('referral_id', sql.BigInt, referralId).query(`
          UPDATE referrals 
          SET next_process_at = DATEADD(day, 1, GETDATE()),
              last_processed_at = GETDATE(),
              process_attempts = process_attempts + 1,
              validation_notes = 'Still pending: Requirements not yet met'
          WHERE id = @referral_id
        `);
    } catch (error) {
      console.error(`❌ Error scheduling next check for referral ${referralId}:`, error);
    }
  }

  /**
   * Manual processing trigger for admin
   */
  async processSpecificReferral(referralId, force = false) {
    try {
      await poolConnect;

      const referralResult = await pool.request().input('referral_id', sql.BigInt, referralId)
        .query(`
          WITH account_metrics AS (
            SELECT 
                r.id as referral_id,
                r.invited_jid,
                r.jid as referrer_jid,
                
                -- Account age calculation
                DATEDIFF(day, u.RegDate, GETDATE()) as account_age_days,
                
                -- Character metrics (highest level, total playtime)
                ISNULL(char_stats.highest_level, 0) as highest_char_level,
                ISNULL(acc_playtime.PlayTime, 0) / 3600.0 as total_playtime_hours,
                
                -- Login metrics (simplified)
                CASE WHEN u.VisitDate >= DATEADD(day, -7, GETDATE()) THEN 1 ELSE 0 END as unique_login_days,
                
                -- Requirements from settings
                (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_account_age_days') as req_age_days,
                (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_playtime_hours') as req_playtime_hours,
                (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_character_level') as req_char_level,
                (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_login_days') as req_login_days
                
            FROM referrals r
            JOIN [SILKROAD_R_ACCOUNT].[dbo].[TB_User] u ON r.invited_jid = u.JID
            
            -- Account playtime from rigid login event system (actual active system)
            LEFT JOIN (
                SELECT JID, 
                ([1] + [2] + [3] + [4] + [5] + [6] + [7] + [8] + [9] + [10] + 
                 [11] + [12] + [13] + [14] + [15] + [16] + [17] + [18] + [19] + [20] + 
                 [21] + [22] + [23] + [24] + [25] + [26] + [27] + [28]) as PlayTime
                FROM [SILKROAD_R_ACCOUNT].[dbo].[_Rigid_Login_Event_Calendar_Playtime]
            ) acc_playtime ON r.invited_jid = acc_playtime.JID
            
            LEFT JOIN (
                SELECT 
                    u.UserJID,
                    MAX(c.CurLevel) as highest_level
                FROM [SILKROAD_R_SHARD].[dbo].[_User] u
                JOIN [SILKROAD_R_SHARD].[dbo].[_Char] c ON u.CharID = c.CharID 
                WHERE c.Deleted = 0
                GROUP BY u.UserJID
            ) char_stats ON r.invited_jid = char_stats.UserJID
            
            WHERE r.id = @referral_id
              AND r.status = 'PENDING'
          )
          SELECT 
            referral_id,
            invited_jid,
            referrer_jid,
            CASE WHEN 
                account_age_days >= req_age_days AND
                total_playtime_hours >= req_playtime_hours AND
                highest_char_level >= req_char_level AND
                unique_login_days >= req_login_days
            THEN 1 ELSE 0 END as qualifies_for_activation
          FROM account_metrics
        `);

      if (referralResult.recordset.length === 0) {
        throw new Error(`Referral ${referralId} not found or not in PENDING status`);
      }

      const referral = referralResult.recordset[0];

      if (force || referral.qualifies_for_activation) {
        await this.activateReferral(referral);
        return { success: true, action: 'ACTIVATED', referral_id: referralId };
      } else {
        return {
          success: false,
          action: 'REQUIREMENTS_NOT_MET',
          referral_id: referralId,
          message: 'Account does not meet requirements for activation',
        };
      }
    } catch (error) {
      console.error(`❌ Error processing specific referral ${referralId}:`, error);
      return { success: false, error: error.message, referral_id: referralId };
    }
  }

  /**
   * Get processing statistics
   */
  getStats() {
    return {
      ...this.processingStats,
      lastProcessed: this.lastProcessed,
      isCurrentlyProcessing: this.isProcessing,
    };
  }

  /**
   * Check system health
   */
  async getHealthStatus() {
    try {
      await poolConnect;

      const statusResult = await pool.request().query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM referrals 
        GROUP BY status
      `);

      const pendingReadyResult = await pool.request().query(`
        WITH account_metrics AS (
          SELECT 
              r.id as referral_id,
              
              -- Account age calculation
              DATEDIFF(day, u.RegDate, GETDATE()) as account_age_days,
              
              -- Character metrics (highest level, total playtime)
              ISNULL(char_stats.highest_level, 0) as highest_char_level,
              ISNULL(acc_playtime.PlayTime, 0) / 3600.0 as total_playtime_hours,
              
              -- Login metrics (simplified)
              CASE WHEN u.VisitDate >= DATEADD(day, -7, GETDATE()) THEN 1 ELSE 0 END as unique_login_days,
              
              -- Requirements from settings
              (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_account_age_days') as req_age_days,
              (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_playtime_hours') as req_playtime_hours,
              (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_character_level') as req_char_level,
              (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_login_days') as req_login_days
              
          FROM referrals r
          JOIN [SILKROAD_R_ACCOUNT].[dbo].[TB_User] u ON r.invited_jid = u.JID
          
          -- Account playtime from rigid login event system (actual active system)
          LEFT JOIN (
              SELECT JID, 
              ([1] + [2] + [3] + [4] + [5] + [6] + [7] + [8] + [9] + [10] + 
               [11] + [12] + [13] + [14] + [15] + [16] + [17] + [18] + [19] + [20] + 
               [21] + [22] + [23] + [24] + [25] + [26] + [27] + [28]) as PlayTime
              FROM [SILKROAD_R_ACCOUNT].[dbo].[_Rigid_Login_Event_Calendar_Playtime]
          ) acc_playtime ON r.invited_jid = acc_playtime.JID
          
          LEFT JOIN (
              SELECT 
                  u.UserJID,
                  MAX(c.CurLevel) as highest_level
              FROM [SILKROAD_R_SHARD].[dbo].[_User] u
              JOIN [SILKROAD_R_SHARD].[dbo].[_Char] c ON u.CharID = c.CharID 
              WHERE c.Deleted = 0
              GROUP BY u.UserJID
          ) char_stats ON r.invited_jid = char_stats.UserJID
          
          WHERE r.status = 'PENDING'
            AND r.requires_validation = 1
            AND (r.next_process_at IS NULL OR r.next_process_at <= GETDATE())
        )
        SELECT COUNT(*) as count FROM account_metrics
        WHERE 
          account_age_days >= req_age_days AND
          total_playtime_hours >= req_playtime_hours AND
          highest_char_level >= req_char_level AND
          unique_login_days >= req_login_days
      `);

      const recentActivityResult = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM delayed_reward_logs 
        WHERE processed_at >= DATEADD(hour, -24, GETDATE())
      `);

      return {
        healthy: true,
        referral_status_counts: statusResult.recordset,
        pending_ready_for_processing: pendingReadyResult.recordset[0].count,
        recent_activity_24h: recentActivityResult.recordset[0].count,
        last_processed: this.lastProcessed,
        processing_stats: this.processingStats,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
const referralCronJobs = new ReferralCronJobs();
module.exports = referralCronJobs;
