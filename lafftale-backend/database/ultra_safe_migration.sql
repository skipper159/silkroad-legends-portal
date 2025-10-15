-- =====================================================
-- ULTRA-SAFE REFERRAL ANTI-CHEAT & DELAYED REWARDS MIGRATION
-- =====================================================
-- This script executes each step individually to avoid any dependency issues

USE SRO_CMS;

-- =====================================================
-- STEP 1: CREATE BACKUP TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'referral_settings_backup')
BEGIN
    CREATE TABLE referral_settings_backup (
        backup_date DATETIME DEFAULT GETDATE(),
        setting_key NVARCHAR(100),
        old_value NVARCHAR(500),
        new_value NVARCHAR(500)
    );
END;

-- =====================================================
-- STEP 2: UPDATE IP LIFETIME SETTINGS
-- =====================================================
IF EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'max_referrals_per_ip_per_day')
BEGIN
    INSERT INTO referral_settings_backup (setting_key, old_value, new_value)
    SELECT 'max_referrals_per_ip_per_day', setting_value, '1' 
    FROM referral_settings 
    WHERE setting_key = 'max_referrals_per_ip_per_day';
    
    UPDATE referral_settings 
    SET setting_key = 'max_referrals_per_ip_lifetime',
        setting_value = '1',
        updated_at = GETDATE()
    WHERE setting_key = 'max_referrals_per_ip_per_day';
END
ELSE IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'max_referrals_per_ip_lifetime')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, created_at, updated_at)
    VALUES ('max_referrals_per_ip_lifetime', '1', GETDATE(), GETDATE());
END;

-- =====================================================
-- STEP 3: UPDATE FINGERPRINT LIFETIME SETTINGS
-- =====================================================
IF EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'max_referrals_per_fingerprint_per_day')
BEGIN
    INSERT INTO referral_settings_backup (setting_key, old_value, new_value)
    SELECT 'max_referrals_per_fingerprint_per_day', setting_value, '1' 
    FROM referral_settings 
    WHERE setting_key = 'max_referrals_per_fingerprint_per_day';
    
    UPDATE referral_settings 
    SET setting_key = 'max_referrals_per_fingerprint_lifetime',
        setting_value = '1',
        updated_at = GETDATE()
    WHERE setting_key = 'max_referrals_per_fingerprint_per_day';
END
ELSE IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'max_referrals_per_fingerprint_lifetime')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, created_at, updated_at)
    VALUES ('max_referrals_per_fingerprint_lifetime', '1', GETDATE(), GETDATE());
END;

-- =====================================================
-- STEP 4: ADD BLOCKING SETTINGS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'block_duplicate_ip_completely')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, created_at, updated_at)
    VALUES ('block_duplicate_ip_completely', 'true', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'block_duplicate_fingerprint_referrals')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, created_at, updated_at)
    VALUES ('block_duplicate_fingerprint_referrals', 'true', GETDATE(), GETDATE());
END;

-- =====================================================
-- STEP 5: ADD STATUS COLUMN
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'status')
BEGIN
    ALTER TABLE referrals ADD status NVARCHAR(20) DEFAULT 'PENDING';
END;

-- =====================================================
-- STEP 6: ADD REQUIRES_VALIDATION COLUMN
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'requires_validation')
BEGIN
    ALTER TABLE referrals ADD requires_validation BIT DEFAULT 1;
END;

-- =====================================================
-- STEP 7: ADD REWARD_GIVEN_AT COLUMN
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'reward_given_at')
BEGIN
    ALTER TABLE referrals ADD reward_given_at DATETIME NULL;
END;

-- =====================================================
-- STEP 8: ADD CHEAT_REASON COLUMN
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'cheat_reason')
BEGIN
    ALTER TABLE referrals ADD cheat_reason NVARCHAR(255) NULL;
END;

-- =====================================================
-- STEP 9: ADD PROCESSING METADATA COLUMNS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'last_processed_at')
BEGIN
    ALTER TABLE referrals ADD last_processed_at DATETIME NULL;
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'next_process_at')
BEGIN
    ALTER TABLE referrals ADD next_process_at DATETIME NULL;
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'process_attempts')
BEGIN
    ALTER TABLE referrals ADD process_attempts INT DEFAULT 0;
