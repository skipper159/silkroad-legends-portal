-- SRO CMS v2 - Safe Database Update Script
-- Dieses Script fügt nur fehlende Tabellen, Spalten und Indizes hinzu
-- KEINE DATEN WERDEN ÜBERSCHRIEBEN ODER GELÖSCHT

USE master;
GO

-- Datenbank erstellen falls sie nicht existiert
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SRO_CMS')
BEGIN
    CREATE DATABASE SRO_CMS;
    PRINT 'Database SRO_CMS created successfully.';
END
ELSE
BEGIN
    PRINT 'Database SRO_CMS already exists - checking for updates.';
END
GO

USE SRO_CMS;
GO

-- Helper Procedure um Spalten sicher hinzuzufügen
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AddColumnSafe]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[AddColumnSafe];
GO

CREATE PROCEDURE [dbo].[AddColumnSafe]
    @TableName NVARCHAR(128),
    @ColumnName NVARCHAR(128),
    @ColumnDefinition NVARCHAR(MAX)
AS
BEGIN
    DECLARE @sql NVARCHAR(MAX);
    
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(@TableName) 
        AND name = @ColumnName
    )
    BEGIN
        SET @sql = 'ALTER TABLE ' + @TableName + ' ADD ' + @ColumnName + ' ' + @ColumnDefinition;
        EXEC sp_executesql @sql;
        PRINT 'Added column ' + @ColumnName + ' to table ' + @TableName;
    END
    ELSE
    BEGIN
        PRINT 'Column ' + @ColumnName + ' already exists in table ' + @TableName;
    END
END
GO

-- Helper Procedure um Indizes sicher hinzuzufügen mit Spaltenprüfung
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AddIndexSafe]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[AddIndexSafe];
GO

CREATE PROCEDURE [dbo].[AddIndexSafe]
    @IndexName NVARCHAR(128),
    @TableName NVARCHAR(128),
    @IndexDefinition NVARCHAR(MAX),
    @RequiredColumns NVARCHAR(MAX) = NULL
AS
BEGIN
    DECLARE @sql NVARCHAR(MAX);
    DECLARE @ColumnExists BIT = 1;
    DECLARE @ColumnName NVARCHAR(128);
    DECLARE @Pos INT;
    
    -- Prüfe ob Index bereits existiert
    IF EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = @IndexName 
        AND object_id = OBJECT_ID(@TableName)
    )
    BEGIN
        PRINT 'Index ' + @IndexName + ' already exists on table ' + @TableName;
        RETURN;
    END
    
    -- Prüfe ob alle erforderlichen Spalten existieren (falls angegeben)
    IF @RequiredColumns IS NOT NULL
    BEGIN
        WHILE LEN(@RequiredColumns) > 0 AND @ColumnExists = 1
        BEGIN
            SET @Pos = CHARINDEX(',', @RequiredColumns);
            IF @Pos = 0
            BEGIN
                SET @ColumnName = LTRIM(RTRIM(@RequiredColumns));
                SET @RequiredColumns = '';
            END
            ELSE
            BEGIN
                SET @ColumnName = LTRIM(RTRIM(LEFT(@RequiredColumns, @Pos - 1)));
                SET @RequiredColumns = SUBSTRING(@RequiredColumns, @Pos + 1, LEN(@RequiredColumns));
            END
            
            IF NOT EXISTS (
                SELECT * FROM sys.columns 
                WHERE object_id = OBJECT_ID(@TableName) 
                AND name = @ColumnName
            )
            BEGIN
                SET @ColumnExists = 0;
                PRINT 'Skipping index ' + @IndexName + ' - column ' + @ColumnName + ' does not exist in table ' + @TableName;
            END
        END
    END
    
    -- Index erstellen wenn alle Spalten existieren
    IF @ColumnExists = 1
    BEGIN
        BEGIN TRY
            SET @sql = @IndexDefinition;
            EXEC sp_executesql @sql;
            PRINT 'Added index ' + @IndexName + ' to table ' + @TableName;
        END TRY
        BEGIN CATCH
            PRINT 'Failed to create index ' + @IndexName + ' on table ' + @TableName + ': ' + ERROR_MESSAGE();
        END CATCH
    END
