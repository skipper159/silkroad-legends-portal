-- SRO CMS Migration - Database Schema Update
-- This script creates all necessary tables for the SRO CMS features
-- Run this on your Lafftale_Web database

-- ========================================
-- PAGES SYSTEM
-- ========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pages' AND xtype='U')
CREATE TABLE pages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    content NTEXT NOT NULL,
    excerpt NVARCHAR(500) NULL,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Indizes für Pages
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_active ON pages(active);

-- ========================================
-- DOWNLOADS SYSTEM
-- ========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='downloads' AND xtype='U')
CREATE TABLE downloads (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NTEXT NULL,
    file_url NVARCHAR(500) NOT NULL,
    file_size NVARCHAR(50) NULL,
    version NVARCHAR(50) NULL,
    category NVARCHAR(100) NOT NULL,
    download_count INT NOT NULL DEFAULT 0,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Indizes für Downloads
CREATE INDEX idx_downloads_category ON downloads(category);
CREATE INDEX idx_downloads_active ON downloads(active);

-- ========================================
-- VOUCHERS SYSTEM
-- ========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vouchers' AND xtype='U')
CREATE TABLE vouchers (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(100) NOT NULL UNIQUE,
    type NVARCHAR(50) NOT NULL, -- 'silk', 'gold', 'experience'
    value INT NOT NULL,
    max_uses INT NOT NULL DEFAULT 1,
    uses_left INT NOT NULL DEFAULT 1,
    expires_at DATETIME2 NULL,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Indizes für Vouchers
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_active ON vouchers(active);
CREATE INDEX idx_vouchers_expires ON vouchers(expires_at);

-- Voucher Usage Tracking
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='voucher_usage' AND xtype='U')
CREATE TABLE voucher_usage (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    voucher_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_jid INT NOT NULL,
    type NVARCHAR(50) NOT NULL,
    value INT NOT NULL,
    redeemed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
);

-- Indizes für Voucher Usage
CREATE INDEX idx_voucher_usage_voucher ON voucher_usage(voucher_id);
CREATE INDEX idx_voucher_usage_user ON voucher_usage(user_id);
CREATE INDEX idx_voucher_usage_jid ON voucher_usage(user_jid);

-- ========================================
-- VOTES SYSTEM
-- ========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='votes' AND xtype='U')
CREATE TABLE votes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NTEXT NULL,
    url NVARCHAR(500) NOT NULL,
    site NVARCHAR(100) NOT NULL, -- 'xtremetop100', 'topgameservers', etc.
    reward INT NOT NULL DEFAULT 0, -- Silk reward amount
    timeout INT NOT NULL DEFAULT 24, -- Hours between votes
    vote_count INT NOT NULL DEFAULT 0,
    active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Indizes für Votes
CREATE INDEX idx_votes_active ON votes(active);
CREATE INDEX idx_votes_site ON votes(site);

-- Vote Logs
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vote_logs' AND xtype='U')
CREATE TABLE vote_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    vote_id BIGINT NOT NULL,
    jid INT NOT NULL, -- User JID from SRO
    ip NVARCHAR(45) NULL,
    reward INT NOT NULL DEFAULT 0,
    status NVARCHAR(20) NOT NULL DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    voted_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (vote_id) REFERENCES votes(id)
);

-- Indizes für Vote Logs
CREATE INDEX idx_vote_logs_vote ON vote_logs(vote_id);
CREATE INDEX idx_vote_logs_jid ON vote_logs(jid);
CREATE INDEX idx_vote_logs_ip ON vote_logs(ip);
CREATE INDEX idx_vote_logs_status ON vote_logs(status);
CREATE INDEX idx_vote_logs_voted ON vote_logs(voted_at);

