-- SRO CMS v2 - Complete Database Setup Script (Updated from Current State)
-- Dieses Script erstellt die komplette CMS-Datenbank basierend auf dem IST-Zustand

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
        [jid] int NOT NULL,
        [username] nvarchar(255) NOT NULL,
        [email] nvarchar(255) NOT NULL,
        [email_verified_at] datetime NULL,
        [password] nvarchar(255) NOT NULL,
        [remember_token] nvarchar(100) NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für users
    CREATE UNIQUE INDEX [users_email_unique] ON [users] ([email]);
    CREATE UNIQUE INDEX [users_username_unique] ON [users] ([username]);
    CREATE INDEX [idx_users_jid] ON [users] ([jid]);
    
    PRINT 'Table users created with indexes.';
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
        [is_admin] bit NOT NULL DEFAULT 0,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_user_roles] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_user_roles_user] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE
    );
    
    -- Indizes für user_roles
    CREATE INDEX [idx_user_roles_user] ON [user_roles] ([user_id]);
    CREATE UNIQUE INDEX [user_roles_user_unique] ON [user_roles] ([user_id]);
    
    PRINT 'Table user_roles created with indexes.';
END
GO

-- ===============================================
-- NEWS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[news]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[news] (
        [id] int IDENTITY(1,1) NOT NULL,
        [author_id] int NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [slug] nvarchar(255) NOT NULL,
        [category] nvarchar(255) NULL,
        [active] bit NOT NULL DEFAULT 1,
        [content] nvarchar(max) NOT NULL,
        [image] nvarchar(255) NULL,
        [published_at] datetimeoffset NOT NULL,
        [deleted_at] datetimeoffset NULL,
        [created_at] datetimeoffset NULL,
        [updated_at] datetimeoffset NULL,
        CONSTRAINT [PK_news] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für news
    CREATE UNIQUE INDEX [news_slug_unique] ON [news] ([slug]);
    CREATE INDEX [idx_news_published] ON [news] ([published_at], [active]);
    CREATE INDEX [idx_news_category] ON [news] ([category]);
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
        [id] int IDENTITY(1,1) NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [slug] nvarchar(255) NOT NULL,
        [active] bit NOT NULL DEFAULT 1,
        [content] nvarchar(max) NOT NULL,
        [deleted_at] datetimeoffset NULL,
        [created_at] datetimeoffset NULL,
        [updated_at] datetimeoffset NULL,
        CONSTRAINT [PK_pages] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für pages
    CREATE UNIQUE INDEX [pages_slug_unique] ON [pages] ([slug]);
    CREATE INDEX [idx_pages_active] ON [pages] ([active]);
    
    PRINT 'Table pages created with indexes.';
END
GO

-- ===============================================
-- DOWNLOADS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[downloads]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[downloads] (
        [id] int IDENTITY(1,1) NOT NULL,
        [name] nvarchar(255) NOT NULL,
        [desc] nvarchar(max) NOT NULL,
        [url] nvarchar(255) NOT NULL,
        [image] nvarchar(255) NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_downloads] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für downloads
    CREATE INDEX [idx_downloads_name] ON [downloads] ([name]);
    
    PRINT 'Table downloads created with indexes.';
END
GO

-- ===============================================
-- SETTINGS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[settings] (
        [key] nvarchar(255) NOT NULL,
        [value] nvarchar(max) NULL,
        CONSTRAINT [PK_settings] PRIMARY KEY CLUSTERED ([key] ASC)
    );
    
    PRINT 'Table settings created.';
END
GO

-- ===============================================
-- VOTES TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[votes]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[votes] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [url] nvarchar(max) NOT NULL,
        [site] nvarchar(255) NOT NULL,
        [image] nvarchar(max) NOT NULL,
        [ip] nvarchar(255) NOT NULL,
        [param] nvarchar(255) NOT NULL,
        [reward] int NOT NULL DEFAULT 0,
        [timeout] int NOT NULL DEFAULT 12,
        [active] bit NOT NULL DEFAULT 1,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_votes] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für votes
    CREATE INDEX [idx_votes_active] ON [votes] ([active]);
    CREATE INDEX [idx_votes_site] ON [votes] ([site]);
    
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
        [jid] int NOT NULL,
        [site] nvarchar(255) NULL,
        [ip] nvarchar(255) NULL,
        [fingerprint] nvarchar(255) NULL,
        [expire] datetime NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_vote_logs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für vote_logs
    CREATE INDEX [idx_vote_logs_jid] ON [vote_logs] ([jid]);
    CREATE INDEX [idx_vote_logs_site] ON [vote_logs] ([site]);
    CREATE INDEX [idx_vote_logs_expire] ON [vote_logs] ([expire]);
    
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
        [method] nvarchar(255) NOT NULL,
        [transaction_id] nvarchar(255) NOT NULL,
        [status] nvarchar(255) NOT NULL,
        [amount] int NOT NULL,
        [value] int NOT NULL,
        [desc] nvarchar(max) NOT NULL,
        [jid] int NOT NULL,
        [ip] nvarchar(255) NOT NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_donate_logs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für donate_logs
    CREATE INDEX [idx_donate_logs_jid] ON [donate_logs] ([jid]);
    CREATE INDEX [idx_donate_logs_transaction] ON [donate_logs] ([transaction_id]);
    CREATE INDEX [idx_donate_logs_status] ON [donate_logs] ([status]);
    
    PRINT 'Table donate_logs created with indexes.';
