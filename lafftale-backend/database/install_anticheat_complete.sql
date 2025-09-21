USE SRO_CMS
GO

-- ===================================================================
-- ANTI-CHEAT SYSTEM INSTALLATION FÜR REFERRAL-SYSTEM
-- ===================================================================
-- WICHTIG: Dieses Skript muss NACH dem Basis-Referral-System ausgeführt werden!
-- Führe zuerst referral_system_complete.sql aus, dann dieses Skript.
-- ===================================================================

PRINT '=== ANTI-CHEAT SYSTEM INSTALLATION STARTET ==='
PRINT 'Checking prerequisites...'
GO

-- Prüfe Voraussetzungen
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'referrals')
BEGIN
    PRINT '❌ FEHLER: referrals Tabelle existiert nicht!'
    PRINT 'Bitte führe zuerst das Basis-Referral-System aus: referral_system_complete.sql'
    RAISERROR('referrals Tabelle nicht gefunden', 16, 1)
    RETURN
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'referral_settings')
BEGIN
    PRINT '❌ FEHLER: referral_settings Tabelle existiert nicht!'
    PRINT 'Bitte führe zuerst das Basis-Referral-System aus: referral_system_complete.sql'
    RAISERROR('referral_settings Tabelle nicht gefunden', 16, 1)
    RETURN
END

PRINT '✅ Basis-Referral-System gefunden'
PRINT ''
GO

-- ===================================================================
-- SCHRITT 1: TABELLEN-SCHEMA ERWEITERN
-- ===================================================================
PRINT '=== SCHRITT 1: TABELLEN-SCHEMA ERWEITERN ==='
GO

-- Erweitere die referrals Tabelle um Anti-Cheat Felder
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'ip_address')
BEGIN
    ALTER TABLE referrals ADD ip_address NVARCHAR(45) NULL;
    PRINT '✅ Spalte ip_address zur referrals Tabelle hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Spalte ip_address existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'fingerprint')
BEGIN
    ALTER TABLE referrals ADD fingerprint NVARCHAR(255) NULL;
    PRINT '✅ Spalte fingerprint zur referrals Tabelle hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Spalte fingerprint existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'is_valid')
BEGIN
    ALTER TABLE referrals ADD is_valid BIT DEFAULT 1;
    PRINT '✅ Spalte is_valid zur referrals Tabelle hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Spalte is_valid existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('referrals') AND name = 'cheat_reason')
BEGIN
    ALTER TABLE referrals ADD cheat_reason NVARCHAR(100) NULL;
    PRINT '✅ Spalte cheat_reason zur referrals Tabelle hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Spalte cheat_reason existiert bereits'
END
GO

-- ===================================================================
-- SCHRITT 2: MONITORING TABELLE ERSTELLEN
-- ===================================================================
PRINT '=== SCHRITT 2: MONITORING TABELLE ERSTELLEN ==='
GO

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
    PRINT '✅ referral_anticheat_logs Tabelle erstellt'
END
ELSE
BEGIN
    PRINT '⚠️  referral_anticheat_logs Tabelle existiert bereits'
END
GO

-- ===================================================================
-- SCHRITT 3: PERFORMANCE INDIZES ERSTELLEN
-- ===================================================================
PRINT '=== SCHRITT 3: PERFORMANCE INDIZES ERSTELLEN ==='
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_ip_address' AND object_id = OBJECT_ID('referrals'))
BEGIN
    CREATE INDEX IX_referrals_ip_address ON referrals (ip_address);
    PRINT '✅ Index IX_referrals_ip_address erstellt'
END
ELSE
BEGIN
    PRINT '⚠️  Index IX_referrals_ip_address existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_fingerprint' AND object_id = OBJECT_ID('referrals'))
BEGIN
    CREATE INDEX IX_referrals_fingerprint ON referrals (fingerprint);
    PRINT '✅ Index IX_referrals_fingerprint erstellt'
END
ELSE
BEGIN
    PRINT '⚠️  Index IX_referrals_fingerprint existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_created_at' AND object_id = OBJECT_ID('referrals'))
BEGIN
    CREATE INDEX IX_referrals_created_at ON referrals (created_at);
    PRINT '✅ Index IX_referrals_created_at erstellt'
END
ELSE
BEGIN
    PRINT '⚠️  Index IX_referrals_created_at existiert bereits'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_referrals_jid_valid' AND object_id = OBJECT_ID('referrals'))
BEGIN
    CREATE INDEX IX_referrals_jid_valid ON referrals (jid, is_valid);
    PRINT '✅ Index IX_referrals_jid_valid erstellt'
END
ELSE
BEGIN
    PRINT '⚠️  Index IX_referrals_jid_valid existiert bereits'
END
GO

-- ===================================================================
-- SCHRITT 4: ANTI-CHEAT EINSTELLUNGEN HINZUFÜGEN
-- ===================================================================
PRINT '=== SCHRITT 4: ANTI-CHEAT EINSTELLUNGEN HINZUFÜGEN ==='
GO

