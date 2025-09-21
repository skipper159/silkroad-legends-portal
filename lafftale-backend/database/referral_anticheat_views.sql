USE SRO_CMS
GO

-- Anti-Cheat Monitoring Views für Admin Interface

-- View für verdächtige Referral-Aktivitäten
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_suspicious_referrals')
    DROP VIEW v_suspicious_referrals;
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

-- View für IP-basierte Statistiken
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_ip_referral_stats')
    DROP VIEW v_ip_referral_stats;
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

-- View für Fingerprint-basierte Statistiken
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_fingerprint_referral_stats')
    DROP VIEW v_fingerprint_referral_stats;
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

-- View für tägliche Anti-Cheat Statistiken
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_daily_anticheat_stats')
    DROP VIEW v_daily_anticheat_stats;
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

PRINT 'Anti-Cheat Monitoring Views erfolgreich erstellt';
GO