END
GO

-- ===============================================
-- VOUCHERS TABLE (SRO-CMS Style)
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vouchers] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [code] nvarchar(255) NOT NULL,
        [amount] int NOT NULL,
        [type] int NOT NULL,
        [valid_date] datetime NULL,
        [jid] bigint NULL,
        [status] nvarchar(255) NOT NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_vouchers] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für vouchers
    CREATE UNIQUE INDEX [vouchers_code_unique] ON [vouchers] ([code]);
    CREATE INDEX [idx_vouchers_status] ON [vouchers] ([status]);
    CREATE INDEX [idx_vouchers_valid_date] ON [vouchers] ([valid_date]);
    CREATE INDEX [idx_vouchers_type] ON [vouchers] ([type]);
    
    PRINT 'Table vouchers created with indexes.';
END
GO

-- ===============================================
-- REFERRALS TABLE (SRO-CMS Style)
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[referrals]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[referrals] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [code] nvarchar(255) NOT NULL,
        [name] nvarchar(255) NULL,
        [ip] nvarchar(255) NULL,
        [fingerprint] nvarchar(255) NULL,
        [jid] bigint NULL,
        [invited_jid] bigint NULL,
        [points] int NOT NULL DEFAULT 0,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_referrals] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für referrals
    CREATE INDEX [idx_referrals_code] ON [referrals] ([code]);
    CREATE INDEX [idx_referrals_jid] ON [referrals] ([jid]);
    CREATE INDEX [idx_referrals_invited] ON [referrals] ([invited_jid]);
    
    PRINT 'Table referrals created with indexes.';
END
GO

-- ===============================================
-- SUPPORT TICKETS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SupportTickets]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SupportTickets] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [UserId] bigint NOT NULL,
        [Subject] nvarchar(150) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [Priority] nvarchar(20) NOT NULL,
        [CreatedAt] datetime NOT NULL,
        [ClosedAt] datetime NULL,
        CONSTRAINT [PK_SupportTickets] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_SupportTickets_User] FOREIGN KEY ([UserId]) REFERENCES [users] ([id]) ON DELETE CASCADE
    );
    
    -- Indizes für SupportTickets
    CREATE INDEX [idx_supporttickets_user] ON [SupportTickets] ([UserId]);
    CREATE INDEX [idx_supporttickets_status] ON [SupportTickets] ([Status]);
    CREATE INDEX [idx_supporttickets_created] ON [SupportTickets] ([CreatedAt]);
    
    PRINT 'Table SupportTickets created with indexes.';
END
GO