END;

-- =====================================================
-- STEP 10: ADD VALIDATION AND REWARD TRACKING COLUMNS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'validation_notes')
BEGIN
    ALTER TABLE referrals ADD validation_notes TEXT NULL;
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'auto_processed')
BEGIN
    ALTER TABLE referrals ADD auto_processed BIT DEFAULT 1;
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'reward_amount')
BEGIN
    ALTER TABLE referrals ADD reward_amount DECIMAL(10,2) NULL;
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'reward_type')
BEGIN
    ALTER TABLE referrals ADD reward_type NVARCHAR(50) NULL;
END;

-- =====================================================
-- STEP 11: CREATE ANTI-CHEAT LOGS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'referral_anticheat_logs')
BEGIN
    CREATE TABLE referral_anticheat_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NULL,
        ip_address NVARCHAR(45) NOT NULL,
        fingerprint NVARCHAR(500) NULL,
        action NVARCHAR(100) NOT NULL,
        detection_reason NVARCHAR(255) NULL,
        is_suspicious BIT DEFAULT 0,
        confidence_score DECIMAL(3,2) DEFAULT 0.0,
        
        layer_1_ip_used BIT DEFAULT 0,
        layer_2_fingerprint_used BIT DEFAULT 0,
        layer_3_account_age_insufficient BIT DEFAULT 0,
        layer_4_gameplay_insufficient BIT DEFAULT 0,
        layer_5_pattern_suspicious BIT DEFAULT 0,
        layer_6_honeypot_triggered BIT DEFAULT 0,
        layer_7_behavioral_match BIT DEFAULT 0,
        layer_8_network_suspicious BIT DEFAULT 0,
        
        user_agent NVARCHAR(500) NULL,
        form_fill_time_ms INT NULL,
        mouse_movements TEXT NULL,
        scroll_events TEXT NULL,
        timezone NVARCHAR(50) NULL,
        screen_resolution NVARCHAR(20) NULL,
        language NVARCHAR(10) NULL,
        platform NVARCHAR(50) NULL,
        
        isp_name NVARCHAR(100) NULL,
        country_code NVARCHAR(3) NULL,
        city NVARCHAR(100) NULL,
        is_vpn BIT DEFAULT 0,
        is_proxy BIT DEFAULT 0,
        is_tor BIT DEFAULT 0,
        is_hosting BIT DEFAULT 0,
        
        created_at DATETIME DEFAULT GETDATE()
    );
END;

-- =====================================================
-- STEP 12: CREATE VPN DETECTION TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'known_vpn_ips')
BEGIN
    CREATE TABLE known_vpn_ips (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ip_address NVARCHAR(45) NOT NULL UNIQUE,
        provider NVARCHAR(100) NULL,
        country_code NVARCHAR(3) NULL,
        confidence DECIMAL(3,2) DEFAULT 1.0,
        is_active BIT DEFAULT 1,
        first_detected DATETIME DEFAULT GETDATE(),
        last_seen DATETIME DEFAULT GETDATE(),
        detection_count INT DEFAULT 1
    );
END;

-- =====================================================
-- STEP 13: CREATE BEHAVIORAL FINGERPRINTS TABLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'behavioral_fingerprints')
BEGIN
    CREATE TABLE behavioral_fingerprints (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NULL,
        fingerprint_hash NVARCHAR(64) NOT NULL,
        mouse_pattern_hash NVARCHAR(64) NULL,
        scroll_pattern_hash NVARCHAR(64) NULL,
        typing_pattern_hash NVARCHAR(64) NULL,
        similarity_cluster INT NULL,
        confidence_score DECIMAL(3,2) DEFAULT 1.0,
        registration_count INT DEFAULT 1,
        first_seen DATETIME DEFAULT GETDATE(),
        last_seen DATETIME DEFAULT GETDATE()
    );
END;

