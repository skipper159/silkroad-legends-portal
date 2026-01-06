-- ============================================
-- SILKROAD LEGENDS PORTAL - DATABASE SETUP
-- ============================================
-- Part 2: Create All Tables
-- Run this script AFTER 01_create_database.sql
-- ============================================

USE SRO_CMS;
GO

-- ============================================
-- USERS TABLE
-- Web portal users (linked to game via JID)
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [jid] int NULL,                              -- Link to game account (TB_User.JID)
        [username] nvarchar(255) NOT NULL,
        [email] nvarchar(255) NOT NULL,
        [email_verified_at] datetime2(0) NULL,
        [password] nvarchar(255) NOT NULL,
        [totp_secret] nvarchar(255) NULL,            -- 2FA Secret
        [totp_enabled] bit NOT NULL DEFAULT 0,       -- 2FA Status
        [referral_code] nvarchar(255) NULL,
        [referred_by] nvarchar(255) NULL,
        [points] int NOT NULL DEFAULT 0,
        [remember_token] nvarchar(100) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_users] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE UNIQUE INDEX [users_email_unique] ON [users] ([email]);
    CREATE UNIQUE INDEX [users_username_unique] ON [users] ([username]);
    CREATE INDEX [idx_users_jid] ON [users] ([jid]);
    CREATE INDEX [idx_users_referral_code] ON [users] ([referral_code]);
    
    PRINT '✅ Table [users] created';
END
ELSE
BEGIN
    -- Check for new 2FA columns in existing table and add them if missing
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'totp_secret')
    BEGIN
        ALTER TABLE [dbo].[users] ADD [totp_secret] nvarchar(255) NULL;
        PRINT '✅ Added column [totp_secret] to [users] table';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'totp_enabled')
    BEGIN
        ALTER TABLE [dbo].[users] ADD [totp_enabled] bit NOT NULL DEFAULT 0;
        PRINT '✅ Added column [totp_enabled] to [users] table';
    END
END
GO

-- ============================================
-- NEWS TABLE
-- Server announcements and updates
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[news]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[news] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [slug] nvarchar(255) NOT NULL,
        [content] ntext NOT NULL,
        [image] nvarchar(255) NULL,
        [excerpt] nvarchar(500) NULL,
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
    
    CREATE UNIQUE INDEX [news_slug_unique] ON [news] ([slug]);
    CREATE INDEX [idx_news_published] ON [news] ([published_at], [active]);
    CREATE INDEX [idx_news_category] ON [news] ([category]);
    
    PRINT '✅ Table [news] created';
END
GO

-- ============================================
-- PAGES TABLE
-- Static content pages (About, Rules, etc.)
-- ============================================
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
    
    CREATE UNIQUE INDEX [pages_slug_unique] ON [pages] ([slug]);
    CREATE INDEX [idx_pages_active] ON [pages] ([active]);
    
    PRINT '✅ Table [pages] created';
END
GO

-- ============================================
-- DOWNLOADS TABLE
-- Game client and patch downloads
-- ============================================
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
    
    CREATE INDEX [idx_downloads_category] ON [downloads] ([category]);
    CREATE INDEX [idx_downloads_active] ON [downloads] ([active]);
    
    PRINT '✅ Table [downloads] created';
END
GO

-- ============================================
-- SETTINGS TABLE
-- Key-value configuration store
-- ============================================
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
    
    CREATE UNIQUE INDEX [settings_key_unique] ON [settings] ([key]);
    
    PRINT '✅ Table [settings] created';
END
GO

-- ============================================
-- VOTES TABLE
-- Vote site configuration
-- ============================================
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
    
    CREATE INDEX [idx_votes_active] ON [votes] ([active]);
    CREATE INDEX [idx_votes_site] ON [votes] ([site]);
    
    PRINT '✅ Table [votes] created';
END
GO

-- ============================================
-- VOTE_LOGS TABLE
-- User vote history
-- ============================================
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
    
    CREATE INDEX [idx_vote_logs_jid] ON [vote_logs] ([jid]);
    CREATE INDEX [idx_vote_logs_ip] ON [vote_logs] ([ip]);
    CREATE INDEX [idx_vote_logs_status] ON [vote_logs] ([status]);
    
    PRINT '✅ Table [vote_logs] created';
END
GO

