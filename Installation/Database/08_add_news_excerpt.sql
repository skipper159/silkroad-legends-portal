USE SRO_CMS;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[news]') AND name = 'excerpt')
BEGIN
    ALTER TABLE [dbo].[news] ADD [excerpt] nvarchar(500) NULL;
    PRINT '✅ Added [excerpt] column to [news] table';
END
ELSE
BEGIN
    PRINT '⚠️ Column [excerpt] already exists in [news] table';
END
GO
