-- ============================================
-- SILKROAD LEGENDS PORTAL - DATABASE SETUP
-- ============================================
-- Part 3: Sample/Seed Data
-- Run this script AFTER 02_create_tables.sql
-- This creates example data for testing
-- ============================================

USE SRO_CMS;
GO

-- ============================================
-- DEFAULT SETTINGS
-- Essential configuration for the portal
-- ============================================
IF NOT EXISTS (SELECT * FROM [settings] WHERE [key] = 'site_name')
BEGIN
    INSERT INTO [settings] ([key], [value], [type], [description], [created_at], [updated_at]) VALUES
    -- Site Information
    ('site_name', 'Silkroad Legends', 'string', 'Website display name', GETDATE(), GETDATE()),
    ('site_description', 'The best Silkroad Online private server experience', 'string', 'Meta description for SEO', GETDATE(), GETDATE()),
    ('site_logo', '/images/logo.png', 'string', 'Path to site logo', GETDATE(), GETDATE()),
    
    -- Server Status
    ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', GETDATE(), GETDATE()),
    ('server_ip', '127.0.0.1', 'string', 'Game server IP address', GETDATE(), GETDATE()),
    ('server_port', '15779', 'string', 'Game server port', GETDATE(), GETDATE()),
    
    -- Feature Toggles
    ('registration_enabled', 'true', 'boolean', 'Allow new user registrations', GETDATE(), GETDATE()),
    ('vote_system_enabled', 'true', 'boolean', 'Enable voting system', GETDATE(), GETDATE()),
    ('donation_system_enabled', 'true', 'boolean', 'Enable donation system', GETDATE(), GETDATE()),
    ('referral_system_enabled', 'true', 'boolean', 'Enable referral program', GETDATE(), GETDATE()),
    
    -- Rates & Limits
    ('silk_rate', '100', 'integer', 'Silk per 1 USD', GETDATE(), GETDATE()),
    ('exp_rate', '10', 'integer', 'Experience rate multiplier', GETDATE(), GETDATE()),
    ('gold_rate', '5', 'integer', 'Gold drop rate multiplier', GETDATE(), GETDATE()),
    ('item_rate', '3', 'integer', 'Item drop rate multiplier', GETDATE(), GETDATE()),
    ('max_characters_per_account', '4', 'integer', 'Max characters per account', GETDATE(), GETDATE()),
    
    -- Cache Settings
    ('cache_rankings_minutes', '30', 'integer', 'Minutes to cache ranking data', GETDATE(), GETDATE()),
    ('ranking_player_limit', '100', 'integer', 'Max players shown in rankings', GETDATE(), GETDATE()),
    ('ranking_guild_limit', '50', 'integer', 'Max guilds shown in rankings', GETDATE(), GETDATE());
    
    PRINT '✅ Default settings inserted';
END
GO

-- ============================================
-- REFERRAL SETTINGS
-- Configuration for the referral program
-- ============================================
IF NOT EXISTS (SELECT * FROM [referral_settings] WHERE [setting_key] = 'points_per_referral')
BEGIN
    INSERT INTO [referral_settings] ([setting_key], [setting_value], [description]) VALUES
    ('points_per_referral', '100', 'Points awarded per successful referral'),
    ('minimum_redeem_points', '100', 'Minimum points required for redemption'),
    ('silk_per_point', '1', 'Silk awarded per point when redeeming'),
    ('referral_enabled', 'true', 'Enable/disable referral system');
    
    PRINT '✅ Referral settings inserted';
END
GO

-- ============================================
-- REFERRAL REWARDS
-- Tiered reward system
-- ============================================
IF NOT EXISTS (SELECT * FROM [referral_rewards] WHERE [points_required] = 100)
BEGIN
    INSERT INTO [referral_rewards] ([points_required], [silk_reward], [item_id], [description], [is_active]) VALUES
    (100, 100, NULL, '100 Silk for 100 points', 1),
    (250, 300, NULL, '300 Silk for 250 points (Bonus!)', 1),
    (500, 750, NULL, '750 Silk for 500 points (Super Bonus!)', 1),
    (1000, 2000, NULL, '2000 Silk for 1000 points (Mega Bonus!)', 1);
    
    PRINT '✅ Referral rewards inserted';
