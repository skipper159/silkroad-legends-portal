-- SRO CMS v2 - Complete Database Setup Script
-- Dieses Script erstellt die komplette CMS-Datenbank mit allen Tabellen, Indizes und Daten

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
    PRINT 'Database SRO_CMS already exists.';
END
GO

USE SRO_CMS;
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
    
    -- Indizes für users
    CREATE UNIQUE INDEX [users_email_unique] ON [users] ([email]);
    CREATE UNIQUE INDEX [users_username_unique] ON [users] ([username]);
    CREATE INDEX [idx_users_jid] ON [users] ([jid]);
    CREATE INDEX [idx_users_referral_code] ON [users] ([referral_code]);
    
    PRINT 'Table users created with indexes.';
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
        CONSTRAINT [PK_news] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_news_author] FOREIGN KEY ([author_id]) REFERENCES [users] ([id]) ON DELETE CASCADE
    );
    
    -- Indizes für news
    CREATE UNIQUE INDEX [news_slug_unique] ON [news] ([slug]);
    CREATE INDEX [idx_news_published] ON [news] ([published_at], [active]);
    CREATE INDEX [idx_news_category] ON [news] ([category]);
    CREATE INDEX [idx_news_featured] ON [news] ([featured], [active]);
    CREATE INDEX [idx_news_author] ON [news] ([author_id]);
    
    PRINT 'Table news created with indexes.';
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
    
    -- Indizes für pages
    CREATE UNIQUE INDEX [pages_slug_unique] ON [pages] ([slug]);
    CREATE INDEX [idx_pages_active] ON [pages] ([active]);
    CREATE INDEX [idx_pages_menu] ON [pages] ([in_menu], [menu_order]);
    
    PRINT 'Table pages created with indexes.';
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
    
    -- Indizes für downloads
    CREATE INDEX [idx_downloads_category] ON [downloads] ([category]);
    CREATE INDEX [idx_downloads_active] ON [downloads] ([active]);
    CREATE INDEX [idx_downloads_featured] ON [downloads] ([featured]);
    
    PRINT 'Table downloads created with indexes.';
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
    
    -- Indizes für settings
    CREATE UNIQUE INDEX [settings_key_unique] ON [settings] ([key]);
    
    PRINT 'Table settings created with indexes.';
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
    
    -- Indizes für votes
    CREATE INDEX [idx_votes_active] ON [votes] ([active]);
    CREATE INDEX [idx_votes_site] ON [votes] ([site]);
    CREATE INDEX [idx_votes_sort] ON [votes] ([sort_order]);
    
    PRINT 'Table votes created with indexes.';
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
        CONSTRAINT [PK_vote_logs] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_vote_logs_vote] FOREIGN KEY ([vote_id]) REFERENCES [votes] ([id]) ON DELETE CASCADE
    );
    
    -- Indizes für vote_logs
    CREATE INDEX [idx_vote_logs_jid] ON [vote_logs] ([jid]);
    CREATE INDEX [idx_vote_logs_ip] ON [vote_logs] ([ip]);
    CREATE INDEX [idx_vote_logs_status] ON [vote_logs] ([status]);
    CREATE INDEX [idx_vote_logs_created] ON [vote_logs] ([created_at]);
    CREATE INDEX [idx_vote_logs_vote_user] ON [vote_logs] ([vote_id], [jid]);
    
    PRINT 'Table vote_logs created with indexes.';
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
    
    -- Indizes für donate_logs
    CREATE INDEX [idx_donate_logs_jid] ON [donate_logs] ([jid]);
    CREATE INDEX [idx_donate_logs_transaction] ON [donate_logs] ([transaction_id]);
    CREATE INDEX [idx_donate_logs_status] ON [donate_logs] ([status]);
    CREATE INDEX [idx_donate_logs_method] ON [donate_logs] ([method]);
    CREATE INDEX [idx_donate_logs_created] ON [donate_logs] ([created_at]);
    
    PRINT 'Table donate_logs created with indexes.';
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
        CONSTRAINT [PK_vouchers] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_vouchers_creator] FOREIGN KEY ([created_by]) REFERENCES [users] ([id]) ON DELETE SET NULL
    );
    
    -- Indizes für vouchers
    CREATE UNIQUE INDEX [vouchers_code_unique] ON [vouchers] ([code]);
    CREATE INDEX [idx_vouchers_active] ON [vouchers] ([active]);
    CREATE INDEX [idx_vouchers_expires] ON [vouchers] ([expires_at]);
    CREATE INDEX [idx_vouchers_type] ON [vouchers] ([type]);
    
    PRINT 'Table vouchers created with indexes.';
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
        CONSTRAINT [PK_voucher_logs] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_voucher_logs_voucher] FOREIGN KEY ([voucher_id]) REFERENCES [vouchers] ([id]) ON DELETE CASCADE
    );
    
    -- Indizes für voucher_logs
    CREATE INDEX [idx_voucher_logs_jid] ON [voucher_logs] ([jid]);
    CREATE INDEX [idx_voucher_logs_voucher] ON [voucher_logs] ([voucher_id]);
    CREATE INDEX [idx_voucher_logs_redeemed] ON [voucher_logs] ([redeemed_at]);
    
    PRINT 'Table voucher_logs created with indexes.';
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
    
    -- Indizes für referrals
    CREATE INDEX [idx_referrals_referrer] ON [referrals] ([referrer_jid]);
    CREATE INDEX [idx_referrals_referred] ON [referrals] ([referred_jid]);
    CREATE INDEX [idx_referrals_redeemed] ON [referrals] ([redeemed]);
    CREATE UNIQUE INDEX [referrals_referred_unique] ON [referrals] ([referred_jid]);
    
    PRINT 'Table referrals created with indexes.';
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
        CONSTRAINT [PK_user_roles] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_user_roles_user] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE,
        CONSTRAINT [FK_user_roles_granter] FOREIGN KEY ([granted_by]) REFERENCES [users] ([id]) ON DELETE SET NULL
    );
    
    -- Indizes für user_roles
    CREATE INDEX [idx_user_roles_user] ON [user_roles] ([user_id]);
    CREATE INDEX [idx_user_roles_role] ON [user_roles] ([role]);
    CREATE INDEX [idx_user_roles_expires] ON [user_roles] ([expires_at]);
    CREATE UNIQUE INDEX [user_roles_user_role_unique] ON [user_roles] ([user_id], [role]);
    
    PRINT 'Table user_roles created with indexes.';
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
    
    -- Indizes für failed_jobs
    CREATE UNIQUE INDEX [failed_jobs_uuid_unique] ON [failed_jobs] ([uuid]);
    
    PRINT 'Table failed_jobs created with indexes.';
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
    
    -- Indizes für personal_access_tokens
    CREATE UNIQUE INDEX [personal_access_tokens_token_unique] ON [personal_access_tokens] ([token]);
    CREATE INDEX [personal_access_tokens_tokenable] ON [personal_access_tokens] ([tokenable_type], [tokenable_id]);
    
    PRINT 'Table personal_access_tokens created with indexes.';