-- ============================================
-- DONATE_LOGS TABLE
-- Donation transaction history
-- ============================================
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
    
    CREATE INDEX [idx_donate_logs_jid] ON [donate_logs] ([jid]);
    CREATE INDEX [idx_donate_logs_transaction] ON [donate_logs] ([transaction_id]);
    CREATE INDEX [idx_donate_logs_status] ON [donate_logs] ([status]);
    
    PRINT '✅ Table [donate_logs] created';
END
GO

-- ============================================
-- VOUCHERS TABLE
-- Redeemable voucher codes
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vouchers] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [code] nvarchar(255) NOT NULL,
        [amount] int NOT NULL,
        [type] int NOT NULL DEFAULT 1,
        [valid_date] datetime NULL,
        [jid] bigint NULL,
        [status] nvarchar(50) NOT NULL DEFAULT 'active',
        [max_uses] int NOT NULL DEFAULT 1,
        [used_count] int NOT NULL DEFAULT 0,
        [expires_at] datetime2(0) NULL,
        [description] nvarchar(500) NULL,
        [created_by] bigint NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_vouchers] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_vouchers_creator] FOREIGN KEY ([created_by]) REFERENCES [users] ([id]) ON DELETE SET NULL
    );
    
    CREATE UNIQUE INDEX [vouchers_code_unique] ON [vouchers] ([code]);
    CREATE INDEX [idx_vouchers_status] ON [vouchers] ([status]);
    
    PRINT '✅ Table [vouchers] created';
END
GO

-- ============================================
-- VOUCHER_LOGS TABLE
-- Voucher redemption history
-- ============================================
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
    
    CREATE INDEX [idx_voucher_logs_jid] ON [voucher_logs] ([jid]);
    CREATE INDEX [idx_voucher_logs_voucher] ON [voucher_logs] ([voucher_id]);
    
    PRINT '✅ Table [voucher_logs] created';
END
GO

-- ============================================
-- REFERRALS TABLE
-- Referral tracking with anti-cheat features
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[referrals]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[referrals] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [code] nvarchar(255) NULL,
        [name] nvarchar(255) NULL,
        [ip] nvarchar(45) NULL,
        [fingerprint] nvarchar(MAX) NULL,
        [jid] bigint NULL,
        [invited_jid] bigint NULL,
        [points] int NOT NULL DEFAULT 0,
        [reward_silk] int NOT NULL DEFAULT 0,
        [redeemed] bit NOT NULL DEFAULT 0,
        [redeemed_at] datetime2(0) NULL,
        [ip_address] nvarchar(45) NULL,
        [is_valid] bit NOT NULL DEFAULT 1,
        [cheat_reason] nvarchar(MAX) NULL,
        [status] nvarchar(50) NOT NULL DEFAULT 'pending',
        [requires_validation] bit NOT NULL DEFAULT 0,
        [reward_given_at] datetime NULL,
        [last_processed_at] datetime NULL,
        [next_process_at] datetime NULL,
        [process_attempts] int NOT NULL DEFAULT 0,
        [validation_notes] nvarchar(MAX) NULL,
        [auto_processed] bit NOT NULL DEFAULT 0,
        [reward_amount] decimal(10,2) NULL,
        [reward_type] nvarchar(50) NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_referrals] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_referrals_jid] ON [referrals] ([jid]);
    CREATE INDEX [idx_referrals_invited_jid] ON [referrals] ([invited_jid]);
    CREATE INDEX [idx_referrals_status] ON [referrals] ([status]);
    CREATE INDEX [idx_referrals_code] ON [referrals] ([code]);
    
    PRINT '✅ Table [referrals] created';
END
GO

