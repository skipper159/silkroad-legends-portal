-- Fix Foreign Key constraint for SupportTickets to use users table instead of WebUsers
-- This script corrects the user reference in the ticket system and fixes data type mismatches

USE SRO_CMS;
GO

-- Check current data types
PRINT 'Checking current data types...'
SELECT 'users.id' as TableColumn, DATA_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'id'

SELECT 'SupportTickets.UserId' as TableColumn, DATA_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'SupportTickets' AND COLUMN_NAME = 'UserId'

SELECT 'TicketMessages.SenderId' as TableColumn, DATA_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'TicketMessages' AND COLUMN_NAME = 'SenderId'

-- Drop existing foreign key constraints if they exist
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_SupportTickets_WebUsers]') AND parent_object_id = OBJECT_ID(N'[dbo].[SupportTickets]'))
BEGIN
    ALTER TABLE [dbo].[SupportTickets] DROP CONSTRAINT [FK_SupportTickets_WebUsers]
    PRINT 'Dropped FK_SupportTickets_WebUsers constraint'
END

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TicketMessages_WebUsers]') AND parent_object_id = OBJECT_ID(N'[dbo].[TicketMessages]'))
BEGIN
    ALTER TABLE [dbo].[TicketMessages] DROP CONSTRAINT [FK_TicketMessages_WebUsers]
    PRINT 'Dropped FK_TicketMessages_WebUsers constraint'
END

-- Fix data types to match users.id (assuming BIGINT)
-- First, alter SupportTickets.UserId to BIGINT
PRINT 'Updating SupportTickets.UserId data type to BIGINT...'
ALTER TABLE [dbo].[SupportTickets] ALTER COLUMN [UserId] BIGINT NOT NULL

-- Then, alter TicketMessages.SenderId to BIGINT  
PRINT 'Updating TicketMessages.SenderId data type to BIGINT...'
ALTER TABLE [dbo].[TicketMessages] ALTER COLUMN [SenderId] BIGINT NOT NULL

-- Add new foreign key constraints to reference the users table
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_SupportTickets_Users]') AND parent_object_id = OBJECT_ID(N'[dbo].[SupportTickets]'))
BEGIN
    ALTER TABLE [dbo].[SupportTickets] WITH CHECK ADD CONSTRAINT [FK_SupportTickets_Users] FOREIGN KEY([UserId])
    REFERENCES [dbo].[users] ([id])
    PRINT 'Added FK_SupportTickets_Users constraint'
END

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TicketMessages_Users]') AND parent_object_id = OBJECT_ID(N'[dbo].[TicketMessages]'))
BEGIN
    ALTER TABLE [dbo].[TicketMessages] WITH CHECK ADD CONSTRAINT [FK_TicketMessages_Users] FOREIGN KEY([SenderId])
    REFERENCES [dbo].[users] ([id])
    PRINT 'Added FK_TicketMessages_Users constraint'
END

PRINT 'Foreign Key constraints updated successfully with correct data types!'