-- ===============================================
-- TICKET MESSAGES TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TicketMessages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TicketMessages] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [TicketId] int NOT NULL,
        [SenderId] bigint NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [SentAt] datetime NOT NULL,
        [IsFromStaff] bit NOT NULL DEFAULT 0,
        CONSTRAINT [PK_TicketMessages] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_TicketMessages_Ticket] FOREIGN KEY ([TicketId]) REFERENCES [SupportTickets] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TicketMessages_Sender] FOREIGN KEY ([SenderId]) REFERENCES [users] ([id]) ON DELETE CASCADE
    );
    
    -- Indizes für TicketMessages
    CREATE INDEX [idx_ticketmessages_ticket] ON [TicketMessages] ([TicketId]);
    CREATE INDEX [idx_ticketmessages_sender] ON [TicketMessages] ([SenderId]);
    CREATE INDEX [idx_ticketmessages_sent] ON [TicketMessages] ([SentAt]);
    
    PRINT 'Table TicketMessages created with indexes.';
END
GO

-- ===============================================
-- LARAVEL CACHE TABLES
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cache]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cache] (
        [key] nvarchar(255) NOT NULL,
        [value] nvarchar(max) NOT NULL,
        [expiration] int NOT NULL,
        CONSTRAINT [PK_cache] PRIMARY KEY CLUSTERED ([key] ASC)
    );
    
    PRINT 'Table cache created.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cache_locks]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cache_locks] (
        [key] nvarchar(255) NOT NULL,
        [owner] nvarchar(255) NOT NULL,
        [expiration] int NOT NULL,
        CONSTRAINT [PK_cache_locks] PRIMARY KEY CLUSTERED ([key] ASC)
    );
    
    PRINT 'Table cache_locks created.';
END
GO