-- ============================================
-- REFERRAL_SETTINGS TABLE
-- Referral system configuration
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[referral_settings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[referral_settings] (
        [id] int IDENTITY(1,1) NOT NULL,
        [setting_key] nvarchar(50) NOT NULL,
        [setting_value] nvarchar(255) NOT NULL,
        [description] nvarchar(500) NULL,
        [created_at] datetime2(0) DEFAULT GETDATE(),
        [updated_at] datetime2(0) DEFAULT GETDATE(),
        CONSTRAINT [PK_referral_settings] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE UNIQUE INDEX [referral_settings_key_unique] ON [referral_settings] ([setting_key]);
    
    PRINT '✅ Table [referral_settings] created';
END
GO

-- ============================================
-- REFERRAL_REWARDS TABLE
-- Referral reward tiers
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[referral_rewards]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[referral_rewards] (
        [id] int IDENTITY(1,1) NOT NULL,
        [points_required] int NOT NULL,
        [silk_reward] int NOT NULL DEFAULT 0,
        [item_id] int NULL,
        [description] nvarchar(500) NOT NULL,
        [is_active] bit NOT NULL DEFAULT 1,
        [created_at] datetime2(0) DEFAULT GETDATE(),
        [updated_at] datetime2(0) DEFAULT GETDATE(),
        CONSTRAINT [PK_referral_rewards] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_referral_rewards_points] ON [referral_rewards] ([points_required]);
    
    PRINT '✅ Table [referral_rewards] created';
END
GO

-- ============================================
-- USER_ROLES TABLE
-- Role-based access control
-- ============================================
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
    
    CREATE INDEX [idx_user_roles_user] ON [user_roles] ([user_id]);
    CREATE INDEX [idx_user_roles_role] ON [user_roles] ([role]);
    CREATE UNIQUE INDEX [user_roles_user_role_unique] ON [user_roles] ([user_id], [role]);
    
    PRINT '✅ Table [user_roles] created';
END
GO

-- ============================================
-- SUPPORT TICKETS TABLE
-- Support ticket system
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SupportTickets]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SupportTickets] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [UserId] bigint NOT NULL,
        [Subject] nvarchar(255) NOT NULL,
        [Status] nvarchar(50) NOT NULL DEFAULT 'open',
        [Priority] nvarchar(20) NOT NULL DEFAULT 'normal',
        [CreatedAt] datetime NOT NULL DEFAULT GETDATE(),
        [ClosedAt] datetime NULL,
        CONSTRAINT [PK_SupportTickets] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_SupportTickets_User] FOREIGN KEY ([UserId]) REFERENCES [users] ([id]) ON DELETE CASCADE
    );
    
    CREATE INDEX [idx_supporttickets_user] ON [SupportTickets] ([UserId]);
    CREATE INDEX [idx_supporttickets_status] ON [SupportTickets] ([Status]);
    
    PRINT '✅ Table [SupportTickets] created';
END
GO

-- ============================================
-- TICKET MESSAGES TABLE
-- Support ticket messages/replies
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TicketMessages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TicketMessages] (
        [Id] int IDENTITY(1,1) NOT NULL,
        [TicketId] int NOT NULL,
        [SenderId] bigint NOT NULL,
        [Message] nvarchar(MAX) NOT NULL,
        [SentAt] datetime NOT NULL DEFAULT GETDATE(),
        [IsFromStaff] bit NOT NULL DEFAULT 0,
        CONSTRAINT [PK_TicketMessages] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_TicketMessages_Ticket] FOREIGN KEY ([TicketId]) REFERENCES [SupportTickets] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TicketMessages_User] FOREIGN KEY ([SenderId]) REFERENCES [users] ([id]) ON DELETE NO ACTION
    );
    
    CREATE INDEX [idx_ticketmessages_ticket] ON [TicketMessages] ([TicketId]);
    CREATE INDEX [idx_ticketmessages_sender] ON [TicketMessages] ([SenderId]);
    
    PRINT '✅ Table [TicketMessages] created';
END
GO

-- ============================================
-- FOOTER_SECTIONS TABLE
-- Footer navigation sections
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[footer_sections]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[footer_sections] (
        [id] int IDENTITY(1,1) NOT NULL,
        [title] nvarchar(100) NOT NULL,
        [sort_order] int NOT NULL DEFAULT 0,
        [active] bit NOT NULL DEFAULT 1,
        [created_at] datetime2(0) DEFAULT GETDATE(),
        [updated_at] datetime2(0) DEFAULT GETDATE(),
        CONSTRAINT [PK_footer_sections] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    PRINT '✅ Table [footer_sections] created';
END
GO

-- ============================================
-- FOOTER_LINKS TABLE
-- Footer navigation links
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[footer_links]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[footer_links] (
        [id] int IDENTITY(1,1) NOT NULL,
        [section_id] int NOT NULL,
        [title] nvarchar(100) NOT NULL,
        [url] nvarchar(500) NOT NULL,
        [sort_order] int NOT NULL DEFAULT 0,
        [active] bit NOT NULL DEFAULT 1,
        [open_new_tab] bit NOT NULL DEFAULT 0,
        [created_at] datetime2(0) DEFAULT GETDATE(),
        [updated_at] datetime2(0) DEFAULT GETDATE(),
        CONSTRAINT [PK_footer_links] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_footer_links_section] FOREIGN KEY ([section_id]) REFERENCES [footer_sections] ([id]) ON DELETE CASCADE
    );
    
    PRINT '✅ Table [footer_links] created';
