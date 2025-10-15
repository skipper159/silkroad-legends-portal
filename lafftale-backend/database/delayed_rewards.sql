-- =====================================================
-- DELAYED REWARD SYSTEM - 3-STATUS IMPLEMENTATION
-- =====================================================
-- PENDING → ACTIVE → REJECTED Workflow mit automatischer Validierung

USE SRO_CMS;
GO

PRINT 'Starting Delayed Reward System Implementation...';

-- =====================================================
-- 1. DELAYED REWARD SETTINGS
-- =====================================================

PRINT 'Adding Delayed Reward settings...';

INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
SELECT * FROM (VALUES
    ('delayed_rewards_enabled', 'true', 'Enable delayed reward system (PENDING → ACTIVE workflow)', GETDATE(), GETDATE()),
    ('min_account_age_days', '14', 'Minimum account age in days before reward activation', GETDATE(), GETDATE()),
    ('min_playtime_hours', '10', 'Minimum total playtime in hours before reward activation', GETDATE(), GETDATE()),
    ('min_character_level', '10', 'Minimum character level required for reward activation', GETDATE(), GETDATE()),
    ('min_login_days', '7', 'Minimum unique login days required for reward activation', GETDATE(), GETDATE()),
    ('cronjob_interval_hours', '6', 'How often to run delayed reward processing (hours)', GETDATE(), GETDATE()),
    ('reward_grace_period_days', '30', 'Days after account creation to still qualify for rewards', GETDATE(), GETDATE()),
    ('auto_reject_inactive_days', '60', 'Auto-reject referrals if account inactive for X days', GETDATE(), GETDATE())
) AS v(setting_key, setting_value, description, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM referral_settings WHERE referral_settings.setting_key = v.setting_key);

PRINT '✅ Added Delayed Reward settings';

-- =====================================================
-- 2. DELAYED REWARD PROCESSING LOGS
-- =====================================================

PRINT 'Creating delayed reward processing logs...';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'delayed_reward_logs')
BEGIN
    CREATE TABLE delayed_reward_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        referral_id BIGINT NOT NULL,
        user_jid INT NOT NULL,
        referrer_jid INT NOT NULL,
        old_status NVARCHAR(20) NOT NULL,
        new_status NVARCHAR(20) NOT NULL,
        processing_reason NVARCHAR(255) NOT NULL,
        
        -- Validation metrics at time of processing
        account_age_days INT NULL,
        total_playtime_hours DECIMAL(10,2) NULL,
        highest_char_level INT NULL,
        unique_login_days INT NULL,
        total_logins INT NULL,
        last_login DATETIME NULL,
        
        -- Requirements check
        meets_age_requirement BIT DEFAULT 0,
        meets_playtime_requirement BIT DEFAULT 0,
        meets_level_requirement BIT DEFAULT 0,
        meets_login_requirement BIT DEFAULT 0,
        has_suspicious_activity BIT DEFAULT 0,
        
        -- Reward details
        reward_amount DECIMAL(10,2) NULL,
        reward_type NVARCHAR(50) NULL,
        reward_given BIT DEFAULT 0,
        reward_error NVARCHAR(255) NULL,
        
        processed_at DATETIME DEFAULT GETDATE(),
        processed_by NVARCHAR(100) DEFAULT 'SYSTEM_CRONJOB',
        
        -- Foreign key
        FOREIGN KEY (referral_id) REFERENCES referrals(id),
        INDEX IX_delayed_reward_logs_referral (referral_id),
        INDEX IX_delayed_reward_logs_user (user_jid, processed_at),
        INDEX IX_delayed_reward_logs_status (old_status, new_status, processed_at)
    );
    
    PRINT '✅ Created delayed_reward_logs table';
END;

-- =====================================================
-- 3. EXTENDED REFERRALS TABLE COLUMNS
-- =====================================================

PRINT 'Extending referrals table for delayed rewards...';

-- Processing metadata
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'last_processed_at')
BEGIN
    ALTER TABLE referrals ADD last_processed_at DATETIME NULL;
    PRINT '✅ Added last_processed_at column';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'next_process_at')
BEGIN
    ALTER TABLE referrals ADD next_process_at DATETIME NULL;
    PRINT '✅ Added next_process_at column';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'process_attempts')
BEGIN
    ALTER TABLE referrals ADD process_attempts INT DEFAULT 0;
    PRINT '✅ Added process_attempts column';