-- Füge Anti-Cheat Einstellungen hinzu (nur wenn sie noch nicht existieren)
IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'anticheat_enabled')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
    VALUES ('anticheat_enabled', 'true', 'Enable anti-cheat protection for referrals', GETDATE(), GETDATE())
    PRINT '✅ Setting anticheat_enabled hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Setting anticheat_enabled existiert bereits'
END

IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'max_referrals_per_ip_per_day')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
    VALUES ('max_referrals_per_ip_per_day', '5', 'Maximum referrals allowed per IP address per day', GETDATE(), GETDATE())
    PRINT '✅ Setting max_referrals_per_ip_per_day hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Setting max_referrals_per_ip_per_day existiert bereits'
END

IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'max_referrals_per_fingerprint_per_day')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
    VALUES ('max_referrals_per_fingerprint_per_day', '3', 'Maximum referrals allowed per browser fingerprint per day', GETDATE(), GETDATE())
    PRINT '✅ Setting max_referrals_per_fingerprint_per_day hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Setting max_referrals_per_fingerprint_per_day existiert bereits'
END

IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'block_duplicate_ip_referrals')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
    VALUES ('block_duplicate_ip_referrals', 'true', 'Block referrals from same IP as referrer', GETDATE(), GETDATE())
    PRINT '✅ Setting block_duplicate_ip_referrals hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Setting block_duplicate_ip_referrals existiert bereits'
END

IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'block_duplicate_fingerprint_referrals')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
    VALUES ('block_duplicate_fingerprint_referrals', 'true', 'Block referrals from same fingerprint as referrer', GETDATE(), GETDATE())
    PRINT '✅ Setting block_duplicate_fingerprint_referrals hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Setting block_duplicate_fingerprint_referrals existiert bereits'
END

IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'suspicious_referral_review_required')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at) 
    VALUES ('suspicious_referral_review_required', 'true', 'Require manual admin review for suspicious referrals', GETDATE(), GETDATE())
    PRINT '✅ Setting suspicious_referral_review_required hinzugefügt'
END
ELSE
BEGIN
    PRINT '⚠️  Setting suspicious_referral_review_required existiert bereits'
END
GO

-- ===================================================================
-- SCHRITT 5: BESTEHENDE DATEN AKTUALISIEREN
-- ===================================================================
PRINT '=== SCHRITT 5: BESTEHENDE DATEN AKTUALISIEREN ==='
GO

-- Aktualisiere bestehende referrals mit Standard-Werten
DECLARE @updated_count INT
UPDATE referrals SET 
    is_valid = 1,
    ip_address = '127.0.0.1',
    fingerprint = 'legacy_' + CAST(id AS NVARCHAR(20))
WHERE ip_address IS NULL;

SET @updated_count = @@ROWCOUNT
PRINT '✅ ' + CAST(@updated_count AS NVARCHAR(10)) + ' bestehende referrals mit Standard-Werten aktualisiert'
GO

-- ===================================================================
-- SCHRITT 6: MONITORING VIEWS ERSTELLEN
-- ===================================================================
PRINT '=== SCHRITT 6: MONITORING VIEWS ERSTELLEN ==='
GO

-- View für verdächtige Referral-Aktivitäten
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_suspicious_referrals')
BEGIN
    DROP VIEW v_suspicious_referrals;
    PRINT '🔄 Alte v_suspicious_referrals View entfernt'
END
GO

CREATE VIEW v_suspicious_referrals AS
SELECT 
    r.id,
    r.code,
    r.jid as referrer_jid,
    u_referrer.username as referrer_username,
    r.invited_jid,
    u_invited.username as invited_username,
    r.points,
    r.redeemed,
    r.ip_address,
    r.fingerprint,
    r.is_valid,
    r.cheat_reason,
    r.created_at,
    -- Zusätzliche Analysedaten
    (SELECT COUNT(*) FROM referrals r2 WHERE r2.ip_address = r.ip_address AND r2.jid = r.jid) as same_ip_count,
    (SELECT COUNT(*) FROM referrals r3 WHERE r3.fingerprint = r.fingerprint AND r3.jid = r.jid) as same_fingerprint_count
FROM referrals r
LEFT JOIN users u_referrer ON r.jid = u_referrer.id
LEFT JOIN users u_invited ON r.invited_jid = u_invited.id
WHERE r.is_valid = 0 OR r.cheat_reason IS NOT NULL;
GO

PRINT '✅ View v_suspicious_referrals erstellt'
GO

-- View für IP-basierte Statistiken
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_ip_referral_stats')
BEGIN
    DROP VIEW v_ip_referral_stats;
    PRINT '🔄 Alte v_ip_referral_stats View entfernt'
END
GO

