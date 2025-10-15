USE SRO_CMS
GO

-- ========================================================================
-- REFERRAL ANTI-CHEAT: Umstellung von "per Day" auf "Lifetime" (einmalig)
-- ========================================================================
-- Dieses Skript ändert die Referral-Anti-Cheat-Einstellungen so, dass
-- eine IP-Adresse nur EINMAL INSGESAMT für ein Referral verwendet werden kann,
-- nicht mehrmals pro Tag.
-- ========================================================================

PRINT '======================================================'
PRINT 'Referral Anti-Cheat: Umstellung auf Lifetime-Prüfung'
PRINT '======================================================'
PRINT ''

-- 1. Aktualisiere max_referrals_per_ip_per_day -> max_referrals_per_ip_lifetime
IF EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'max_referrals_per_ip_per_day')
BEGIN
    -- Ändere den Key-Namen und die Beschreibung
    UPDATE referral_settings 
    SET 
        setting_key = 'max_referrals_per_ip_lifetime',
        setting_value = '1', -- Nur 1 Referral pro IP insgesamt erlaubt
        description = 'Maximum referrals allowed per IP address (lifetime/total). Set to 1 to allow only one referral per IP ever.',
        updated_at = GETDATE()
    WHERE setting_key = 'max_referrals_per_ip_per_day'
    
    PRINT '✅ Einstellung "max_referrals_per_ip_per_day" wurde zu "max_referrals_per_ip_lifetime" umbenannt'
    PRINT '   Wert gesetzt auf: 1 (nur einmalige Verwendung pro IP)'
END
ELSE IF EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'max_referrals_per_ip_lifetime')
BEGIN
    -- Setting existiert bereits, nur Wert aktualisieren
    UPDATE referral_settings 
    SET 
        setting_value = '1',
        description = 'Maximum referrals allowed per IP address (lifetime/total). Set to 1 to allow only one referral per IP ever.',
        updated_at = GETDATE()
    WHERE setting_key = 'max_referrals_per_ip_lifetime'
    
    PRINT '✅ Einstellung "max_referrals_per_ip_lifetime" aktualisiert'
END
ELSE
BEGIN
    -- Erstelle neue Einstellung
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES (
        'max_referrals_per_ip_lifetime',
        '1',
        'Maximum referrals allowed per IP address (lifetime/total). Set to 1 to allow only one referral per IP ever.',
        GETDATE(),
        GETDATE()
    )
    
    PRINT '✅ Neue Einstellung "max_referrals_per_ip_lifetime" erstellt'
END
GO

-- 2. Aktualisiere max_referrals_per_fingerprint_per_day -> max_referrals_per_fingerprint_lifetime (optional)
IF EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'max_referrals_per_fingerprint_per_day')
BEGIN
    UPDATE referral_settings 
    SET 
        setting_key = 'max_referrals_per_fingerprint_lifetime',
        setting_value = '1', -- Nur 1 Referral pro Fingerprint insgesamt
        description = 'Maximum referrals allowed per browser fingerprint (lifetime/total). Set to 1 to allow only one referral per device ever.',
        updated_at = GETDATE()
    WHERE setting_key = 'max_referrals_per_fingerprint_per_day'
    
    PRINT '✅ Einstellung "max_referrals_per_fingerprint_per_day" wurde zu "max_referrals_per_fingerprint_lifetime" umbenannt'
END
ELSE IF EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'max_referrals_per_fingerprint_lifetime')
BEGIN
    UPDATE referral_settings 
    SET 
        setting_value = '1',
        description = 'Maximum referrals allowed per browser fingerprint (lifetime/total). Set to 1 to allow only one referral per device ever.',
        updated_at = GETDATE()
    WHERE setting_key = 'max_referrals_per_fingerprint_lifetime'
    
    PRINT '✅ Einstellung "max_referrals_per_fingerprint_lifetime" aktualisiert'
END
ELSE
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES (
        'max_referrals_per_fingerprint_lifetime',
        '1',
        'Maximum referrals allowed per browser fingerprint (lifetime/total). Set to 1 to allow only one referral per device ever.',
        GETDATE(),
        GETDATE()
    )
    
    PRINT '✅ Neue Einstellung "max_referrals_per_fingerprint_lifetime" erstellt'
END
GO

-- 3. Füge neue Einstellung hinzu: block_duplicate_ip_completely (strikte IP-Blockierung)
IF NOT EXISTS (SELECT * FROM referral_settings WHERE setting_key = 'block_duplicate_ip_completely')
BEGIN
    INSERT INTO referral_settings (setting_key, setting_value, description, created_at, updated_at)
    VALUES (
        'block_duplicate_ip_completely',
        'true',
        'Block any referral attempt from an IP that has already been used for any referral (lifetime blocking)',
        GETDATE(),
        GETDATE()
    )
    
    PRINT '✅ Neue Einstellung "block_duplicate_ip_completely" erstellt'
END
ELSE
BEGIN
    PRINT 'ℹ️  Einstellung "block_duplicate_ip_completely" existiert bereits'
END
GO

-- 4. Zeige die aktualisierten Einstellungen an
PRINT ''
PRINT '======================================================'
PRINT 'Aktuelle Anti-Cheat Einstellungen:'
PRINT '======================================================'
SELECT 
    setting_key,
    setting_value,
    description,
    updated_at
FROM referral_settings
WHERE setting_key LIKE '%referral%' 
   OR setting_key LIKE '%ip%' 
   OR setting_key LIKE '%fingerprint%'
   OR setting_key LIKE '%anticheat%'
ORDER BY setting_key
GO

PRINT ''
PRINT '======================================================'
PRINT '✅ Anti-Cheat Umstellung abgeschlossen!'
PRINT '======================================================'
PRINT ''
PRINT 'WICHTIG: Die Backend-Logik muss ebenfalls angepasst werden!'
PRINT 'Bitte prüfe die folgenden Dateien:'
PRINT '  - routes/referrals.js (POST /register Endpunkt)'
PRINT '  - routes/admin_referrals.js (Anti-Cheat Prüfungen)'
PRINT ''
PRINT 'Die Prüfungen sollten nun auf LIFETIME statt "per day" basieren.'
PRINT '======================================================'
GO
