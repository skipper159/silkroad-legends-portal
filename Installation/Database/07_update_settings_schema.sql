USE SRO_CMS;
GO

-- Ensure 'settings' table exists and has correct columns
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND type in (N'U'))
BEGIN
    PRINT 'Checking [settings] table schema...';

    -- Check for created_at
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND name = 'created_at')
    BEGIN
        ALTER TABLE [dbo].[settings] ADD [created_at] datetime2(0) NULL;
        PRINT '✅ Added [created_at] column to [settings]';
    END

    -- Check for updated_at
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND name = 'updated_at')
    BEGIN
        ALTER TABLE [dbo].[settings] ADD [updated_at] datetime2(0) NULL;
        PRINT '✅ Added [updated_at] column to [settings]';
    END
    
    -- Check for description (optional but good to have)
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[settings]') AND name = 'description')
    BEGIN
        ALTER TABLE [dbo].[settings] ADD [description] nvarchar(500) NULL;
        PRINT '✅ Added [description] column to [settings]';
    END

    PRINT 'Schema check complete.';
END
ELSE
BEGIN
    PRINT '⚠️ Table [settings] does not exist! Please run 02_create_tables.sql first.';
END
GO