END
GO

-- ============================================
-- SAMPLE PAGES
-- Static content pages
-- ============================================
IF NOT EXISTS (SELECT * FROM [pages] WHERE [slug] = 'about')
BEGIN
    INSERT INTO [pages] ([title], [slug], [content], [meta_title], [meta_description], [active], [in_menu], [menu_order], [created_at], [updated_at]) VALUES
    ('About Us', 'about', '<h1>Welcome to Silkroad Legends</h1><p>Experience the ultimate Silkroad Online adventure with our custom features, active community, and dedicated staff.</p><h2>Our Features</h2><ul><li>Custom rates for balanced gameplay</li><li>Active development and updates</li><li>Fair play environment</li><li>Dedicated support team</li></ul>', 'About Silkroad Legends', 'Learn more about our Silkroad Online private server', 1, 1, 1, GETDATE(), GETDATE()),
    
    ('Rules', 'rules', '<h1>Server Rules</h1><p>Please follow these rules to ensure a fair gaming experience.</p><h2>General Rules</h2><ol><li>No cheating, hacking, or exploiting bugs</li><li>Respect other players and staff</li><li>No account sharing</li><li>No real money trading outside official channels</li><li>English only in world chat</li></ol><h2>Punishments</h2><p>Violations may result in temporary or permanent bans.</p>', 'Server Rules', 'Rules and guidelines for our Silkroad server', 1, 1, 2, GETDATE(), GETDATE()),
    
    ('Downloads', 'downloads', '<h1>Download Game Client</h1><p>Get started by downloading our game client.</p>', 'Download Client', 'Download the Silkroad Legends game client', 1, 1, 3, GETDATE(), GETDATE()),
    
    ('Guide', 'guide', '<h1>Beginner Guide</h1><p>New to Silkroad? Start here to learn the basics.</p><h2>Getting Started</h2><ol><li>Download and install the client</li><li>Create an account on our website</li><li>Launch the game and log in</li><li>Create your first character</li></ol>', 'Beginner Guide', 'Getting started with Silkroad Legends', 1, 1, 4, GETDATE(), GETDATE());
    
    PRINT '✅ Sample pages inserted';
END
GO

-- ============================================
-- SAMPLE VOTE SITES
-- Example voting configuration
-- ============================================
IF NOT EXISTS (SELECT * FROM [votes] WHERE [site] = 'xtremetop100')
BEGIN
    INSERT INTO [votes] ([site], [title], [url], [reward_points], [reward_silk], [cooldown_hours], [active], [description], [sort_order], [created_at], [updated_at]) VALUES
    ('xtremetop100', 'XtremeTop100', 'https://xtremetop100.com/in.php?site=YOUR_ID', 10, 0, 12, 1, 'Vote for us on XtremeTop100', 1, GETDATE(), GETDATE()),
    ('gtop100', 'GTop100', 'https://gtop100.com/topsites/Silkroad/YOUR_ID', 10, 0, 12, 1, 'Vote for us on GTop100', 2, GETDATE(), GETDATE()),
    ('mmotop', 'MMOTop', 'https://www.mmotop.eu/vote/YOUR_ID', 15, 0, 24, 1, 'Vote for us on MMOTop', 3, GETDATE(), GETDATE());
    
    PRINT '✅ Sample vote sites inserted';
END
GO