END
GO

-- ===============================================
-- MIGRATIONS TABLE (Laravel Standard)
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[migrations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[migrations] (
        [id] int IDENTITY(1,1) NOT NULL,
        [migration] nvarchar(255) NOT NULL,
        [batch] int NOT NULL,
        CONSTRAINT [PK_migrations] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table migrations created.';
END
ELSE
BEGIN
    PRINT 'Table migrations already exists - checking for updates.';
END
GO

-- ===============================================
-- USERS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [jid] int NULL,
        [username] nvarchar(255) NOT NULL,
        [email] nvarchar(255) NOT NULL,
        [email_verified_at] datetime2(0) NULL,
        [password] nvarchar(255) NOT NULL,
        [referral_code] nvarchar(255) NULL,
        [referred_by] nvarchar(255) NULL,
        [points] int NOT NULL DEFAULT 0,
        [remember_token] nvarchar(100) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table users created.';
END
ELSE
BEGIN
    PRINT 'Table users already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[users]', 'jid', 'int NULL';
    EXEC AddColumnSafe '[dbo].[users]', 'referral_code', 'nvarchar(255) NULL';
    EXEC AddColumnSafe '[dbo].[users]', 'referred_by', 'nvarchar(255) NULL';
    EXEC AddColumnSafe '[dbo].[users]', 'points', 'int NOT NULL DEFAULT 0';
END
GO

-- ===============================================
-- NEWS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[news]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[news] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [slug] nvarchar(255) NOT NULL,
        [content] ntext NOT NULL,
        [image] nvarchar(255) NULL,
        [category] nvarchar(100) NULL,
        [active] bit NOT NULL DEFAULT 1,
        [featured] bit NOT NULL DEFAULT 0,
        [views] int NOT NULL DEFAULT 0,
        [author_id] bigint NOT NULL,
        [published_at] datetime2(0) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_news] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table news created.';
    
    -- Foreign Key nur hinzufügen wenn users Tabelle existiert
    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
    BEGIN
        ALTER TABLE [dbo].[news] ADD CONSTRAINT [FK_news_author] FOREIGN KEY ([author_id]) REFERENCES [users] ([id]) ON DELETE CASCADE;
        PRINT 'Foreign key FK_news_author added.';
    END
END
ELSE
BEGIN
    PRINT 'Table news already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[news]', 'image', 'nvarchar(255) NULL';
    EXEC AddColumnSafe '[dbo].[news]', 'category', 'nvarchar(100) NULL';
    EXEC AddColumnSafe '[dbo].[news]', 'featured', 'bit NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[news]', 'views', 'int NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[news]', 'published_at', 'datetime2(0) NULL';
END
GO

-- ===============================================
-- PAGES TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[pages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[pages] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [slug] nvarchar(255) NOT NULL,
        [content] ntext NOT NULL,
        [meta_title] nvarchar(255) NULL,
        [meta_description] nvarchar(500) NULL,
        [active] bit NOT NULL DEFAULT 1,
        [in_menu] bit NOT NULL DEFAULT 0,
        [menu_order] int NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_pages] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table pages created.';
END
ELSE
BEGIN
    PRINT 'Table pages already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[pages]', 'meta_title', 'nvarchar(255) NULL';
    EXEC AddColumnSafe '[dbo].[pages]', 'meta_description', 'nvarchar(500) NULL';
    EXEC AddColumnSafe '[dbo].[pages]', 'in_menu', 'bit NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[pages]', 'menu_order', 'int NULL';
END
GO

-- ===============================================
-- DOWNLOADS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[downloads]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[downloads] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [description] ntext NULL,
        [file_name] nvarchar(255) NOT NULL,
        [file_path] nvarchar(500) NOT NULL,
        [file_size] bigint NULL,
        [category] nvarchar(100) NULL,
        [version] nvarchar(50) NULL,
        [download_count] int NOT NULL DEFAULT 0,
        [active] bit NOT NULL DEFAULT 1,
        [featured] bit NOT NULL DEFAULT 0,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_downloads] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table downloads created.';
