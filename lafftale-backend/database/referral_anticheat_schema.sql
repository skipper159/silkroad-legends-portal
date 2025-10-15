USE SRO_CMS
GO

-- Anti-Cheat Erweiterungen für Referral System
-- Basierend auf SRO-CMS Implementierung

-- Prüfe ob referrals Tabelle existiert
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'referrals')
BEGIN
    PRINT 'FEHLER: referrals Tabelle existiert nicht. Bitte zuerst das Basis-Referral-System installieren.'
    RETURN
END
GO

-- Erweitere die referrals Tabelle um Anti-Cheat Felder
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'ip_address')
BEGIN
    ALTER TABLE referrals ADD ip_address NVARCHAR(45) NULL;
    PRINT 'Spalte ip_address zur referrals Tabelle hinzugefügt'
END
ELSE
BEGIN
    PRINT 'Spalte ip_address existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'fingerprint')
BEGIN
    ALTER TABLE referrals ADD fingerprint NVARCHAR(255) NULL;
    PRINT 'Spalte fingerprint zur referrals Tabelle hinzugefügt'
END
ELSE
BEGIN
    PRINT 'Spalte fingerprint existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'is_valid')
BEGIN
    ALTER TABLE referrals ADD is_valid BIT DEFAULT 1;
    PRINT 'Spalte is_valid zur referrals Tabelle hinzugefügt'
END
ELSE
BEGIN
    PRINT 'Spalte is_valid existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'cheat_reason')
BEGIN
    ALTER TABLE referrals ADD cheat_reason NVARCHAR(100) NULL;
    PRINT 'Spalte cheat_reason zur referrals Tabelle hinzugefügt'
END
ELSE
BEGIN
    PRINT 'Spalte cheat_reason existiert bereits'
END
GO

-- Erstelle Anti-Cheat Monitoring Tabelle
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'referral_anticheat_logs')
BEGIN
    CREATE TABLE referral_anticheat_logs (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id BIGINT NULL,
        ip_address NVARCHAR(45) NOT NULL,
        fingerprint NVARCHAR(255) NULL,
        action NVARCHAR(50) NOT NULL, -- 'REGISTRATION', 'REFERRAL_USE', 'CODE_CREATION'
        referral_code NVARCHAR(50) NULL,
        is_suspicious BIT DEFAULT 0,
        detection_reason NVARCHAR(255) NULL, -- 'IP_DUPLICATE', 'FINGERPRINT_DUPLICATE', 'RATE_LIMIT', etc.
        user_agent NVARCHAR(500) NULL,
        created_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'referral_anticheat_logs Tabelle erstellt'
END
ELSE
BEGIN
    PRINT 'referral_anticheat_logs Tabelle existiert bereits'
END
GO

-- Erstelle Indizes für bessere Performance bei Anti-Cheat Prüfungen
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_ip_address' AND object_id = OBJECT_ID('referrals'))
BEGIN
    CREATE INDEX IX_referrals_ip_address ON referrals (ip_address);
    PRINT 'Index IX_referrals_ip_address erstellt'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_fingerprint' AND object_id = OBJECT_ID('referrals'))
BEGIN
    CREATE INDEX IX_referrals_fingerprint ON referrals (fingerprint);
    PRINT 'Index IX_referrals_fingerprint erstellt'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_created_at' AND object_id = OBJECT_ID('referrals'))
BEGIN
    CREATE INDEX IX_referrals_created_at ON referrals (created_at);
    PRINT 'Index IX_referrals_created_at erstellt'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_jid_valid' AND object_id = OBJECT_ID('referrals'))
BEGIN
    CREATE INDEX IX_referrals_jid_valid ON referrals (jid, is_valid);
    PRINT 'Index IX_referrals_jid_valid erstellt'
END
GO

-- Anti-Cheat Einstellungen erweitern (nur wenn referral_settings Tabelle existiert)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'referral_settings')
BEGIN
    -- Füge Anti-Cheat Einstellungen hinzu (nur wenn sie noch nicht existieren)
    IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'anticheat_enabled')
        INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
        VALUES ('anticheat_enabled', 'true', 'Enable anti-cheat protection for referrals', GETDATE(), GETDATE())
    
    -- GEÄNDERT: Von "per_day" zu "lifetime" für strikte IP-Kontrolle
    IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'max_referrals_per_ip_lifetime')
        INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
        VALUES ('max_referrals_per_ip_lifetime', '1', 'Maximum referrals allowed per IP address (lifetime/total). Set to 1 to allow only one referral per IP ever.', GETDATE(), GETDATE())
    
    -- GEÄNDERT: Von "per_day" zu "lifetime" für strikte Fingerprint-Kontrolle
    IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'max_referrals_per_fingerprint_lifetime')
        INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
        VALUES ('max_referrals_per_fingerprint_lifetime', '1', 'Maximum referrals allowed per browser fingerprint (lifetime/total). Set to 1 to allow only one referral per device ever.', GETDATE(), GETDATE())
    
    IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'block_duplicate_ip_referrals')
        INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
        VALUES ('block_duplicate_ip_referrals', 'true', 'Block referrals from same IP as referrer', GETDATE(), GETDATE())
    
    IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'block_duplicate_fingerprint_referrals')
        INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
        VALUES ('block_duplicate_fingerprint_referrals', 'true', 'Block referrals from same fingerprint as referrer', GETDATE(), GETDATE())
    
    -- NEU: Strikte Lifetime-Blockierung
    IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'block_duplicate_ip_completely')
        INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
        VALUES ('block_duplicate_ip_completely', 'true', 'Block any referral attempt from an IP that has already been used for any referral (lifetime blocking)', GETDATE(), GETDATE())
    
    IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'suspicious_referral_review_required')
        INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
        VALUES ('suspicious_referral_review_required', 'true', 'Require manual admin review for suspicious referrals', GETDATE(), GETDATE())
    
    PRINT 'Anti-Cheat Einstellungen hinzugefügt (mit LIFETIME statt per-day Limits)'
END
ELSE
BEGIN
    PRINT 'WARNUNG: referral_settings Tabelle existiert nicht - Einstellungen übersprungen'
END
GO

-- Aktualisiere bestehende referrals mit Standard-Werten
UPDATE referrals SET 
    is_valid = 1,
    ip_address = '127.0.0.1',
    fingerprint = 'legacy_' + CAST(id AS NVARCHAR(20))
WHERE ip_address IS NULL;

PRINT 'Bestehende referrals mit Standard-Werten aktualisiert'
GO

PRINT 'Anti-Cheat Datenbank Schema erfolgreich erweitert'
GO