END
GO

-- ============================================
-- CRON_JOB_SETTINGS TABLE
-- Scheduled task configuration
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cron_job_settings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cron_job_settings] (
        [id] int IDENTITY(1,1) NOT NULL,
        [job_name] nvarchar(100) NOT NULL,
        [schedule] nvarchar(100) NOT NULL,
        [is_active] bit NOT NULL DEFAULT 1,
        [last_run] datetime2(0) NULL,
        [created_at] datetime2(0) DEFAULT GETDATE(),
        [updated_at] datetime2(0) DEFAULT GETDATE(),
        CONSTRAINT [PK_cron_job_settings] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE UNIQUE INDEX [cron_job_settings_name_unique] ON [cron_job_settings] ([job_name]);
    
    PRINT '✅ Table [cron_job_settings] created';
END
GO

-- ============================================
-- USER_GAMEACCOUNTS TABLE
-- Links web users to game accounts
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[user_gameaccounts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[user_gameaccounts] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [user_id] bigint NOT NULL,
        [gameaccount_jid] int NOT NULL,
        [is_primary] bit NOT NULL DEFAULT 0,
        [created_at] datetime2(0) DEFAULT GETDATE(),
        CONSTRAINT [PK_user_gameaccounts] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_user_gameaccounts_user] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE
    );
    
    CREATE INDEX [idx_user_gameaccounts_user] ON [user_gameaccounts] ([user_id]);
    CREATE INDEX [idx_user_gameaccounts_jid] ON [user_gameaccounts] ([gameaccount_jid]);
    CREATE UNIQUE INDEX [user_gameaccounts_jid_unique] ON [user_gameaccounts] ([gameaccount_jid]);
    
    PRINT '✅ Table [user_gameaccounts] created';
END
GO

-- ============================================
-- SESSIONS TABLE
-- Laravel session storage
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[sessions] (
        [id] nvarchar(255) NOT NULL,
        [user_id] bigint NULL,
        [ip_address] nvarchar(45) NULL,
        [user_agent] nvarchar(MAX) NULL,
        [payload] nvarchar(MAX) NOT NULL,
        [last_activity] int NOT NULL,
        CONSTRAINT [PK_sessions] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_sessions_user] ON [sessions] ([user_id]);
    CREATE INDEX [idx_sessions_last_activity] ON [sessions] ([last_activity]);
    
    PRINT '✅ Table [sessions] created';
END
GO

-- ============================================
-- PASSWORD_RESET_TOKENS TABLE
-- Password reset functionality
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[password_reset_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[password_reset_tokens] (
        [email] nvarchar(255) NOT NULL,
        [token] nvarchar(255) NOT NULL,
        [created_at] datetime NULL,
        CONSTRAINT [PK_password_reset_tokens] PRIMARY KEY CLUSTERED ([email] ASC)
    );
    
    CREATE INDEX [idx_password_reset_tokens_token] ON [password_reset_tokens] ([token]);
    
    PRINT '✅ Table [password_reset_tokens] created';
END
GO

-- ============================================
-- PERSONAL_ACCESS_TOKENS TABLE
-- Laravel Sanctum API tokens
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[personal_access_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[personal_access_tokens] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [tokenable_type] nvarchar(255) NOT NULL,
        [tokenable_id] bigint NOT NULL,
        [name] nvarchar(255) NOT NULL,
        [token] nvarchar(64) NOT NULL,
        [abilities] nvarchar(MAX) NULL,
        [last_used_at] datetime NULL,
        [expires_at] datetime NULL,
        [created_at] datetime NULL,
        [updated_at] datetime NULL,
        CONSTRAINT [PK_personal_access_tokens] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_personal_access_tokens_tokenable] ON [personal_access_tokens] ([tokenable_type], [tokenable_id]);
    CREATE UNIQUE INDEX [personal_access_tokens_token_unique] ON [personal_access_tokens] ([token]);
    
    PRINT '✅ Table [personal_access_tokens] created';
END
GO

-- ============================================
-- CACHE TABLE
-- Laravel cache storage
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cache]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cache] (
        [key] nvarchar(255) NOT NULL,
        [value] nvarchar(MAX) NOT NULL,
        [expiration] int NOT NULL,
        CONSTRAINT [PK_cache] PRIMARY KEY CLUSTERED ([key] ASC)
    );
    
    CREATE INDEX [idx_cache_expiration] ON [cache] ([expiration]);
    
    PRINT '✅ Table [cache] created';