END
ELSE
BEGIN
    PRINT 'Table downloads already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[downloads]', 'file_size', 'bigint NULL';
    EXEC AddColumnSafe '[dbo].[downloads]', 'category', 'nvarchar(100) NULL';
    EXEC AddColumnSafe '[dbo].[downloads]', 'version', 'nvarchar(50) NULL';
    EXEC AddColumnSafe '[dbo].[downloads]', 'download_count', 'int NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[downloads]', 'featured', 'bit NOT NULL DEFAULT 0';
END
GO

-- ===============================================
-- SETTINGS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[settings] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [key] nvarchar(255) NOT NULL,
        [value] ntext NULL,
        [type] nvarchar(50) NOT NULL DEFAULT 'string',
        [description] nvarchar(500) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_settings] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table settings created.';
END
ELSE
BEGIN
    PRINT 'Table settings already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[settings]', 'type', 'nvarchar(50) NOT NULL DEFAULT ''string''';
    EXEC AddColumnSafe '[dbo].[settings]', 'description', 'nvarchar(500) NULL';
END
GO

-- ===============================================
-- VOTES TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[votes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[votes] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [site] nvarchar(255) NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [url] nvarchar(500) NOT NULL,
        [reward_points] int NOT NULL DEFAULT 0,
        [reward_silk] int NOT NULL DEFAULT 0,
        [cooldown_hours] int NOT NULL DEFAULT 12,
        [active] bit NOT NULL DEFAULT 1,
        [description] ntext NULL,
        [image] nvarchar(255) NULL,
        [sort_order] int NOT NULL DEFAULT 0,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_votes] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table votes created.';
END
ELSE
BEGIN
    PRINT 'Table votes already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[votes]', 'reward_silk', 'int NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[votes]', 'cooldown_hours', 'int NOT NULL DEFAULT 12';
    EXEC AddColumnSafe '[dbo].[votes]', 'description', 'ntext NULL';
    EXEC AddColumnSafe '[dbo].[votes]', 'image', 'nvarchar(255) NULL';
    EXEC AddColumnSafe '[dbo].[votes]', 'sort_order', 'int NOT NULL DEFAULT 0';
END
GO

-- ===============================================
-- VOTE_LOGS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vote_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vote_logs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [vote_id] bigint NOT NULL,
        [jid] int NOT NULL,
        [username] nvarchar(255) NOT NULL,
        [ip] nvarchar(45) NOT NULL,
        [status] nvarchar(50) NOT NULL DEFAULT 'pending',
        [reward_points] int NOT NULL DEFAULT 0,
        [reward_silk] int NOT NULL DEFAULT 0,
        [verified_at] datetime2(0) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_vote_logs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table vote_logs created.';
    
    -- Foreign Key nur hinzufügen wenn votes Tabelle existiert
    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[votes]') AND type in (N'U'))
    BEGIN
        ALTER TABLE [dbo].[vote_logs] ADD CONSTRAINT [FK_vote_logs_vote] FOREIGN KEY ([vote_id]) REFERENCES [votes] ([id]) ON DELETE CASCADE;
        PRINT 'Foreign key FK_vote_logs_vote added.';
    END
END
ELSE
BEGIN
    PRINT 'Table vote_logs already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[vote_logs]', 'reward_silk', 'int NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[vote_logs]', 'verified_at', 'datetime2(0) NULL';
END
GO