END
GO

-- ===============================================
-- DEFAULT DATA EINTRÄGE
-- ===============================================

-- Standard Settings einfügen
IF NOT EXISTS (SELECT * FROM [settings] WHERE [key] = 'site_name')
BEGIN
    INSERT INTO [settings] ([key], [value], [type], [description], [created_at], [updated_at]) VALUES
    ('site_name', 'SRO CMS v2', 'string', 'Website Name', GETDATE(), GETDATE()),
    ('site_description', 'Silkroad Online Content Management System', 'string', 'Website Description', GETDATE(), GETDATE()),
    ('site_logo', '/images/logo.png', 'string', 'Website Logo Path', GETDATE(), GETDATE()),
    ('maintenance_mode', '0', 'boolean', 'Maintenance Mode Status', GETDATE(), GETDATE()),
    ('registration_enabled', '1', 'boolean', 'User Registration Enabled', GETDATE(), GETDATE()),
    ('vote_system_enabled', '1', 'boolean', 'Vote System Enabled', GETDATE(), GETDATE()),
    ('donation_system_enabled', '1', 'boolean', 'Donation System Enabled', GETDATE(), GETDATE()),
    ('silk_rate', '100', 'integer', 'Silk per 1 USD', GETDATE(), GETDATE()),
    ('point_rate', '10', 'integer', 'Points per Vote', GETDATE(), GETDATE()),
    ('max_characters_per_account', '3', 'integer', 'Maximum Characters per Account', GETDATE(), GETDATE()),
    ('cache_rankings_minutes', '30', 'integer', 'Cache Rankings for X Minutes', GETDATE(), GETDATE()),
    ('ranking_player_limit', '100', 'integer', 'Max Players in Ranking', GETDATE(), GETDATE()),
    ('ranking_guild_limit', '50', 'integer', 'Max Guilds in Ranking', GETDATE(), GETDATE()),
    ('sro_version', 'iSRO', 'string', 'SRO Server Version (iSRO/vSRO)', GETDATE(), GETDATE()),
    ('server_rates', '{"exp": 15, "sp": 15, "drop": 10, "gold": 10}', 'json', 'Server Rates Configuration', GETDATE(), GETDATE());
    
    PRINT 'Default settings inserted.';
END
GO