-- =====================================================
-- STEP 14: CREATE DELAYED REWARD LOGS TABLE
-- =====================================================
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
        
        account_age_days INT NULL,
        total_playtime_hours DECIMAL(10,2) NULL,
        highest_char_level INT NULL,
        unique_login_days INT NULL,
        total_logins INT NULL,
        last_login DATETIME NULL,
        
        meets_age_requirement BIT DEFAULT 0,
        meets_playtime_requirement BIT DEFAULT 0,
        meets_level_requirement BIT DEFAULT 0,
        meets_login_requirement BIT DEFAULT 0,
        has_suspicious_activity BIT DEFAULT 0,
        
        reward_amount DECIMAL(10,2) NULL,
        reward_type NVARCHAR(50) NULL,
        reward_given BIT DEFAULT 0,
        reward_error NVARCHAR(255) NULL,
        
        processed_at DATETIME DEFAULT GETDATE(),
        processed_by NVARCHAR(100) DEFAULT 'SYSTEM_CRONJOB'
    );
END;

-- =====================================================
-- STEP 15: ADD PATTERN DETECTION SETTINGS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'pattern_detection_enabled')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('pattern_detection_enabled', 'true', 'Enable rapid-fire and time-based pattern detection', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'max_registrations_per_hour')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('max_registrations_per_hour', '3', 'Maximum registrations allowed per hour from any source', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'min_form_fill_time_seconds')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('min_form_fill_time_seconds', '3', 'Minimum time required to fill registration form (bot detection)', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'rapid_fire_window_minutes')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('rapid_fire_window_minutes', '5', 'Time window for rapid-fire detection', GETDATE(), GETDATE());
END;

-- =====================================================
-- STEP 16: ADD BEHAVIORAL ANALYSIS SETTINGS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'behavioral_analysis_enabled')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('behavioral_analysis_enabled', 'true', 'Enable mouse/scroll behavioral fingerprinting', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'behavioral_similarity_threshold')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('behavioral_similarity_threshold', '0.85', 'Threshold for behavioral pattern similarity (0.0-1.0)', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'mouse_movement_required')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('mouse_movement_required', 'false', 'Require mouse movement data for registration', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'behavioral_min_events')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('behavioral_min_events', '5', 'Minimum mouse/scroll events required', GETDATE(), GETDATE());
END;

-- =====================================================
-- STEP 17: ADD HONEYPOT SETTINGS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'honeypot_traps_enabled')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('honeypot_traps_enabled', 'true', 'Enable honeypot form fields for bot detection', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'honeypot_field_names')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('honeypot_field_names', 'phone,address,website,company', 'Comma-separated honeypot field names', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'honeypot_auto_block')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('honeypot_auto_block', 'true', 'Automatically block if honeypot field is filled', GETDATE(), GETDATE());
END;

-- =====================================================
-- STEP 18: ADD NETWORK ANALYSIS SETTINGS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'network_analysis_enabled')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('network_analysis_enabled', 'true', 'Enable VPN/Proxy/Hosting detection', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'block_vpn_registrations')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('block_vpn_registrations', 'false', 'Automatically block known VPN IPs', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'block_hosting_ips')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('block_hosting_ips', 'true', 'Block data center/hosting provider IPs', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'timezone_mismatch_suspicious')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('timezone_mismatch_suspicious', 'true', 'Flag timezone mismatches as suspicious', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'vpn_confidence_threshold')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('vpn_confidence_threshold', '0.8', 'Confidence threshold for VPN detection', GETDATE(), GETDATE());
END;

-- =====================================================
-- STEP 19: ADD DELAYED REWARDS SETTINGS
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'delayed_rewards_enabled')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('delayed_rewards_enabled', 'true', 'Enable delayed reward system (PENDING → ACTIVE workflow)', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'min_account_age_days')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('min_account_age_days', '14', 'Minimum account age in days before reward activation', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'min_playtime_hours')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('min_playtime_hours', '10', 'Minimum total playtime in hours before reward activation', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'min_character_level')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('min_character_level', '10', 'Minimum character level required for reward activation', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'min_login_days')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('min_login_days', '7', 'Minimum unique login days required for reward activation', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'cronjob_interval_hours')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('cronjob_interval_hours', '6', 'How often to run delayed reward processing (hours)', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'reward_grace_period_days')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('reward_grace_period_days', '30', 'Days after account creation to still qualify for rewards', GETDATE(), GETDATE());
END;