-- ===============================================
-- DONATE_LOGS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[donate_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[donate_logs] (
        [id] int IDENTITY(1,1) NOT NULL,
        [jid] int NOT NULL,
        [username] nvarchar(255) NOT NULL,
        [transaction_id] nvarchar(255) NOT NULL,
        [method] nvarchar(50) NOT NULL,
        [amount] decimal(10,2) NOT NULL,
        [currency] nvarchar(10) NOT NULL DEFAULT 'USD',
        [silk_amount] int NOT NULL,
        [status] nvarchar(50) NOT NULL DEFAULT 'pending',
        [gateway_response] ntext NULL,
        [ip] nvarchar(45) NULL,
        [processed_at] datetime2(0) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_donate_logs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table donate_logs created.';
END
ELSE
BEGIN
    PRINT 'Table donate_logs already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[donate_logs]', 'currency', 'nvarchar(10) NOT NULL DEFAULT ''USD''';
    EXEC AddColumnSafe '[dbo].[donate_logs]', 'gateway_response', 'ntext NULL';
    EXEC AddColumnSafe '[dbo].[donate_logs]', 'ip', 'nvarchar(45) NULL';
    EXEC AddColumnSafe '[dbo].[donate_logs]', 'processed_at', 'datetime2(0) NULL';
END
GO

-- ===============================================
-- VOUCHERS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vouchers] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [code] nvarchar(255) NOT NULL,
        [type] nvarchar(50) NOT NULL DEFAULT 'silk',
        [value] int NOT NULL,
        [max_uses] int NOT NULL DEFAULT 1,
        [used_count] int NOT NULL DEFAULT 0,
        [active] bit NOT NULL DEFAULT 1,
        [expires_at] datetime2(0) NULL,
        [description] nvarchar(500) NULL,
        [created_by] bigint NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_vouchers] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table vouchers created.';
    
    -- Foreign Key nur hinzufügen wenn users Tabelle existiert
    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
    BEGIN
        ALTER TABLE [dbo].[vouchers] ADD CONSTRAINT [FK_vouchers_creator] FOREIGN KEY ([created_by]) REFERENCES [users] ([id]) ON DELETE SET NULL;
        PRINT 'Foreign key FK_vouchers_creator added.';
    END
END
ELSE
BEGIN
    PRINT 'Table vouchers already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[vouchers]', 'type', 'nvarchar(50) NOT NULL DEFAULT ''silk''';
    EXEC AddColumnSafe '[dbo].[vouchers]', 'max_uses', 'int NOT NULL DEFAULT 1';
    EXEC AddColumnSafe '[dbo].[vouchers]', 'used_count', 'int NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[vouchers]', 'expires_at', 'datetime2(0) NULL';
    EXEC AddColumnSafe '[dbo].[vouchers]', 'description', 'nvarchar(500) NULL';
    EXEC AddColumnSafe '[dbo].[vouchers]', 'created_by', 'bigint NULL';
END
GO

-- ===============================================
-- VOUCHER_LOGS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[voucher_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[voucher_logs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [voucher_id] bigint NOT NULL,
        [jid] int NOT NULL,
        [username] nvarchar(255) NOT NULL,
        [ip] nvarchar(45) NOT NULL,
        [redeemed_at] datetime2(0) NOT NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_voucher_logs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table voucher_logs created.';
    
    -- Foreign Key nur hinzufügen wenn vouchers Tabelle existiert
    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
    BEGIN
        ALTER TABLE [dbo].[voucher_logs] ADD CONSTRAINT [FK_voucher_logs_voucher] FOREIGN KEY ([voucher_id]) REFERENCES [vouchers] ([id]) ON DELETE CASCADE;
        PRINT 'Foreign key FK_voucher_logs_voucher added.';
    END
END
ELSE
BEGIN
    PRINT 'Table voucher_logs already exists - no updates needed.';
END
GO

-- ===============================================
-- REFERRALS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[referrals]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[referrals] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [referrer_jid] int NOT NULL,
        [referrer_username] nvarchar(255) NOT NULL,
        [referred_jid] int NOT NULL,
        [referred_username] nvarchar(255) NOT NULL,
        [reward_points] int NOT NULL DEFAULT 0,
        [reward_silk] int NOT NULL DEFAULT 0,
        [redeemed] bit NOT NULL DEFAULT 0,
        [redeemed_at] datetime2(0) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_referrals] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table referrals created.';
END
ELSE
BEGIN
    PRINT 'Table referrals already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[referrals]', 'reward_silk', 'int NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[referrals]', 'redeemed', 'bit NOT NULL DEFAULT 0';
    EXEC AddColumnSafe '[dbo].[referrals]', 'redeemed_at', 'datetime2(0) NULL';
END
GO

-- ===============================================
-- USER_ROLES TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[user_roles] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [user_id] bigint NOT NULL,
        [role] nvarchar(50) NOT NULL,
        [granted_by] bigint NULL,
        [granted_at] datetime2(0) NOT NULL,
        [expires_at] datetime2(0) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_user_roles] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table user_roles created.';
    
    -- Foreign Keys nur hinzufügen wenn users Tabelle existiert
    IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
    BEGIN
        ALTER TABLE [dbo].[user_roles] ADD CONSTRAINT [FK_user_roles_user] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE;
        ALTER TABLE [dbo].[user_roles] ADD CONSTRAINT [FK_user_roles_granter] FOREIGN KEY ([granted_by]) REFERENCES [users] ([id]) ON DELETE SET NULL;
        PRINT 'Foreign keys for user_roles added.';
    END