-- Standard Pages einfügen
IF NOT EXISTS (SELECT * FROM [pages] WHERE [slug] = 'home')
BEGIN
    INSERT INTO [pages] ([title], [slug], [content], [meta_title], [meta_description], [active], [in_menu], [menu_order], [created_at], [updated_at]) VALUES
    ('Home', 'home', '<h1>Welcome to SRO CMS v2</h1><p>This is your homepage content.</p>', 'Welcome to SRO CMS v2', 'Silkroad Online Content Management System', 1, 1, 1, GETDATE(), GETDATE()),
    ('Download', 'download', '<h1>Download Client</h1><p>Download the latest game client here.</p>', 'Download Game Client', 'Download the latest Silkroad Online game client', 1, 1, 2, GETDATE(), GETDATE()),
    ('Rules', 'rules', '<h1>Server Rules</h1><p>Please read and follow our server rules.</p>', 'Server Rules', 'Read our server rules and guidelines', 1, 1, 3, GETDATE(), GETDATE()),
    ('Contact', 'contact', '<h1>Contact Us</h1><p>Get in touch with our team.</p>', 'Contact Us', 'Contact information and support', 1, 1, 4, GETDATE(), GETDATE());
    
    PRINT 'Default pages inserted.';
END
GO

-- Beispiel Vote Sites einfügen
IF NOT EXISTS (SELECT * FROM [votes] WHERE [site] = 'gtop100')
BEGIN
    INSERT INTO [votes] ([site], [title], [url], [reward_points], [reward_silk], [cooldown_hours], [active], [description], [sort_order], [created_at], [updated_at]) VALUES
    ('gtop100', 'GTop100', 'https://gtop100.com/topsites/Silkroad/sitedetails/your-server-123456', 10, 0, 12, 1, 'Vote for us on GTop100', 1, GETDATE(), GETDATE()),
    ('xtremetop100', 'XtremeTop100', 'https://xtremetop100.com/in.php?site=your-site-id', 10, 0, 12, 1, 'Vote for us on XtremeTop100', 2, GETDATE(), GETDATE()),
    ('mmotop', 'MMOTop', 'https://www.mmotop.eu/vote/your-server-id', 15, 0, 24, 1, 'Vote for us on MMOTop', 3, GETDATE(), GETDATE());
    
    PRINT 'Default vote sites inserted.';
END
GO

-- Migration Records einfügen
IF NOT EXISTS (SELECT * FROM [migrations] WHERE [migration] = '2024_01_01_000000_initial_setup')
BEGIN
    INSERT INTO [migrations] ([migration], [batch]) VALUES
    ('2024_01_01_000000_initial_setup', 1),
    ('2024_01_01_000001_create_users_table', 1),
    ('2024_01_01_000002_create_news_table', 1),
    ('2024_01_01_000003_create_pages_table', 1),
    ('2024_01_01_000004_create_downloads_table', 1),
    ('2024_01_01_000005_create_settings_table', 1),
    ('2024_01_01_000006_create_votes_table', 1),
    ('2024_01_01_000007_create_vote_logs_table', 1),
    ('2024_01_01_000008_create_donate_logs_table', 1),
    ('2024_01_01_000009_create_vouchers_table', 1),
    ('2024_01_01_000010_create_voucher_logs_table', 1),
    ('2024_01_01_000011_create_referrals_table', 1),
    ('2024_01_01_000012_create_user_roles_table', 1),
    ('2024_01_01_000013_create_failed_jobs_table', 1),
    ('2024_01_01_000014_create_personal_access_tokens_table', 1);
    
    PRINT 'Migration records inserted.';
END
GO

-- ===============================================
-- STORED PROCEDURES
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

PRINT '============================================';
PRINT 'SRO CMS v2 Database Setup completed successfully!';
PRINT '============================================';
PRINT '';
PRINT 'Created tables:';
PRINT '- migrations';
PRINT '- users (with indexes)';
PRINT '- news (with indexes and foreign keys)';
PRINT '- pages (with indexes)';
PRINT '- downloads (with indexes)';
PRINT '- settings (with indexes)';
PRINT '- votes (with indexes)';
PRINT '- vote_logs (with indexes and foreign keys)';
PRINT '- donate_logs (with indexes)';
PRINT '- vouchers (with indexes and foreign keys)';
PRINT '- voucher_logs (with indexes and foreign keys)';
PRINT '- referrals (with indexes)';
PRINT '- user_roles (with indexes and foreign keys)';
PRINT '- failed_jobs (with indexes)';
PRINT '- personal_access_tokens (with indexes)';
PRINT '';
PRINT 'Created stored procedures:';
PRINT '- sp_GetPlayerRanking';
PRINT '- sp_GetGuildRanking';
PRINT '';
PRINT 'Inserted default data:';
PRINT '- System settings';
PRINT '- Default pages (Home, Download, Rules, Contact)';
PRINT '- Example vote sites';
PRINT '- Migration records';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Update connection strings in your application';
PRINT '2. Configure SRO database connections (Account, Shard, Log)';
PRINT '3. Test the application with the new database';
PRINT '============================================';
GO