END;

-- Validation flags
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'validation_notes')
BEGIN
    ALTER TABLE referrals ADD validation_notes TEXT NULL;
    PRINT '✅ Added validation_notes column';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'auto_processed')
BEGIN
    ALTER TABLE referrals ADD auto_processed BIT DEFAULT 1;
    PRINT '✅ Added auto_processed column';
END;

-- Reward tracking
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'reward_amount')
BEGIN
    ALTER TABLE referrals ADD reward_amount DECIMAL(10,2) NULL;
    PRINT '✅ Added reward_amount column';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'reward_type')
BEGIN
    ALTER TABLE referrals ADD reward_type NVARCHAR(50) NULL;
    PRINT '✅ Added reward_type column';
END;

-- =====================================================
-- 4. DELAYED REWARD VIEWS
-- =====================================================

PRINT 'Creating delayed reward views...';

-- Pending Referrals Ready for Processing
IF OBJECT_ID('v_pending_referrals_ready', 'V') IS NOT NULL
    DROP VIEW v_pending_referrals_ready;
GO

CREATE VIEW v_pending_referrals_ready AS
WITH account_metrics AS (
    SELECT 
        r.id as referral_id,
        r.invited_jid,
        r.jid as referrer_jid,
        r.created_at as referral_created,
        
        -- Account age calculation
        DATEDIFF(day, u.reg_date, GETDATE()) as account_age_days,
        
        -- Character metrics (highest level, total playtime)
        ISNULL(char_stats.highest_level, 0) as highest_char_level,
        ISNULL(char_stats.total_playtime_minutes, 0) / 60.0 as total_playtime_hours,
        ISNULL(char_stats.total_chars, 0) as character_count,
        
        -- Login metrics
        ISNULL(login_stats.unique_login_days, 0) as unique_login_days,
        ISNULL(login_stats.total_logins, 0) as total_logins,
        login_stats.last_login,
        
        -- Requirements from settings
        (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_account_age_days') as req_age_days,
        (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_playtime_hours') as req_playtime_hours,
        (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_character_level') as req_char_level,
        (SELECT CAST(setting_value AS INT) FROM referral_settings WHERE setting_key = 'min_login_days') as req_login_days
        
    FROM referrals r
    JOIN [SILKROAD_R_ACCOUNT].[dbo].[TB_User] u ON r.invited_jid = u.JID
    
    -- Character statistics subquery
    LEFT JOIN (
        SELECT 
            UserJID,
            MAX(CurLevel) as highest_level,
            COUNT(*) as total_chars,
            SUM(PlayTime) as total_playtime_minutes
        FROM [SILKROAD_R_SHARD].[dbo].[_Char] 
        WHERE Deleted = 0
        GROUP BY UserJID
    ) char_stats ON r.invited_jid = char_stats.UserJID
    
    -- Login statistics subquery 
    LEFT JOIN (
        SELECT 
            UserJID,
            COUNT(DISTINCT CAST(EventTime AS DATE)) as unique_login_days,
            COUNT(*) as total_logins,
            MAX(EventTime) as last_login
        FROM [SILKROAD_R_LOG].[dbo].[_LogEventShard]
        WHERE EventID = 1 -- Login event
        GROUP BY UserJID
    ) login_stats ON r.invited_jid = login_stats.UserJID
    
    WHERE r.status = 'PENDING'
      AND r.requires_validation = 1
      AND (r.next_process_at IS NULL OR r.next_process_at <= GETDATE())
)
SELECT 
    referral_id,
    invited_jid,
    referrer_jid,
    referral_created,
    account_age_days,
    total_playtime_hours,
    highest_char_level,
    unique_login_days,
    total_logins,
    last_login,
    
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
    THEN 1 ELSE 0 END as qualifies_for_activation,
    
    -- Requirements for reference
    req_age_days,
    req_playtime_hours,
    req_char_level,
    req_login_days
    
FROM account_metrics;
GO

-- Suspicious Referral Accounts
IF OBJECT_ID('v_suspicious_referral_accounts', 'V') IS NOT NULL
    DROP VIEW v_suspicious_referral_accounts;
GO

CREATE VIEW v_suspicious_referral_accounts AS
SELECT 
    r.id as referral_id,
    r.invited_jid,
    r.jid as referrer_jid,
    r.status,
    r.created_at,
    
    -- Account metrics
    DATEDIFF(day, u.reg_date, GETDATE()) as account_age_days,
    u.last_login,
    
    -- Suspicious indicators
    CASE WHEN DATEDIFF(day, u.last_login, GETDATE()) > 30 THEN 1 ELSE 0 END as inactive_30_days,
    CASE WHEN NOT EXISTS (
        SELECT 1 FROM [SILKROAD_R_SHARD].[dbo].[_Char] 
        WHERE UserJID = r.invited_jid AND Deleted = 0
    ) THEN 1 ELSE 0 END as no_characters_created,
    
    -- Anti-cheat flags
    CASE WHEN EXISTS (
        SELECT 1 FROM referral_anticheat_logs 
        WHERE user_id = r.invited_jid AND is_suspicious = 1
    ) THEN 1 ELSE 0 END as has_anticheat_flags,
    
    -- Multiple referrals from same source
    (SELECT COUNT(*) FROM referrals r2 
     WHERE r2.ip_address = r.ip_address 
       AND r2.id != r.id) as same_ip_referrals,
    
    (SELECT COUNT(*) FROM referrals r2 
     WHERE r2.fingerprint = r.fingerprint 
       AND r2.id != r.id) as same_fingerprint_referrals

FROM referrals r
JOIN [SILKROAD_R_ACCOUNT].[dbo].[TB_User] u ON r.invited_jid = u.JID
WHERE r.status IN ('PENDING', 'ACTIVE')
  AND (
    DATEDIFF(day, u.last_login, GETDATE()) > 30 OR
    NOT EXISTS (SELECT 1 FROM [SILKROAD_R_SHARD].[dbo].[_Char] WHERE UserJID = r.invited_jid AND Deleted = 0) OR
    EXISTS (SELECT 1 FROM referral_anticheat_logs WHERE user_id = r.invited_jid AND is_suspicious = 1)
  );
GO

PRINT '✅ Created delayed reward views';

-- =====================================================
-- 5. STORED PROCEDURES FOR DELAYED PROCESSING
-- =====================================================

PRINT 'Creating delayed reward processing procedures...';

-- Main Processing Procedure
IF OBJECT_ID('sp_ProcessPendingReferrals', 'P') IS NOT NULL
    DROP PROCEDURE sp_ProcessPendingReferrals;
GO

CREATE PROCEDURE sp_ProcessPendingReferrals
    @batch_size INT = 50,
    @debug BIT = 0
AS
BEGIN
    DECLARE @processed_count INT = 0;
    DECLARE @activated_count INT = 0;
    DECLARE @rejected_count INT = 0;
    
    DECLARE @referral_id BIGINT;
    DECLARE @invited_jid INT;
    DECLARE @referrer_jid INT;
    DECLARE @qualifies BIT;
    DECLARE @processing_reason NVARCHAR(255);
    
    -- Check if delayed rewards are enabled
    DECLARE @delayed_enabled BIT = 0;
    SELECT @delayed_enabled = CASE WHEN setting_value = 'true' THEN 1 ELSE 0 END
    FROM referral_settings 
    WHERE setting_key = 'delayed_rewards_enabled';
    
    IF @delayed_enabled = 0
    BEGIN
        PRINT 'Delayed rewards are disabled. Skipping processing.';
        RETURN;
    END
    
    IF @debug = 1
        PRINT 'Starting delayed referral processing...';
    
    -- Cursor for pending referrals
    DECLARE referral_cursor CURSOR FOR
    SELECT TOP (@batch_size)
        referral_id, 
        invited_jid, 
        referrer_jid, 
        qualifies_for_activation
    FROM v_pending_referrals_ready
    ORDER BY referral_created ASC;
    
    OPEN referral_cursor;
    FETCH NEXT FROM referral_cursor INTO @referral_id, @invited_jid, @referrer_jid, @qualifies;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        BEGIN TRY
            IF @qualifies = 1
            BEGIN
                -- ACTIVATE the referral
                UPDATE referrals 
                SET status = 'ACTIVE',
                    requires_validation = 0,
                    reward_given_at = GETDATE(),
                    last_processed_at = GETDATE(),
                    process_attempts = process_attempts + 1,
                    validation_notes = 'Auto-activated: All requirements met'
                WHERE id = @referral_id;
                
                SET @processing_reason = 'ACTIVATED_REQUIREMENTS_MET';
                SET @activated_count = @activated_count + 1;
                
                -- TODO: Trigger actual reward distribution here
                -- EXEC sp_GiveReferralReward @referrer_jid, @invited_jid;
                
                IF @debug = 1
                    PRINT 'Activated referral ' + CAST(@referral_id AS NVARCHAR(10));
            END
            ELSE
            BEGIN
                -- Check if account is too old to still qualify
                DECLARE @account_age_days INT;
                DECLARE @grace_period_days INT;
                
                SELECT @account_age_days = account_age_days
                FROM v_pending_referrals_ready 
                WHERE referral_id = @referral_id;
                
                SELECT @grace_period_days = CAST(setting_value AS INT)
                FROM referral_settings 
                WHERE setting_key = 'reward_grace_period_days';
                
                IF @account_age_days > @grace_period_days
                BEGIN
                    -- REJECT - Too late
                    UPDATE referrals 
                    SET status = 'REJECTED',
                        requires_validation = 0,
                        last_processed_at = GETDATE(),
                        process_attempts = process_attempts + 1,
                        cheat_reason = 'GRACE_PERIOD_EXCEEDED',
                        validation_notes = 'Rejected: Grace period exceeded (' + CAST(@account_age_days AS NVARCHAR(10)) + ' days)'
                    WHERE id = @referral_id;
                    
                    SET @processing_reason = 'REJECTED_GRACE_PERIOD_EXCEEDED';
                    SET @rejected_count = @rejected_count + 1;
                    
                    IF @debug = 1
                        PRINT 'Rejected referral ' + CAST(@referral_id AS NVARCHAR(10)) + ' - Grace period exceeded';
                END
                ELSE
                BEGIN
                    -- KEEP PENDING - Schedule next check
                    UPDATE referrals 
                    SET next_process_at = DATEADD(day, 1, GETDATE()),
                        last_processed_at = GETDATE(),
                        process_attempts = process_attempts + 1,
                        validation_notes = 'Still pending: Requirements not yet met'
                    WHERE id = @referral_id;
                    
                    SET @processing_reason = 'KEPT_PENDING_REQUIREMENTS_NOT_MET';
                    
                    IF @debug = 1
                        PRINT 'Kept pending referral ' + CAST(@referral_id AS NVARCHAR(10)) + ' - Requirements not met';
                END
            END
            
            -- Log the processing
            INSERT INTO delayed_reward_logs (
                referral_id, user_jid, referrer_jid, 
                old_status, new_status, processing_reason,
                meets_age_requirement, meets_playtime_requirement, 
                meets_level_requirement, meets_login_requirement
            )
            SELECT 
                @referral_id, @invited_jid, @referrer_jid,
                'PENDING', 
                CASE WHEN @qualifies = 1 THEN 'ACTIVE' 
                     WHEN @account_age_days > @grace_period_days THEN 'REJECTED'
                     ELSE 'PENDING' END,
                @processing_reason,
                meets_age_requirement, meets_playtime_requirement,
                meets_level_requirement, meets_login_requirement
            FROM v_pending_referrals_ready 
            WHERE referral_id = @referral_id;
            
            SET @processed_count = @processed_count + 1;
            
        END TRY
        BEGIN CATCH
            -- Log error but continue processing
            PRINT 'Error processing referral ' + CAST(@referral_id AS NVARCHAR(10)) + ': ' + ERROR_MESSAGE();
            
            UPDATE referrals 
            SET process_attempts = process_attempts + 1,
                next_process_at = DATEADD(hour, 2, GETDATE()),
                validation_notes = 'Processing error: ' + ERROR_MESSAGE()
            WHERE id = @referral_id;
        END CATCH
        
        FETCH NEXT FROM referral_cursor INTO @referral_id, @invited_jid, @referrer_jid, @qualifies;
    END
    
    CLOSE referral_cursor;
    DEALLOCATE referral_cursor;
    
    -- Summary
    PRINT 'Delayed Referral Processing Complete:';
    PRINT '  Total Processed: ' + CAST(@processed_count AS NVARCHAR(10));
    PRINT '  Activated: ' + CAST(@activated_count AS NVARCHAR(10));
    PRINT '  Rejected: ' + CAST(@rejected_count AS NVARCHAR(10));
    PRINT '  Kept Pending: ' + CAST(@processed_count - @activated_count - @rejected_count AS NVARCHAR(10));
END;
GO

-- Individual Referral Check Procedure
IF OBJECT_ID('sp_CheckReferralEligibility', 'P') IS NOT NULL
    DROP PROCEDURE sp_CheckReferralEligibility;
GO

CREATE PROCEDURE sp_CheckReferralEligibility
    @referral_id BIGINT,
    @eligible BIT OUTPUT,
    @reason NVARCHAR(255) OUTPUT
AS
BEGIN
    DECLARE @qualifies BIT = 0;
    
    SELECT @qualifies = qualifies_for_activation
    FROM v_pending_referrals_ready 
    WHERE referral_id = @referral_id;
    
    IF @qualifies IS NULL
    BEGIN
        SET @eligible = 0;
        SET @reason = 'Referral not found or not in PENDING status';
        RETURN;
    END
    
    SET @eligible = @qualifies;
    
    IF @qualifies = 1
        SET @reason = 'All requirements met - eligible for activation';
    ELSE
        SET @reason = 'Requirements not yet met - see v_pending_referrals_ready for details';
END;
GO

PRINT '✅ Created delayed reward processing procedures';

-- =====================================================
-- 6. INDEXES FOR PERFORMANCE
-- =====================================================

PRINT 'Creating delayed reward performance indexes...';

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_delayed_processing')
BEGIN
    CREATE INDEX IX_referrals_delayed_processing 
    ON referrals (status, requires_validation, next_process_at, created_at);
    PRINT '✅ Created delayed processing index';
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_delayed_reward_logs_processing')
BEGIN
    CREATE INDEX IX_delayed_reward_logs_processing 
    ON delayed_reward_logs (processed_at, new_status, processing_reason);
    PRINT '✅ Created delayed reward logs index';
END;

-- =====================================================
-- 7. INITIALIZE EXISTING DATA
-- =====================================================

PRINT 'Initializing existing referral data for delayed rewards...';

-- Set appropriate status for existing referrals
UPDATE referrals 
SET status = CASE 
    WHEN is_valid = 1 AND reward_given_at IS NOT NULL THEN 'ACTIVE'
    WHEN is_valid = 0 THEN 'REJECTED'
    ELSE 'PENDING'
END,
requires_validation = CASE 
    WHEN is_valid = 1 THEN 0
    ELSE 1
END,
next_process_at = CASE 
    WHEN is_valid IS NULL OR is_valid = 1 THEN GETDATE()
    ELSE NULL
END
WHERE status IS NULL OR status = '';

PRINT '✅ Initialized existing referral data';

-- =====================================================
-- 8. TEST DATA & VALIDATION
-- =====================================================

PRINT 'Running validation checks...';

-- Summary of current state
PRINT '';
PRINT 'Current Delayed Reward System Status:';

SELECT 
    'Settings' as category,
    COUNT(*) as count
FROM referral_settings 
WHERE setting_key LIKE '%delayed%' 
   OR setting_key LIKE '%min_%'
   OR setting_key LIKE '%cronjob%'

UNION ALL

SELECT 
    'Pending Referrals' as category,
    COUNT(*) as count
FROM v_pending_referrals_ready

UNION ALL

SELECT 
    'Referrals by Status' as category,
    0 as count

UNION ALL

SELECT 
    '  ' + status,
    COUNT(*)
FROM referrals 
GROUP BY status;

PRINT '';
PRINT '🎉 Delayed Reward System Implementation Complete!';
PRINT '';
PRINT 'System Features:';
PRINT '✅ 3-Status Workflow: PENDING → ACTIVE → REJECTED';
PRINT '✅ Automatic validation based on account age & gameplay';
PRINT '✅ Configurable requirements (14 days, 10 hours, level 10, 7 login days)';
PRINT '✅ Grace period handling (30 days default)';
PRINT '✅ Comprehensive logging and monitoring';
PRINT '✅ Performance-optimized with proper indexes';
PRINT '';
PRINT 'Next Steps:';
PRINT '1. Set up cronjob to call sp_ProcessPendingReferrals every 6 hours';
PRINT '2. Implement actual reward distribution in sp_ProcessPendingReferrals';
PRINT '3. Update frontend to show PENDING status to users';
PRINT '4. Test the workflow with new referral registrations';
PRINT '';
PRINT 'Manual Processing:';
PRINT '  EXEC sp_ProcessPendingReferrals @debug = 1;';
PRINT '  EXEC sp_CheckReferralEligibility @referral_id = 123;';
PRINT '';
PRINT '🚀 Delayed rewards will prevent Hit-and-Run abuse!';