END
ELSE
BEGIN
    PRINT 'Table user_roles already exists - checking for missing columns.';
    
    -- Fehlende Spalten hinzufügen
    EXEC AddColumnSafe '[dbo].[user_roles]', 'granted_by', 'bigint NULL';
    EXEC AddColumnSafe '[dbo].[user_roles]', 'granted_at', 'datetime2(0) NOT NULL DEFAULT GETDATE()';
    EXEC AddColumnSafe '[dbo].[user_roles]', 'expires_at', 'datetime2(0) NULL';
END
GO

-- ===============================================
-- FAILED_JOBS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[failed_jobs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[failed_jobs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [uuid] nvarchar(255) NOT NULL,
        [connection] ntext NOT NULL,
        [queue] ntext NOT NULL,
        [payload] ntext NOT NULL,
        [exception] ntext NOT NULL,
        [failed_at] datetime2(0) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_failed_jobs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table failed_jobs created.';
END
ELSE
BEGIN
    PRINT 'Table failed_jobs already exists - no updates needed.';
END
GO

-- ===============================================
-- PERSONAL_ACCESS_TOKENS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[personal_access_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[personal_access_tokens] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [tokenable_type] nvarchar(255) NOT NULL,
        [tokenable_id] bigint NOT NULL,
        [name] nvarchar(255) NOT NULL,
        [token] nvarchar(64) NOT NULL,
        [abilities] ntext NULL,
        [last_used_at] datetime2(0) NULL,
        [expires_at] datetime2(0) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_personal_access_tokens] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    PRINT 'Table personal_access_tokens created.';
END
ELSE
BEGIN
    PRINT 'Table personal_access_tokens already exists - no updates needed.';
END
GO

-- ===============================================
-- STORED PROCEDURES AKTUALISIEREN
-- ===============================================

-- Stored Procedure für Player Ranking
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetPlayerRanking]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_GetPlayerRanking];
GO

CREATE PROCEDURE [dbo].[sp_GetPlayerRanking]
    @Limit INT = 100,
    @Search NVARCHAR(50) = ''
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Limit)
        ROW_NUMBER() OVER (ORDER BY c.CurLevel DESC, c.Exp DESC) AS Rank,
        c.CharID,
        c.CharName16,
        c.CurLevel,
        c.RefObjID,
        c.HwanLevel,
        c.HP,
        c.MP,
        c.Strength,
        c.Intellect,
        g.ID as GuildID,
        g.Name as GuildName,
        ISNULL(ip.ItemPoints, 0) AS ItemPoints
    FROM [SHARD_DB].[dbo].[_Char] c
    LEFT JOIN [SHARD_DB].[dbo].[_Guild] g ON c.GuildID = g.ID
    OUTER APPLY (
        SELECT SUM(
            ISNULL(bow.nOptValue, 0) +
            ISNULL(i.OptLevel, 0) +
            ISNULL(roc.ReqLevel1, 0) +
            CASE WHEN roc.CodeName128 LIKE '%_A_RARE%' THEN 5 ELSE 0 END +
            CASE WHEN roc.CodeName128 LIKE '%_B_RARE%' THEN 10 ELSE 0 END +
            CASE WHEN roc.CodeName128 LIKE '%_C_RARE%' THEN 15 ELSE 0 END
        ) AS ItemPoints
        FROM [SHARD_DB].[dbo].[_Inventory] inv
        LEFT JOIN [SHARD_DB].[dbo].[_Items] i ON inv.ItemID = i.ID64
        LEFT JOIN [SHARD_DB].[dbo].[_RefObjCommon] roc ON i.RefItemID = roc.ID
        LEFT JOIN [SHARD_DB].[dbo].[_BindingOptionWithItem] bow ON i.ID64 = bow.nItemDBID
        WHERE inv.CharID = c.CharID
    ) ip
    WHERE c.Deleted = 0
        AND (@Search = '' OR c.CharName16 LIKE '%' + @Search + '%')
    ORDER BY c.CurLevel DESC, c.Exp DESC;
