-- Silk Server Statistics Tabelle für Performance Optimierung
-- Diese Tabelle cached die Server-weiten Silk Statistiken

USE [SRO_CMS]
GO

-- Erstelle Tabelle für Silk Server Statistiken
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='silk_server_stats' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[silk_server_stats] (
        [id] [int] IDENTITY(1,1) NOT NULL,
        [total_premium_silk] [bigint] NOT NULL DEFAULT 0,
        [total_silk] [bigint] NOT NULL DEFAULT 0,
        [total_accounts] [int] NOT NULL DEFAULT 0,
        [accounts_with_silk] [int] NOT NULL DEFAULT 0,
        [vip_accounts] [int] NOT NULL DEFAULT 0,
        [total_donations] [int] NOT NULL DEFAULT 0,
        [total_donated_usd] [decimal](18,2) NOT NULL DEFAULT 0,
        [total_donated_silk] [bigint] NOT NULL DEFAULT 0,
        [unique_donors] [int] NOT NULL DEFAULT 0,
        [calculation_duration_seconds] [int] NULL,
        [last_calculated] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_silk_server_stats] PRIMARY KEY CLUSTERED ([id] ASC)
    )
    
    PRINT '✅ Tabelle silk_server_stats erstellt'
END
ELSE
BEGIN
    PRINT '⚠️ Tabelle silk_server_stats existiert bereits'
END
GO

-- Erstelle Index für Performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_silk_server_stats_last_calculated')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_silk_server_stats_last_calculated] 
    ON [dbo].[silk_server_stats] ([last_calculated] DESC)
    
    PRINT '✅ Index IX_silk_server_stats_last_calculated erstellt'
END
GO

-- Erstelle Tabelle für Silk Account Snapshots (für Performance)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='silk_account_snapshots' AND xtype='U')
BEGIN
    CREATE TABLE [dbo].[silk_account_snapshots] (
        [id] [int] IDENTITY(1,1) NOT NULL,
        [portal_jid] [int] NOT NULL,
        [game_jid] [int] NULL,
        [username] [varchar](50) NULL,
        [premium_silk] [int] NOT NULL DEFAULT 0,
        [silk] [int] NOT NULL DEFAULT 0,
        [vip_level] [tinyint] NOT NULL DEFAULT 0,
        [snapshot_date] [datetime2](7) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_silk_account_snapshots] PRIMARY KEY CLUSTERED ([id] ASC)
    )
    
    PRINT '✅ Tabelle silk_account_snapshots erstellt'
END
ELSE
BEGIN
    PRINT '⚠️ Tabelle silk_account_snapshots existiert bereits'
END
GO

-- Erstelle Indizes für Performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_silk_account_snapshots_portal_jid')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_silk_account_snapshots_portal_jid] 
    ON [dbo].[silk_account_snapshots] ([portal_jid])
    
    PRINT '✅ Index IX_silk_account_snapshots_portal_jid erstellt'
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_silk_account_snapshots_snapshot_date')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_silk_account_snapshots_snapshot_date] 
    ON [dbo].[silk_account_snapshots] ([snapshot_date] DESC)
    
    PRINT '✅ Index IX_silk_account_snapshots_snapshot_date erstellt'
END
GO

-- Stored Procedure für Server Stats Update
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'SP_UpdateSilkServerStats')
    DROP PROCEDURE [dbo].[SP_UpdateSilkServerStats]
GO

