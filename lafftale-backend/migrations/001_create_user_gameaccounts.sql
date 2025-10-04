-- Migration: Create user_gameaccounts table for multi-account support
-- Date: 2025-10-01
-- Description: Replace single jid field in users table with many-to-many relationship

USE sro_cms;
GO

-- Create user_gameaccounts mapping table
CREATE TABLE user_gameaccounts (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    gameaccount_jid INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    is_primary BIT NOT NULL DEFAULT 0,
    
    -- Foreign key constraints
    CONSTRAINT FK_user_gameaccounts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate user-gameaccount pairs
    CONSTRAINT UK_user_gameaccounts_user_gameaccount UNIQUE (user_id, gameaccount_jid),
    
    -- Index for performance on user_id lookups
    INDEX IX_user_gameaccounts_user_id (user_id),
    INDEX IX_user_gameaccounts_gameaccount_jid (gameaccount_jid)
);
GO

-- Migrate existing user.jid relationships into new table
INSERT INTO user_gameaccounts (user_id, gameaccount_jid, is_primary, created_at)
SELECT 
    id as user_id,
    jid as gameaccount_jid,
    1 as is_primary,  -- Mark existing accounts as primary
    GETDATE() as created_at
FROM users 
WHERE jid IS NOT NULL AND jid > 0;
GO

-- Add comments for documentation
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Maps web users to their game accounts. Supports multiple game accounts per user.',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'user_gameaccounts';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Web user ID from users table',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'user_gameaccounts',
    @level2type = N'COLUMN', @level2name = N'user_id';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Game account JID from SILKROAD_R_ACCOUNT.TB_User',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'user_gameaccounts',
    @level2type = N'COLUMN', @level2name = N'gameaccount_jid';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Whether this is the users primary/default game account',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'user_gameaccounts',
    @level2type = N'COLUMN', @level2name = N'is_primary';

GO

PRINT 'Migration 001_create_user_gameaccounts.sql completed successfully';