END
GO
PRINT 'Stored procedure sp_GetPlayerRanking updated.';

-- Stored Procedure für Guild Ranking
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetGuildRanking]') AND type in (N'P', N'PC'))
DROP PROCEDURE [dbo].[sp_GetGuildRanking];
GO

CREATE PROCEDURE [dbo].[sp_GetGuildRanking]
    @Limit INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Limit)
        ROW_NUMBER() OVER (ORDER BY g.GP DESC, COUNT(gm.CharID) DESC) AS Rank,
        g.ID,
        g.Name,
        g.Lvl,
        g.GP,
        g.Foundation,
        master.CharName16 as MasterName,
        COUNT(gm.CharID) as MemberCount,
        AVG(CAST(c.CurLevel AS FLOAT)) as AvgLevel
    FROM [SHARD_DB].[dbo].[_Guild] g
    LEFT JOIN [SHARD_DB].[dbo].[_Char] master ON g.MasterCharID = master.CharID
    LEFT JOIN [SHARD_DB].[dbo].[_GuildMember] gm ON g.ID = gm.GuildID
    LEFT JOIN [SHARD_DB].[dbo].[_Char] c ON gm.CharID = c.CharID AND c.Deleted = 0
    GROUP BY g.ID, g.Name, g.Lvl, g.GP, g.Foundation, master.CharName16
    HAVING COUNT(gm.CharID) >= 3
    ORDER BY g.GP DESC, COUNT(gm.CharID) DESC;
END
GO
PRINT 'Stored procedure sp_GetGuildRanking updated.';

-- ===============================================
-- ALLE INDIZES ERSTELLEN (Nach Spalten-Updates)
-- ===============================================
PRINT 'Creating missing indexes...';

-- Indizes für users hinzufügen (falls nicht vorhanden)
EXEC AddIndexSafe 'users_email_unique', '[users]', 'CREATE UNIQUE INDEX [users_email_unique] ON [users] ([email])', 'email';
EXEC AddIndexSafe 'users_username_unique', '[users]', 'CREATE UNIQUE INDEX [users_username_unique] ON [users] ([username])', 'username';
EXEC AddIndexSafe 'idx_users_jid', '[users]', 'CREATE INDEX [idx_users_jid] ON [users] ([jid])', 'jid';
EXEC AddIndexSafe 'idx_users_referral_code', '[users]', 'CREATE INDEX [idx_users_referral_code] ON [users] ([referral_code])', 'referral_code';

-- Indizes für news hinzufügen
EXEC AddIndexSafe 'news_slug_unique', '[news]', 'CREATE UNIQUE INDEX [news_slug_unique] ON [news] ([slug])', 'slug';
EXEC AddIndexSafe 'idx_news_published', '[news]', 'CREATE INDEX [idx_news_published] ON [news] ([published_at], [active])', 'published_at,active';
EXEC AddIndexSafe 'idx_news_category', '[news]', 'CREATE INDEX [idx_news_category] ON [news] ([category])', 'category';
EXEC AddIndexSafe 'idx_news_featured', '[news]', 'CREATE INDEX [idx_news_featured] ON [news] ([featured], [active])', 'featured,active';
EXEC AddIndexSafe 'idx_news_author', '[news]', 'CREATE INDEX [idx_news_author] ON [news] ([author_id])', 'author_id';

-- Indizes für pages hinzufügen
EXEC AddIndexSafe 'pages_slug_unique', '[pages]', 'CREATE UNIQUE INDEX [pages_slug_unique] ON [pages] ([slug])', 'slug';
EXEC AddIndexSafe 'idx_pages_active', '[pages]', 'CREATE INDEX [idx_pages_active] ON [pages] ([active])', 'active';
EXEC AddIndexSafe 'idx_pages_menu', '[pages]', 'CREATE INDEX [idx_pages_menu] ON [pages] ([in_menu], [menu_order])', 'in_menu,menu_order';