IF NOT EXISTS (SELECT 1 FROM referral_settings WHERE setting_key = 'auto_reject_inactive_days')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES ('auto_reject_inactive_days', '60', 'Auto-reject referrals if account inactive for X days', GETDATE(), GETDATE());
END;

-- =====================================================
-- STEP 20: ADD TEST VPN DATA
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM known_vpn_ips WHERE ip_address = '185.220.70.0')
BEGIN
    INSERT INTO known_vpn_ips (ip_address, provider, country_code, confidence)
    VALUES ('185.220.70.0', 'NordVPN', 'DE', 0.95);
END;

IF NOT EXISTS (SELECT 1 FROM known_vpn_ips WHERE ip_address = '139.99.96.0')
BEGIN
    INSERT INTO known_vpn_ips (ip_address, provider, country_code, confidence)
    VALUES ('139.99.96.0', 'ExpressVPN', 'US', 0.98);
END;

IF NOT EXISTS (SELECT 1 FROM known_vpn_ips WHERE ip_address = '185.220.71.0')
BEGIN
    INSERT INTO known_vpn_ips (ip_address, provider, country_code, confidence)
    VALUES ('185.220.71.0', 'Surfshark', 'NL', 0.92);
END;

IF NOT EXISTS (SELECT 1 FROM known_vpn_ips WHERE ip_address = '45.33.32.156')
BEGIN
    INSERT INTO known_vpn_ips (ip_address, provider, country_code, confidence)
    VALUES ('45.33.32.156', 'ProtonVPN', 'CH', 0.89);
END;

-- =====================================================
-- STEP 21: CREATE INDEXES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_anticheat_logs_ip')
BEGIN
    CREATE INDEX IX_anticheat_logs_ip ON referral_anticheat_logs (ip_address, created_at);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_anticheat_logs_fingerprint')
BEGIN
    CREATE INDEX IX_anticheat_logs_fingerprint ON referral_anticheat_logs (fingerprint);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_anticheat_logs_suspicious')
BEGIN
    CREATE INDEX IX_anticheat_logs_suspicious ON referral_anticheat_logs (is_suspicious, created_at);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_anticheat_logs_user')
BEGIN
    CREATE INDEX IX_anticheat_logs_user ON referral_anticheat_logs (user_id, created_at);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_known_vpn_ips_lookup')
BEGIN
    CREATE INDEX IX_known_vpn_ips_lookup ON known_vpn_ips (ip_address, is_active);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_behavioral_fingerprints_hash')
BEGIN
    CREATE INDEX IX_behavioral_fingerprints_hash ON behavioral_fingerprints (fingerprint_hash);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_behavioral_fingerprints_cluster')
BEGIN
    CREATE INDEX IX_behavioral_fingerprints_cluster ON behavioral_fingerprints (similarity_cluster, confidence_score);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_delayed_reward_logs_referral')
BEGIN
    CREATE INDEX IX_delayed_reward_logs_referral ON delayed_reward_logs (referral_id);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_delayed_reward_logs_user')
BEGIN
    CREATE INDEX IX_delayed_reward_logs_user ON delayed_reward_logs (user_jid, processed_at);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_delayed_reward_logs_status')
BEGIN
    CREATE INDEX IX_delayed_reward_logs_status ON delayed_reward_logs (old_status, new_status, processed_at);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_ip_lifetime')
BEGIN
    CREATE INDEX IX_referrals_ip_lifetime ON referrals (ip_address, is_valid);
END;

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_fingerprint_lifetime')
BEGIN
    CREATE INDEX IX_referrals_fingerprint_lifetime ON referrals (fingerprint, is_valid);
END;

-- =====================================================
-- STEP 22: SAFELY UPDATE EXISTING DATA
-- =====================================================
-- Only update records that don't have a status yet, avoiding circular references
UPDATE referrals 
SET status = CASE 
    WHEN is_valid = 1 THEN 'ACTIVE'
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
WHERE status IS NULL;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================