END
GO

-- ============================================
-- CACHE_LOCKS TABLE
-- Laravel cache locking mechanism
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[cache_locks]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[cache_locks] (
        [key] nvarchar(255) NOT NULL,
        [owner] nvarchar(255) NOT NULL,
        [expiration] int NOT NULL,
        CONSTRAINT [PK_cache_locks] PRIMARY KEY CLUSTERED ([key] ASC)
    );
    
    PRINT '✅ Table [cache_locks] created';
END
GO

-- ============================================
-- JOBS TABLE
-- Laravel job queue
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[jobs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[jobs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [queue] nvarchar(255) NOT NULL,
        [payload] nvarchar(MAX) NOT NULL,
        [attempts] tinyint NOT NULL,
        [reserved_at] int NULL,
        [available_at] int NOT NULL,
        [created_at] int NOT NULL,
        CONSTRAINT [PK_jobs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_jobs_queue] ON [jobs] ([queue]);
    
    PRINT '✅ Table [jobs] created';
END
GO

-- ============================================
-- JOB_BATCHES TABLE
-- Laravel job batch tracking
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[job_batches]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[job_batches] (
        [id] nvarchar(255) NOT NULL,
        [name] nvarchar(255) NOT NULL,
        [total_jobs] int NOT NULL,
        [pending_jobs] int NOT NULL,
        [failed_jobs] int NOT NULL,
        [failed_job_ids] nvarchar(MAX) NOT NULL,
        [options] nvarchar(MAX) NULL,
        [cancelled_at] int NULL,
        [created_at] int NOT NULL,
        [finished_at] int NULL,
        CONSTRAINT [PK_job_batches] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    PRINT '✅ Table [job_batches] created';
END
GO

-- ============================================
-- FAILED_JOBS TABLE
-- Failed Laravel jobs
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[failed_jobs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[failed_jobs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [uuid] nvarchar(255) NOT NULL,
        [connection] nvarchar(MAX) NOT NULL,
        [queue] nvarchar(MAX) NOT NULL,
        [payload] nvarchar(MAX) NOT NULL,
        [exception] nvarchar(MAX) NOT NULL,
        [failed_at] datetime NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_failed_jobs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE UNIQUE INDEX [failed_jobs_uuid_unique] ON [failed_jobs] ([uuid]);
    
    PRINT '✅ Table [failed_jobs] created';
END
GO

-- ============================================
-- MIGRATIONS TABLE
-- Laravel migrations tracking
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[migrations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[migrations] (
        [id] int IDENTITY(1,1) NOT NULL,
        [migration] nvarchar(255) NOT NULL,
        [batch] int NOT NULL,
        CONSTRAINT [PK_migrations] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    PRINT '✅ Table [migrations] created';
END
GO

-- ============================================
-- REFERRAL_ANTICHEAT_LOGS TABLE
-- Anti-cheat logging for referral system
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[referral_anticheat_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[referral_anticheat_logs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [user_id] bigint NULL,
        [ip_address] nvarchar(45) NULL,
        [fingerprint] nvarchar(MAX) NULL,
        [action] nvarchar(100) NOT NULL,
        [referral_code] nvarchar(255) NULL,
        [is_suspicious] bit NOT NULL DEFAULT 0,
        [detection_reason] nvarchar(MAX) NULL,
        [user_agent] nvarchar(MAX) NULL,
        [created_at] datetime2(0) DEFAULT GETDATE(),
        CONSTRAINT [PK_referral_anticheat_logs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_referral_anticheat_user] ON [referral_anticheat_logs] ([user_id]);
    CREATE INDEX [idx_referral_anticheat_suspicious] ON [referral_anticheat_logs] ([is_suspicious]);
    
    PRINT '✅ Table [referral_anticheat_logs] created';
END
GO

-- ============================================
-- BEHAVIORAL_FINGERPRINTS TABLE
-- Behavioral fingerprinting for fraud detection
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[behavioral_fingerprints]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[behavioral_fingerprints] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [user_id] int NULL,
        [fingerprint_hash] nvarchar(255) NOT NULL,
        [mouse_pattern_hash] nvarchar(255) NULL,
        [scroll_pattern_hash] nvarchar(255) NULL,
        [typing_pattern_hash] nvarchar(255) NULL,
        [similarity_cluster] int NULL,
        [confidence_score] decimal(5,4) NULL,
        [registration_count] int NOT NULL DEFAULT 1,
        [first_seen] datetime NOT NULL DEFAULT GETDATE(),
        [last_seen] datetime NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_behavioral_fingerprints] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_behavioral_fingerprint_hash] ON [behavioral_fingerprints] ([fingerprint_hash]);
    CREATE INDEX [idx_behavioral_cluster] ON [behavioral_fingerprints] ([similarity_cluster]);
    
    PRINT '✅ Table [behavioral_fingerprints] created';
END
GO

-- ============================================
-- KNOWN_VPN_IPS TABLE
-- VPN detection database
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[known_vpn_ips]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[known_vpn_ips] (
        [id] int IDENTITY(1,1) NOT NULL,
        [ip_address] nvarchar(45) NOT NULL,
        [provider] nvarchar(255) NULL,
        [country_code] nvarchar(10) NULL,
        [confidence] decimal(5,2) NOT NULL DEFAULT 1.0,
        [is_active] bit NOT NULL DEFAULT 1,
        [first_detected] datetime NOT NULL DEFAULT GETDATE(),
        [last_seen] datetime NOT NULL DEFAULT GETDATE(),
        [detection_count] int NOT NULL DEFAULT 1,
        CONSTRAINT [PK_known_vpn_ips] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE UNIQUE INDEX [known_vpn_ips_ip_unique] ON [known_vpn_ips] ([ip_address]);
    
    PRINT '✅ Table [known_vpn_ips] created';
END
GO

-- ============================================
-- REFERRAL_REDEMPTION_LOG TABLE
-- Tracks referral reward redemptions
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[referral_redemption_log]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[referral_redemption_log] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [jid] bigint NOT NULL,
        [reward_id] bigint NULL,
        [points_spent] int NOT NULL,
        [reward_type] nvarchar(50) NOT NULL,
        [reward_value] nvarchar(255) NULL,
        [redeemed_at] datetime2(0) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_referral_redemption_log] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_referral_redemption_jid] ON [referral_redemption_log] ([jid]);
    
    PRINT '✅ Table [referral_redemption_log] created';
END
GO

-- ============================================
-- DELAYED_REWARD_LOGS TABLE
-- Tracks delayed reward processing
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[delayed_reward_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[delayed_reward_logs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [referral_id] bigint NOT NULL,
        [user_jid] int NOT NULL,
        [referrer_jid] int NOT NULL,
        [old_status] nvarchar(50) NULL,
        [new_status] nvarchar(50) NOT NULL,
        [processing_reason] nvarchar(MAX) NULL,
        [account_age_days] int NULL,
        [total_playtime_hours] decimal(10,2) NULL,
        [highest_char_level] int NULL,
        [unique_login_days] int NULL,
        [total_logins] int NULL,
        [last_login] datetime NULL,
        [meets_age_requirement] bit NOT NULL DEFAULT 0,
        [meets_playtime_requirement] bit NOT NULL DEFAULT 0,
        [meets_level_requirement] bit NOT NULL DEFAULT 0,
        [meets_login_requirement] bit NOT NULL DEFAULT 0,
        [has_suspicious_activity] bit NOT NULL DEFAULT 0,
        [reward_amount] decimal(10,2) NULL,
        [reward_type] nvarchar(50) NULL,
        [reward_given] bit NOT NULL DEFAULT 0,
        [reward_error] nvarchar(MAX) NULL,
        [processed_at] datetime NOT NULL DEFAULT GETDATE(),
        [processed_by] nvarchar(100) NOT NULL DEFAULT 'system',
        CONSTRAINT [PK_delayed_reward_logs] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_delayed_reward_referral] ON [delayed_reward_logs] ([referral_id]);
    CREATE INDEX [idx_delayed_reward_user] ON [delayed_reward_logs] ([user_jid]);
    
    PRINT '✅ Table [delayed_reward_logs] created';
END
GO

-- ============================================
-- SILK_ACCOUNT_CACHE TABLE
-- Caches silk balance information
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[silk_account_cache]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[silk_account_cache] (
        [portal_jid] int NOT NULL,
        [premium_silk] int NOT NULL DEFAULT 0,
        [silk] int NOT NULL DEFAULT 0,
        [vip_level] tinyint NOT NULL DEFAULT 0,
        [error_code] int NOT NULL DEFAULT 0,
        [last_updated] datetime2(0) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_silk_account_cache] PRIMARY KEY CLUSTERED ([portal_jid] ASC)
    );
    
    CREATE INDEX [idx_silk_cache_updated] ON [silk_account_cache] ([last_updated]);
    
    PRINT '✅ Table [silk_account_cache] created';
END
GO

-- ============================================
-- SILK_SERVER_STATS TABLE
-- Server-wide silk statistics
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[silk_server_stats]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[silk_server_stats] (
        [id] int IDENTITY(1,1) NOT NULL,
        [total_premium_silk] bigint NOT NULL DEFAULT 0,
        [total_silk] bigint NOT NULL DEFAULT 0,
        [total_accounts] int NOT NULL DEFAULT 0,
        [accounts_with_silk] int NOT NULL DEFAULT 0,
        [vip_accounts] int NOT NULL DEFAULT 0,
        [total_donations] int NOT NULL DEFAULT 0,
        [total_donated_usd] decimal(15,2) NOT NULL DEFAULT 0,
        [total_donated_silk] bigint NOT NULL DEFAULT 0,
        [unique_donors] int NOT NULL DEFAULT 0,
        [calculation_duration_seconds] int NULL,
        [last_calculated] datetime2(0) NOT NULL DEFAULT GETDATE(),
        [created_at] datetime2(0) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_silk_server_stats] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_silk_server_stats_calculated] ON [silk_server_stats] ([last_calculated]);
    
    PRINT '✅ Table [silk_server_stats] created';
END
GO

-- ============================================
-- ACCOUNT_DELETION_TOKENS TABLE
-- Tracks account deletion requests
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[account_deletion_tokens]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[account_deletion_tokens] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [user_id] bigint NOT NULL,
        [gameaccount_jid] int NOT NULL,
        [token] nvarchar(255) NOT NULL,
        [email] nvarchar(255) NOT NULL,
        [gameaccount_name] nvarchar(255) NULL,
        [expires_at] datetime2(0) NOT NULL,
        [created_at] datetime2(0) NOT NULL DEFAULT GETDATE(),
        [used_at] datetime2(0) NULL,
        CONSTRAINT [PK_account_deletion_tokens] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_account_deletion_user] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE
    );
    
    CREATE UNIQUE INDEX [account_deletion_tokens_token_unique] ON [account_deletion_tokens] ([token]);
    CREATE INDEX [idx_account_deletion_user] ON [account_deletion_tokens] ([user_id]);
    
    PRINT '✅ Table [account_deletion_tokens] created';
END
GO

-- ============================================
-- FOOTER_HARDCODED_LINKS TABLE
-- Hardcoded footer link configuration
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[footer_hardcoded_links]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[footer_hardcoded_links] (
        [id] int IDENTITY(1,1) NOT NULL,
        [link_key] nvarchar(50) NOT NULL,
        [title] nvarchar(100) NOT NULL,
        [url] nvarchar(500) NOT NULL,
        [section] nvarchar(50) NOT NULL,
        [is_visible] bit NOT NULL DEFAULT 1,
        [display_order] int NOT NULL DEFAULT 0,
        [created_at] datetime DEFAULT GETDATE(),
        [updated_at] datetime DEFAULT GETDATE(),
        CONSTRAINT [PK_footer_hardcoded_links] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE UNIQUE INDEX [footer_hardcoded_links_key_unique] ON [footer_hardcoded_links] ([link_key]);
    
    PRINT '✅ Table [footer_hardcoded_links] created';
END
GO

-- ============================================
-- PLAYERS_ONLINE_HISTORY TABLE
-- Online player count tracking
-- ============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[players_online_history]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[players_online_history] (
        [id] int IDENTITY(1,1) NOT NULL,
        [player_count] int NOT NULL,
        [recorded_at] datetime2(0) NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_players_online_history] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_players_online_recorded] ON [players_online_history] ([recorded_at]);
    
    PRINT '✅ Table [players_online_history] created';
END
GO

-- ============================================
-- COMPLETE!
-- ============================================
PRINT '';
PRINT '============================================';
PRINT '✅ All tables created successfully!';
PRINT '============================================';
PRINT '';
PRINT 'Core Tables:';
PRINT '  - users, user_roles, user_gameaccounts';
PRINT '  - news, pages, downloads';
PRINT '  - settings';
PRINT '';
PRINT 'Vote & Donation:';
PRINT '  - votes, vote_logs';
PRINT '  - donate_logs';
PRINT '  - vouchers, voucher_logs';
PRINT '';
PRINT 'Referral System:';
PRINT '  - referrals, referral_settings, referral_rewards';
PRINT '  - referral_redemption_log, delayed_reward_logs';
PRINT '  - referral_anticheat_logs, behavioral_fingerprints';
PRINT '  - known_vpn_ips';
PRINT '';
PRINT 'Support System:';
PRINT '  - SupportTickets, TicketMessages';
PRINT '';
PRINT 'Laravel Framework:';
PRINT '  - sessions, password_reset_tokens';
PRINT '  - personal_access_tokens';
PRINT '  - cache, cache_locks';
PRINT '  - jobs, job_batches, failed_jobs';
PRINT '  - migrations';
PRINT '';
PRINT 'Statistics & Tracking:';
PRINT '  - silk_account_cache, silk_server_stats';
PRINT '  - players_online_history';
PRINT '  - cron_job_settings';
PRINT '';
PRINT 'Footer & Misc:';
PRINT '  - footer_sections, footer_links, footer_hardcoded_links';
PRINT '  - account_deletion_tokens';
PRINT '';
PRINT 'Next step: Run 03_seed_data.sql for sample data';
PRINT '============================================';
GO
- -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 - -   S I L K R O A D   L E G E N D S   P O R T A L   -   D A T A B A S E   U P D A T E  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 - -   P a r t   6 :   C r e a t e   S i t e   M o d a l s   T a b l e  
 - -   F o r   m a n a g i n g   d y n a m i c   e v e n t   p o p u p s / m o d a l s   v i a   A d m i n   P a n e l  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 U S E   S R O _ C M S ;  
 G O  
  
 I F   N O T   E X I S T S   ( S E L E C T   *   F R O M   s y s . o b j e c t s   W H E R E   o b j e c t _ i d   =   O B J E C T _ I D ( N ' [ d b o ] . [ s i t e _ m o d a l s ] ' )   A N D   t y p e   i n   ( N ' U ' ) )  
 B E G I N  
         C R E A T E   T A B L E   [ d b o ] . [ s i t e _ m o d a l s ]   (  
                 [ i d ]   i n t   I D E N T I T Y ( 1 , 1 )   N O T   N U L L ,  
                 [ t i t l e ]   n v a r c h a r ( 2 5 5 )   N O T   N U L L ,  
                 [ c o n t e n t ]   n v a r c h a r ( M A X )   N U L L ,  
                 [ i m a g e _ u r l ]   n v a r c h a r ( 5 0 0 )   N U L L ,  
                 [ b u t t o n _ t e x t ]   n v a r c h a r ( 1 0 0 )   N U L L ,  
                 [ b u t t o n _ u r l ]   n v a r c h a r ( 5 0 0 )   N U L L ,  
                 [ s t a r t _ d a t e ]   d a t e t i m e 2 ( 0 )   N U L L ,  
                 [ e n d _ d a t e ]   d a t e t i m e 2 ( 0 )   N U L L ,  
                 [ i s _ a c t i v e ]   b i t   N O T   N U L L   D E F A U L T   1 ,  
                 [ p r i o r i t y ]   i n t   N O T   N U L L   D E F A U L T   0 ,  
                 [ s h o w _ o n c e ]   b i t   N O T   N U L L   D E F A U L T   1 ,  
                 [ c r e a t e d _ a t ]   d a t e t i m e 2 ( 0 )   D E F A U L T   G E T D A T E ( ) ,  
                 [ u p d a t e d _ a t ]   d a t e t i m e 2 ( 0 )   D E F A U L T   G E T D A T E ( ) ,  
                 C O N S T R A I N T   [ P K _ s i t e _ m o d a l s ]   P R I M A R Y   K E Y   C L U S T E R E D   ( [ i d ]   A S C )  
         ) ;  
          
         C R E A T E   I N D E X   [ i d x _ s i t e _ m o d a l s _ a c t i v e ]   O N   [ s i t e _ m o d a l s ]   ( [ i s _ a c t i v e ] ) ;  
         C R E A T E   I N D E X   [ i d x _ s i t e _ m o d a l s _ d a t e s ]   O N   [ s i t e _ m o d a l s ]   ( [ s t a r t _ d a t e ] ,   [ e n d _ d a t e ] ) ;  
          
         P R I N T   ' � S&   T a b l e   [ s i t e _ m o d a l s ]   c r e a t e d ' ;  
 E N D  
 E L S E  
 B E G I N  
         P R I N T   ' �  � � � �   T a b l e   [ s i t e _ m o d a l s ]   a l r e a d y   e x i s t s ' ;  
 E N D  
 G O  
 