-- Indizes für downloads hinzufügen
EXEC AddIndexSafe 'idx_downloads_category', '[downloads]', 'CREATE INDEX [idx_downloads_category] ON [downloads] ([category])', 'category';
EXEC AddIndexSafe 'idx_downloads_active', '[downloads]', 'CREATE INDEX [idx_downloads_active] ON [downloads] ([active])', 'active';
EXEC AddIndexSafe 'idx_downloads_featured', '[downloads]', 'CREATE INDEX [idx_downloads_featured] ON [downloads] ([featured])', 'featured';

-- Indizes für settings hinzufügen
EXEC AddIndexSafe 'settings_key_unique', '[settings]', 'CREATE UNIQUE INDEX [settings_key_unique] ON [settings] ([key])';

-- Indizes für votes hinzufügen
EXEC AddIndexSafe 'idx_votes_active', '[votes]', 'CREATE INDEX [idx_votes_active] ON [votes] ([active])', 'active';
EXEC AddIndexSafe 'idx_votes_site', '[votes]', 'CREATE INDEX [idx_votes_site] ON [votes] ([site])', 'site';
EXEC AddIndexSafe 'idx_votes_sort', '[votes]', 'CREATE INDEX [idx_votes_sort] ON [votes] ([sort_order])', 'sort_order';

-- Indizes für vote_logs hinzufügen
EXEC AddIndexSafe 'idx_vote_logs_jid', '[vote_logs]', 'CREATE INDEX [idx_vote_logs_jid] ON [vote_logs] ([jid])', 'jid';
EXEC AddIndexSafe 'idx_vote_logs_ip', '[vote_logs]', 'CREATE INDEX [idx_vote_logs_ip] ON [vote_logs] ([ip])', 'ip';
EXEC AddIndexSafe 'idx_vote_logs_status', '[vote_logs]', 'CREATE INDEX [idx_vote_logs_status] ON [vote_logs] ([status])', 'status';
EXEC AddIndexSafe 'idx_vote_logs_created', '[vote_logs]', 'CREATE INDEX [idx_vote_logs_created] ON [vote_logs] ([created_at])', 'created_at';
EXEC AddIndexSafe 'idx_vote_logs_vote_user', '[vote_logs]', 'CREATE INDEX [idx_vote_logs_vote_user] ON [vote_logs] ([vote_id], [jid])', 'vote_id,jid';

-- Indizes für donate_logs hinzufügen
EXEC AddIndexSafe 'idx_donate_logs_jid', '[donate_logs]', 'CREATE INDEX [idx_donate_logs_jid] ON [donate_logs] ([jid])';
EXEC AddIndexSafe 'idx_donate_logs_transaction', '[donate_logs]', 'CREATE INDEX [idx_donate_logs_transaction] ON [donate_logs] ([transaction_id])';
EXEC AddIndexSafe 'idx_donate_logs_status', '[donate_logs]', 'CREATE INDEX [idx_donate_logs_status] ON [donate_logs] ([status])';
EXEC AddIndexSafe 'idx_donate_logs_method', '[donate_logs]', 'CREATE INDEX [idx_donate_logs_method] ON [donate_logs] ([method])';
EXEC AddIndexSafe 'idx_donate_logs_created', '[donate_logs]', 'CREATE INDEX [idx_donate_logs_created] ON [donate_logs] ([created_at])';

-- Indizes für vouchers hinzufügen
EXEC AddIndexSafe 'vouchers_code_unique', '[vouchers]', 'CREATE UNIQUE INDEX [vouchers_code_unique] ON [vouchers] ([code])', 'code';
EXEC AddIndexSafe 'idx_vouchers_active', '[vouchers]', 'CREATE INDEX [idx_vouchers_active] ON [vouchers] ([active])', 'active';
EXEC AddIndexSafe 'idx_vouchers_expires', '[vouchers]', 'CREATE INDEX [idx_vouchers_expires] ON [vouchers] ([expires_at])', 'expires_at';
EXEC AddIndexSafe 'idx_vouchers_type', '[vouchers]', 'CREATE INDEX [idx_vouchers_type] ON [vouchers] ([type])', 'type';