-- ===============================================
-- LARAVEL QUEUE TABLES
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[jobs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[jobs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [queue] nvarchar(255) NOT NULL,
        [payload] nvarchar(max) NOT NULL,
        [attempts] tinyint NOT NULL,
        [reserved_at] int NULL,
        [available_at] int NOT NULL,
        [created_at] int NOT NULL,
        CONSTRAINT [PK_jobs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für jobs
    CREATE INDEX [idx_jobs_queue] ON [jobs] ([queue]);
    CREATE INDEX [idx_jobs_reserved] ON [jobs] ([reserved_at]);
    
    PRINT 'Table jobs created with indexes.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[job_batches]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[job_batches] (
        [id] nvarchar(255) NOT NULL,
        [name] nvarchar(255) NOT NULL,
        [total_jobs] int NOT NULL,
        [pending_jobs] int NOT NULL,
        [failed_jobs] int NOT NULL,
        [failed_job_ids] nvarchar(max) NOT NULL,
        [options] nvarchar(max) NULL,
        [cancelled_at] int NULL,
        [created_at] int NOT NULL,
        [finished_at] int NULL,
        CONSTRAINT [PK_job_batches] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    PRINT 'Table job_batches created.';
END
GO

-- ===============================================
-- LARAVEL SESSION TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[sessions] (
        [id] nvarchar(255) NOT NULL,
        [user_id] bigint NULL,
        [ip_address] nvarchar(45) NULL,
        [user_agent] nvarchar(max) NULL,
        [payload] nvarchar(max) NOT NULL,
        [last_activity] int NOT NULL,
        CONSTRAINT [PK_sessions] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für sessions
    CREATE INDEX [idx_sessions_user] ON [sessions] ([user_id]);
    CREATE INDEX [idx_sessions_last_activity] ON [sessions] ([last_activity]);
    
    PRINT 'Table sessions created with indexes.';
END
GO

-- ===============================================
-- LARAVEL AUTH TABLES
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[password_reset_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[password_reset_tokens] (
        [email] nvarchar(255) NOT NULL,
        [token] nvarchar(255) NOT NULL,
        [created_at] datetime NULL,
        CONSTRAINT [PK_password_reset_tokens] PRIMARY KEY CLUSTERED ([email] ASC)
    );
    
    PRINT 'Table password_reset_tokens created.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[personal_access_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[personal_access_tokens] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [tokenable_type] nvarchar(255) NOT NULL,
        [tokenable_id] bigint NOT NULL,
        [name] nvarchar(255) NOT NULL,
        [token] nvarchar(64) NOT NULL,
        [abilities] nvarchar(max) NULL,
        [last_used_at] datetime NULL,
        [expires_at] datetime NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_personal_access_tokens] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für personal_access_tokens
    CREATE UNIQUE INDEX [personal_access_tokens_token_unique] ON [personal_access_tokens] ([token]);
    CREATE INDEX [personal_access_tokens_tokenable] ON [personal_access_tokens] ([tokenable_type], [tokenable_id]);
    
    PRINT 'Table personal_access_tokens created with indexes.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[failed_jobs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[failed_jobs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [uuid] nvarchar(255) NOT NULL,
        [connection] nvarchar(max) NOT NULL,
        [queue] nvarchar(max) NOT NULL,
        [payload] nvarchar(max) NOT NULL,
        [exception] nvarchar(max) NOT NULL,
        [failed_at] datetime NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_failed_jobs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für failed_jobs
    CREATE UNIQUE INDEX [failed_jobs_uuid_unique] ON [failed_jobs] ([uuid]);
    
    PRINT 'Table failed_jobs created with indexes.';
END
GO

-- ===============================================
-- DEFAULT DATA EINTRÄGE
-- ===============================================

-- Standard Settings einfügen
IF NOT EXISTS (SELECT * FROM [settings] WHERE [key] = 'site_name')
BEGIN
    INSERT INTO [settings] ([key], [value]) VALUES
    ('site_name', 'SRO CMS v2'),
    ('site_description', 'Silkroad Online Content Management System'),
    ('site_logo', '/images/logo.png'),
    ('maintenance_mode', '0'),
    ('registration_enabled', '1'),
    ('vote_system_enabled', '1'),
    ('donation_system_enabled', '1'),
    ('silk_rate', '100'),
    ('point_rate', '10'),
    ('max_characters_per_account', '3'),
    ('cache_rankings_minutes', '30'),
    ('ranking_player_limit', '100'),
    ('ranking_guild_limit', '50'),
    ('sro_version', 'iSRO'),
    ('server_rates', '{"exp": 15, "sp": 15, "drop": 10, "gold": 10}');
    
    PRINT 'Default settings inserted.';
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
    ('2024_01_01_000010_create_referrals_table', 1),
    ('2024_01_01_000011_create_user_roles_table', 1),
    ('2024_01_01_000012_create_support_tables', 1),
    ('2024_01_01_000013_create_cache_tables', 1),
    ('2024_01_01_000014_create_queue_tables', 1),
    ('2024_01_01_000015_create_auth_tables', 1);
    
    PRINT 'Migration records inserted.';
END
GO

PRINT '============================================';
PRINT 'SRO CMS v2 Database Setup completed successfully!';
PRINT '============================================';
PRINT '';
PRINT 'Created tables based on current state:';
PRINT '- migrations';
PRINT '- users (with indexes)';
PRINT '- user_roles (with indexes and foreign keys)';
PRINT '- news (with indexes)';
PRINT '- pages (with indexes)';
PRINT '- downloads (with indexes)';
PRINT '- settings';
PRINT '- votes (with indexes)';
PRINT '- vote_logs (with indexes)';
PRINT '- donate_logs (with indexes)';
PRINT '- vouchers (SRO-CMS style with indexes)';
PRINT '- referrals (SRO-CMS style with indexes)';
PRINT '- SupportTickets (with indexes and foreign keys)';
PRINT '- TicketMessages (with indexes and foreign keys)';
PRINT '- cache (Laravel cache system)';
PRINT '- cache_locks (Laravel cache locks)';
PRINT '- jobs (Laravel queue system with indexes)';
PRINT '- job_batches (Laravel queue batches)';
PRINT '- sessions (Laravel sessions with indexes)';
PRINT '- password_reset_tokens';
PRINT '- personal_access_tokens (with indexes)';
PRINT '- failed_jobs (with indexes)';
PRINT '';
PRINT 'Key differences from original:';
PRINT '- Vouchers table uses SRO-CMS schema (amount, type, status, jid)';
PRINT '- Referrals table uses SRO-CMS schema (code, jid, invited_jid, points)';
PRINT '- Added existing Support system tables';
PRINT '- Added Laravel cache, queue, and session tables';
PRINT '- Preserved all existing functionality';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Update API to match SRO-CMS voucher/referral schemas';
PRINT '2. Test all existing functionality';
PRINT '3. Verify compatibility with current codebase';
PRINT '============================================';
GO