-- ============================================
-- SAMPLE NEWS
-- Example news articles
-- ============================================
-- Note: Requires a user to exist first, skip if no users
IF EXISTS (SELECT TOP 1 id FROM [users])
BEGIN
    DECLARE @author_id bigint = (SELECT TOP 1 id FROM [users]);
    
    IF NOT EXISTS (SELECT * FROM [news] WHERE [slug] = 'welcome')
    BEGIN
        INSERT INTO [news] ([title], [slug], [content], [category], [active], [featured], [author_id], [published_at], [created_at], [updated_at]) VALUES
        ('Welcome to Silkroad Legends', 'welcome', '<p>We are excited to announce the launch of Silkroad Legends!</p><p>Join us for an amazing adventure with:</p><ul><li>Balanced rates</li><li>Active community</li><li>Regular events</li><li>Dedicated support</li></ul><p>See you in-game!</p>', 'Announcement', 1, 1, @author_id, GETDATE(), GETDATE(), GETDATE());
        
        PRINT '✅ Sample news inserted';
    END
END
ELSE
BEGIN
    PRINT '⚠️ Skipped news insertion (no users exist yet)';
END
GO

-- ============================================
-- FOOTER SECTIONS
-- Footer navigation structure
-- ============================================
IF NOT EXISTS (SELECT * FROM [footer_sections] WHERE [title] = 'Quick Links')
BEGIN
    INSERT INTO [footer_sections] ([title], [sort_order], [active]) VALUES
    ('Quick Links', 1, 1),
    ('Community', 2, 1),
    ('Support', 3, 1);
    
    -- Insert footer links
    DECLARE @quick_links_id int = (SELECT id FROM [footer_sections] WHERE [title] = 'Quick Links');
    DECLARE @community_id int = (SELECT id FROM [footer_sections] WHERE [title] = 'Community');
    DECLARE @support_id int = (SELECT id FROM [footer_sections] WHERE [title] = 'Support');
    
    INSERT INTO [footer_links] ([section_id], [title], [url], [sort_order], [active], [open_new_tab]) VALUES
    -- Quick Links
    (@quick_links_id, 'Home', '/', 1, 1, 0),
    (@quick_links_id, 'Downloads', '/downloads', 2, 1, 0),
    (@quick_links_id, 'Rankings', '/rankings', 3, 1, 0),
    (@quick_links_id, 'Vote', '/vote', 4, 1, 0),
    -- Community
    (@community_id, 'Discord', 'https://discord.gg/YOUR_DISCORD', 1, 1, 1),
    (@community_id, 'Forum', '/forum', 2, 1, 0),
    -- Support
    (@support_id, 'FAQ', '/faq', 1, 1, 0),
    (@support_id, 'Contact', '/contact', 2, 1, 0),
    (@support_id, 'Rules', '/rules', 3, 1, 0);
    
    PRINT '✅ Footer sections and links inserted';
END
GO

-- ============================================
-- CRON JOB SETTINGS
-- Default scheduled tasks
-- ============================================
IF NOT EXISTS (SELECT * FROM [cron_job_settings] WHERE [job_name] = 'players_online_collector')
BEGIN
    INSERT INTO [cron_job_settings] ([job_name], [schedule], [is_active]) VALUES
    ('players_online_collector', '*/1 * * * *', 1),
    ('clean_expired_votes', '0 0 * * *', 1),
    ('clean_expired_vouchers', '0 1 * * *', 1);
    
    PRINT '✅ Cron job settings inserted';
END
GO

-- ============================================
-- COMPLETE!
-- ============================================
PRINT '';
PRINT '============================================';
PRINT '✅ Seed data inserted successfully!';
PRINT '============================================';
PRINT '';
PRINT 'Inserted:';
PRINT '  - 17 default settings';
PRINT '  - 4 referral settings + 4 reward tiers';
PRINT '  - 4 sample pages';
PRINT '  - 3 sample vote sites';
PRINT '  - Footer structure with links';
PRINT '  - Cron job defaults';
PRINT '';
PRINT 'Your database is ready to use!';
PRINT '============================================';
GO