CREATE VIEW v_ip_referral_stats AS
SELECT 
    ip_address,
    COUNT(*) as total_referrals,
    COUNT(CASE WHEN is_valid = 1 THEN 1 END) as valid_referrals,
    COUNT(CASE WHEN is_valid = 0 THEN 1 END) as suspicious_referrals,
    COUNT(DISTINCT jid) as unique_referrers,
    COUNT(DISTINCT invited_jid) as unique_invited,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen,
    -- Ersatz für STRING_AGG für SQL Server 2016 Kompatibilität
    STUFF((
        SELECT DISTINCT ', ' + cheat_reason 
        FROM referrals r2 
        WHERE r2.ip_address = referrals.ip_address 
        AND cheat_reason IS NOT NULL
        FOR XML PATH('')
    ), 1, 2, '') as cheat_reasons
FROM referrals
WHERE ip_address IS NOT NULL
GROUP BY ip_address
HAVING COUNT(*) > 1;
GO

PRINT '✅ View v_ip_referral_stats erstellt'
GO

-- View für Fingerprint-basierte Statistiken
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_fingerprint_referral_stats')
BEGIN
    DROP VIEW v_fingerprint_referral_stats;
    PRINT '🔄 Alte v_fingerprint_referral_stats View entfernt'
END
GO

CREATE VIEW v_fingerprint_referral_stats AS
SELECT 
    fingerprint,
    COUNT(*) as total_referrals,
    COUNT(CASE WHEN is_valid = 1 THEN 1 END) as valid_referrals,
    COUNT(CASE WHEN is_valid = 0 THEN 1 END) as suspicious_referrals,
    COUNT(DISTINCT jid) as unique_referrers,
    COUNT(DISTINCT invited_jid) as unique_invited,
    COUNT(DISTINCT ip_address) as unique_ips,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen,
    -- Ersatz für STRING_AGG für SQL Server 2016 Kompatibilität
    STUFF((
        SELECT DISTINCT ', ' + cheat_reason 
        FROM referrals r2 
        WHERE r2.fingerprint = referrals.fingerprint 
        AND cheat_reason IS NOT NULL
        FOR XML PATH('')
    ), 1, 2, '') as cheat_reasons
FROM referrals
WHERE fingerprint IS NOT NULL
GROUP BY fingerprint
HAVING COUNT(*) > 1;
GO

PRINT '✅ View v_fingerprint_referral_stats erstellt'
GO

-- View für tägliche Anti-Cheat Statistiken
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_daily_anticheat_stats')
BEGIN
    DROP VIEW v_daily_anticheat_stats;
    PRINT '🔄 Alte v_daily_anticheat_stats View entfernt'
END
GO

CREATE VIEW v_daily_anticheat_stats AS
SELECT 
    CAST(created_at AS DATE) as date,
    COUNT(*) as total_referrals,
    COUNT(CASE WHEN is_valid = 1 THEN 1 END) as valid_referrals,
    COUNT(CASE WHEN is_valid = 0 THEN 1 END) as blocked_referrals,
    COUNT(DISTINCT ip_address) as unique_ips,
    COUNT(DISTINCT fingerprint) as unique_fingerprints,
    ROUND(
        CAST(COUNT(CASE WHEN is_valid = 0 THEN 1 END) AS FLOAT) / 
        CAST(COUNT(*) AS FLOAT) * 100, 2
    ) as block_rate_percent
FROM referrals
WHERE created_at >= DATEADD(day, -30, GETDATE())
GROUP BY CAST(created_at AS DATE);
GO

PRINT '✅ View v_daily_anticheat_stats erstellt'
GO

-- ===================================================================
-- INSTALLATION ABGESCHLOSSEN
-- ===================================================================
PRINT ''
PRINT '🎉 === ANTI-CHEAT SYSTEM ERFOLGREICH INSTALLIERT ==='
PRINT ''
PRINT '✅ Tabellen-Schema erweitert (ip_address, fingerprint, is_valid, cheat_reason)'
PRINT '✅ Monitoring Tabelle erstellt (referral_anticheat_logs)'
PRINT '✅ Performance Indizes erstellt'
PRINT '✅ Anti-Cheat Einstellungen hinzugefügt'
PRINT '✅ Bestehende Daten aktualisiert'
PRINT '✅ Monitoring Views erstellt'
PRINT ''
PRINT '📋 NÄCHSTE SCHRITTE:'
PRINT '   1. Backend Server neu starten (Anti-Cheat Code ist bereits implementiert)'
PRINT '   2. Frontend testen: Registrierung mit Fingerprinting'
PRINT '   3. Admin Interface öffnen: Anti-Cheat Tab prüfen'
PRINT '   4. Test-Registrierungen mit gleicher IP durchführen'
PRINT ''
PRINT '📊 VERFÜGBARE VIEWS:'
PRINT '   - v_suspicious_referrals: Verdächtige Referral-Aktivitäten'
PRINT '   - v_ip_referral_stats: IP-basierte Statistiken'
PRINT '   - v_fingerprint_referral_stats: Browser-Fingerprint Statistiken'
PRINT '   - v_daily_anticheat_stats: Tägliche Anti-Cheat Übersicht'
PRINT ''
GO