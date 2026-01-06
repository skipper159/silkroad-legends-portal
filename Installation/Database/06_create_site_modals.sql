-- ============================================
-- SILKROAD LEGENDS PORTAL - DATABASE UPDATE
-- ============================================
-- Part 6: Create Site Modals Table
-- For managing dynamic event popups/modals via Admin Panel
-- ============================================

USE SRO_CMS;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[site_modals]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[site_modals] (
        [id] int IDENTITY(1,1) NOT NULL,
        [title] nvarchar(255) NOT NULL,
        [content] nvarchar(MAX) NULL,
        [image_url] nvarchar(500) NULL,
        [button_text] nvarchar(100) NULL,
        [button_url] nvarchar(500) NULL,
        [start_date] datetime2(0) NULL,
        [end_date] datetime2(0) NULL,
        [is_active] bit NOT NULL DEFAULT 1,
        [priority] int NOT NULL DEFAULT 0,
        [show_once] bit NOT NULL DEFAULT 1,
        [created_at] datetime2(0) DEFAULT GETDATE(),
        [updated_at] datetime2(0) DEFAULT GETDATE(),
        CONSTRAINT [PK_site_modals] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE INDEX [idx_site_modals_active] ON [site_modals] ([is_active]);
    CREATE INDEX [idx_site_modals_dates] ON [site_modals] ([start_date], [end_date]);
    
    PRINT '✅ Table [site_modals] created';
END
ELSE
BEGIN
    PRINT 'ℹ️ Table [site_modals] already exists';
END
GO