CREATE PROCEDURE [dbo].[SP_UpdateSilkServerStats]
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @StartTime DATETIME2 = GETDATE();
    DECLARE @EndTime DATETIME2;
    DECLARE @DurationSeconds INT;
    
    -- Deklariere Variablen für Statistiken
    DECLARE @TotalPremiumSilk BIGINT = 0;
    DECLARE @TotalSilk BIGINT = 0;
    DECLARE @TotalAccounts INT = 0;
    DECLARE @AccountsWithSilk INT = 0;
    DECLARE @VipAccounts INT = 0;
    DECLARE @TotalDonations INT = 0;
    DECLARE @TotalDonatedUSD DECIMAL(18,2) = 0;
    DECLARE @TotalDonatedSilk BIGINT = 0;
    DECLARE @UniqueDonors INT = 0;
    
    BEGIN TRY
        -- Lösche alte Snapshots (älter als 7 Tage)
        DELETE FROM [silk_account_snapshots] 
        WHERE snapshot_date < DATEADD(day, -7, GETDATE());
        
        -- Hole Donation Statistiken (schnell)
        SELECT 
            @TotalDonations = COUNT(*),
            @TotalDonatedUSD = COALESCE(SUM(amount), 0),
            @TotalDonatedSilk = COALESCE(SUM(silk_amount), 0),
            @UniqueDonors = COUNT(DISTINCT JID)
        FROM [donate_logs]
        WHERE status = 'completed';
        
        -- Verwende cached Snapshots wenn verfügbar (weniger als 1 Stunde alt)
        IF EXISTS (
            SELECT 1 FROM [silk_account_snapshots] 
            WHERE snapshot_date > DATEADD(hour, -1, GETDATE())
        )
        BEGIN
            -- Verwende cached Daten
            SELECT 
                @TotalPremiumSilk = SUM(premium_silk),
                @TotalSilk = SUM(silk),
                @TotalAccounts = COUNT(*),
                @AccountsWithSilk = COUNT(CASE WHEN premium_silk > 0 OR silk > 0 THEN 1 END),
                @VipAccounts = COUNT(CASE WHEN vip_level > 0 THEN 1 END)
            FROM [silk_account_snapshots]
            WHERE snapshot_date = (
                SELECT MAX(snapshot_date) 
                FROM [silk_account_snapshots]
            );
            
            PRINT '📊 Verwende cached Silk Statistiken';
        END
        ELSE
        BEGIN
            PRINT '🔄 Berechne neue Silk Statistiken (kann einige Minuten dauern)...';
            -- Vollständige Neuberechnung erforderlich
            -- Diese wird von der API durchgeführt und hier nur als Fallback verwendet
            SELECT 
                @TotalAccounts = COUNT(*)
            FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User] 
            WHERE PortalJID IS NOT NULL;
            
            PRINT '⚠️ Vollständige Silk Berechnung erfordert API Call';
        END
        
        SET @EndTime = GETDATE();
        SET @DurationSeconds = DATEDIFF(second, @StartTime, @EndTime);
        
        -- Speichere neue Statistiken
        INSERT INTO [silk_server_stats] (
            total_premium_silk,
            total_silk,
            total_accounts,
            accounts_with_silk,
            vip_accounts,
            total_donations,
            total_donated_usd,
            total_donated_silk,
            unique_donors,
            calculation_duration_seconds,
            last_calculated
        ) VALUES (
            @TotalPremiumSilk,
            @TotalSilk,
            @TotalAccounts,
            @AccountsWithSilk,
            @VipAccounts,
            @TotalDonations,
            @TotalDonatedUSD,
            @TotalDonatedSilk,
            @UniqueDonors,
            @DurationSeconds,
            GETDATE()
        );
        
        -- Lösche alte Statistiken (behalte nur die letzten 30 Einträge)
        DELETE FROM [silk_server_stats] 
        WHERE id NOT IN (
            SELECT TOP 30 id 
            FROM [silk_server_stats] 
            ORDER BY last_calculated DESC
        );
        
        PRINT CONCAT('✅ Silk Server Statistiken aktualisiert in ', @DurationSeconds, ' Sekunden');
        
    END TRY
    BEGIN CATCH
        PRINT CONCAT('❌ Fehler bei Silk Stats Update: ', ERROR_MESSAGE());
        THROW;
    END CATCH
END
GO

PRINT '✅ Stored Procedure SP_UpdateSilkServerStats erstellt';

-- Erstelle Funktion für schnelle Stats Abfrage
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'FN' AND name = 'FN_GetLatestSilkStats')
    DROP FUNCTION [dbo].[FN_GetLatestSilkStats]
GO

CREATE FUNCTION [dbo].[FN_GetLatestSilkStats]()
RETURNS TABLE
AS
RETURN
(
    SELECT TOP 1
        total_premium_silk,
        total_silk,
        (total_premium_silk + total_silk) as total_silk_value,
        total_accounts,
        accounts_with_silk,
        vip_accounts,
        total_donations,
        total_donated_usd,
        total_donated_silk,
        unique_donors,
        calculation_duration_seconds,
        last_calculated,
        CASE 
            WHEN last_calculated > DATEADD(hour, -1, GETDATE()) THEN 'fresh'
            WHEN last_calculated > DATEADD(hour, -6, GETDATE()) THEN 'recent'
            ELSE 'stale'
        END as data_freshness
    FROM [silk_server_stats]
    ORDER BY last_calculated DESC
)
GO

PRINT '✅ Function FN_GetLatestSilkStats erstellt';

-- Initial Statistiken erstellen
EXEC [dbo].[SP_UpdateSilkServerStats];

PRINT '🎯 Silk Statistics System erfolgreich eingerichtet!';