-- ========================================
-- REFERRALS SYSTEM
-- ========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='referrals' AND xtype='U')
CREATE TABLE referrals (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    referrer_jid INT NOT NULL, -- User who referred
    referred_jid INT NOT NULL, -- User who was referred
    points INT NOT NULL DEFAULT 0,
    redeemed BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Indizes für Referrals
CREATE INDEX idx_referrals_referrer ON referrals(referrer_jid);
CREATE INDEX idx_referrals_referred ON referrals(referred_jid);
CREATE INDEX idx_referrals_redeemed ON referrals(redeemed);

-- ========================================
-- USER ROLES SYSTEM
-- ========================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_roles' AND xtype='U')
CREATE TABLE user_roles (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role NVARCHAR(50) NOT NULL, -- 'admin', 'moderator', 'support', 'vip', 'premium'
    permissions NTEXT NULL, -- JSON string of permissions
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Indizes für User Roles
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- ========================================
-- SETTINGS SYSTEM (Enhanced)
-- ========================================
-- Check if settings table exists, if not create it
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='settings' AND xtype='U')
CREATE TABLE settings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    [key] NVARCHAR(255) NOT NULL UNIQUE,
    value NTEXT NULL,
    type NVARCHAR(50) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description NVARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Indizes für Settings
CREATE UNIQUE INDEX idx_settings_key ON settings([key]);

-- ========================================
-- INSERT DEFAULT DATA
-- ========================================

-- Default Settings
IF NOT EXISTS (SELECT * FROM settings WHERE [key] = 'site_name')
INSERT INTO settings ([key], value, type, description) VALUES 
('site_name', 'Lafftale Private Server', 'string', 'Website name displayed in header'),
('site_description', 'The best Silkroad Online private server', 'string', 'Site meta description'),
('maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode'),
('registration_enabled', 'true', 'boolean', 'Allow new user registrations'),
('max_characters_per_account', '4', 'number', 'Maximum characters per account'),
('silk_rate', '1', 'number', 'Silk to real currency rate'),
('exp_rate', '5', 'number', 'Experience rate multiplier'),
('gold_rate', '3', 'number', 'Gold drop rate multiplier'),
('item_rate', '2', 'number', 'Item drop rate multiplier'),
('email_notifications', 'true', 'boolean', 'Enable email notifications'),
('discord_webhook', '', 'string', 'Discord webhook URL for notifications'),
('server_ip', '127.0.0.1', 'string', 'Game server IP address'),
('server_port', '15779', 'string', 'Game server port'),
('download_client_url', '', 'string', 'Client download URL'),
('referral_points', '50', 'number', 'Points awarded per referral'),
('min_referral_redeem', '100', 'number', 'Minimum points to redeem'),
('vote_silk_reward', '25', 'number', 'Default silk reward for voting');

-- Default Pages
IF NOT EXISTS (SELECT * FROM pages WHERE slug = 'about')
INSERT INTO pages (title, slug, content, excerpt, active) VALUES 
('About Us', 'about', '<h1>About Lafftale</h1><p>Welcome to the best Silkroad Online private server experience!</p>', 'Learn more about our server', 1),
('Rules', 'rules', '<h1>Server Rules</h1><p>Please follow these rules to ensure a fair gaming experience for everyone.</p>', 'Server rules and guidelines', 1),
('Downloads', 'downloads', '<h1>Downloads</h1><p>Download the latest client and patches here.</p>', 'Client downloads and patches', 1),
('Guide', 'guide', '<h1>Beginner Guide</h1><p>New to Silkroad? Start here!</p>', 'Getting started guide', 1);

-- Default Download Categories
IF NOT EXISTS (SELECT * FROM downloads WHERE category = 'client')
INSERT INTO downloads (title, description, file_url, file_size, version, category, active) VALUES 
('Silkroad Client', 'Latest game client with all updates', 'https://example.com/client.zip', '2.5 GB', '1.0.0', 'client', 1),
('Game Patches', 'Latest patches and updates', 'https://example.com/patches.zip', '150 MB', '1.0.1', 'patches', 1),
('Server Files', 'Development server files', 'https://example.com/server.zip', '500 MB', '1.0.0', 'server', 1);

-- Default Vote Sites
IF NOT EXISTS (SELECT * FROM votes WHERE site = 'xtremetop100')
INSERT INTO votes (title, description, url, site, reward, timeout, active) VALUES 
('XtremeTop100', 'Vote for us on XtremeTop100', 'https://xtremetop100.com/vote/server', 'xtremetop100', 25, 24, 1),
('TopGameServers', 'Vote for us on TopGameServers', 'https://topgameservers.net/vote/server', 'topgameservers', 25, 24, 1),
('GameTracker', 'Vote for us on GameTracker', 'https://gametracker.com/vote/server', 'gametracker', 20, 12, 1);

-- ========================================
-- PERMISSIONS AND CONSTRAINTS
-- ========================================

-- Add foreign key constraints for user_roles if users table exists
IF EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_user_roles_users')
        ALTER TABLE user_roles ADD CONSTRAINT FK_user_roles_users 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
END

PRINT 'SRO CMS Migration completed successfully!';
PRINT 'Created tables: pages, downloads, vouchers, voucher_usage, votes, vote_logs, referrals, user_roles, settings';
PRINT 'Inserted default data for settings, pages, downloads, and vote sites';