-- Indizes für voucher_logs hinzufügen
EXEC AddIndexSafe 'idx_voucher_logs_jid', '[voucher_logs]', 'CREATE INDEX [idx_voucher_logs_jid] ON [voucher_logs] ([jid])';
EXEC AddIndexSafe 'idx_voucher_logs_voucher', '[voucher_logs]', 'CREATE INDEX [idx_voucher_logs_voucher] ON [voucher_logs] ([voucher_id])';
EXEC AddIndexSafe 'idx_voucher_logs_redeemed', '[voucher_logs]', 'CREATE INDEX [idx_voucher_logs_redeemed] ON [voucher_logs] ([redeemed_at])';

-- Indizes für referrals hinzufügen
EXEC AddIndexSafe 'idx_referrals_referrer', '[referrals]', 'CREATE INDEX [idx_referrals_referrer] ON [referrals] ([referrer_jid])', 'referrer_jid';
EXEC AddIndexSafe 'idx_referrals_referred', '[referrals]', 'CREATE INDEX [idx_referrals_referred] ON [referrals] ([referred_jid])', 'referred_jid';
EXEC AddIndexSafe 'idx_referrals_redeemed', '[referrals]', 'CREATE INDEX [idx_referrals_redeemed] ON [referrals] ([redeemed])', 'redeemed';
EXEC AddIndexSafe 'referrals_referred_unique', '[referrals]', 'CREATE UNIQUE INDEX [referrals_referred_unique] ON [referrals] ([referred_jid])', 'referred_jid';

-- Indizes für user_roles hinzufügen
EXEC AddIndexSafe 'idx_user_roles_user', '[user_roles]', 'CREATE INDEX [idx_user_roles_user] ON [user_roles] ([user_id])', 'user_id';
EXEC AddIndexSafe 'idx_user_roles_role', '[user_roles]', 'CREATE INDEX [idx_user_roles_role] ON [user_roles] ([role])', 'role';
EXEC AddIndexSafe 'idx_user_roles_expires', '[user_roles]', 'CREATE INDEX [idx_user_roles_expires] ON [user_roles] ([expires_at])', 'expires_at';
EXEC AddIndexSafe 'user_roles_user_role_unique', '[user_roles]', 'CREATE UNIQUE INDEX [user_roles_user_role_unique] ON [user_roles] ([user_id], [role])', 'user_id,role';

-- Indizes für failed_jobs hinzufügen
EXEC AddIndexSafe 'failed_jobs_uuid_unique', '[failed_jobs]', 'CREATE UNIQUE INDEX [failed_jobs_uuid_unique] ON [failed_jobs] ([uuid])';

-- Indizes für personal_access_tokens hinzufügen
EXEC AddIndexSafe 'personal_access_tokens_token_unique', '[personal_access_tokens]', 'CREATE UNIQUE INDEX [personal_access_tokens_token_unique] ON [personal_access_tokens] ([token])';
EXEC AddIndexSafe 'personal_access_tokens_tokenable', '[personal_access_tokens]', 'CREATE INDEX [personal_access_tokens_tokenable] ON [personal_access_tokens] ([tokenable_type], [tokenable_id])';

PRINT 'Index creation completed.';
GO

-- Helper Procedures entfernen
DROP PROCEDURE [dbo].[AddColumnSafe];
DROP PROCEDURE [dbo].[AddIndexSafe];
GO

PRINT '============================================';
PRINT 'SRO CMS v2 Safe Database Update completed!';
PRINT '============================================';
PRINT '';
PRINT 'SAFE UPDATE SUMMARY:';
PRINT '- Only missing tables were created';
PRINT '- Only missing columns were added to existing tables';
PRINT '- Only missing indexes were created';
PRINT '- NO DATA WAS DELETED OR OVERWRITTEN';
PRINT '- Stored procedures were updated safely';
PRINT '';
PRINT 'Your existing data is completely safe!';
PRINT '============================================';
GO