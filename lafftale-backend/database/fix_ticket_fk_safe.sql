-- Safe version: Fix Foreign Key constraint with data type correction
-- This script includes safety checks for existing data

USE SRO_CMS;
GO

-- Step 1: Check if there are existing tickets that would break the migration
PRINT 'Checking for data conflicts...'

DECLARE @ExistingTickets INT
DECLARE @ExistingMessages INT

SELECT @ExistingTickets = COUNT(*) FROM SupportTickets
SELECT @ExistingMessages = COUNT(*) FROM TicketMessages

PRINT 'Found ' + CAST(@ExistingTickets AS VARCHAR) + ' existing tickets'
PRINT 'Found ' + CAST(@ExistingMessages AS VARCHAR) + ' existing messages'

-- Step 2: Check for UserId values that don't exist in users table
IF @ExistingTickets > 0
BEGIN
    SELECT 'Orphaned SupportTickets' as Issue, COUNT(*) as Count
    FROM SupportTickets ST
    LEFT JOIN users U ON ST.UserId = U.id
    WHERE U.id IS NULL
END

IF @ExistingMessages > 0  
BEGIN
    SELECT 'Orphaned TicketMessages' as Issue, COUNT(*) as Count
    FROM TicketMessages TM
    LEFT JOIN users U ON TM.SenderId = U.id
    WHERE U.id IS NULL
END

-- Step 3: If you want to proceed despite orphaned records, 
-- you can either delete them or map them to a default user
-- For now, we'll just show the issues and let you decide

PRINT 'Please review any orphaned records above before proceeding.'
PRINT 'If there are orphaned records, you may need to:'
PRINT '1. Delete orphaned tickets/messages, OR'
PRINT '2. Create corresponding users, OR' 
PRINT '3. Map them to a default user'

-- Uncomment the lines below ONLY after resolving orphaned data:

/*
-- Drop existing foreign key constraints
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_SupportTickets_WebUsers]'))
    ALTER TABLE [dbo].[SupportTickets] DROP CONSTRAINT [FK_SupportTickets_WebUsers]

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TicketMessages_WebUsers]'))
    ALTER TABLE [dbo].[TicketMessages] DROP CONSTRAINT [FK_TicketMessages_WebUsers]

-- Update data types to match users.id  
ALTER TABLE [dbo].[SupportTickets] ALTER COLUMN [UserId] BIGINT NOT NULL
ALTER TABLE [dbo].[TicketMessages] ALTER COLUMN [SenderId] BIGINT NOT NULL

-- Add new foreign key constraints
ALTER TABLE [dbo].[SupportTickets] WITH CHECK ADD CONSTRAINT [FK_SupportTickets_Users] 
    FOREIGN KEY([UserId]) REFERENCES [dbo].[users] ([id])

ALTER TABLE [dbo].[TicketMessages] WITH CHECK ADD CONSTRAINT [FK_TicketMessages_Users] 
    FOREIGN KEY([SenderId]) REFERENCES [dbo].[users] ([id])

PRINT 'Migration completed successfully!'
*/