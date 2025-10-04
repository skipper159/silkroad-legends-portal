-- Migration: Create account deletion verification system
-- Date: 2025-10-01
-- Description: Add email verification for game account deletion to prevent accidental deletions

USE sro_cms;
GO

-- Create account_deletion_tokens table
CREATE TABLE account_deletion_tokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    gameaccount_jid INT NOT NULL,
    token NVARCHAR(255) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL,
    gameaccount_name NVARCHAR(50) NOT NULL,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    used_at DATETIME2 NULL,
    
    -- Foreign key constraints
    CONSTRAINT FK_account_deletion_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Index for performance
    INDEX IX_account_deletion_tokens_token (token),
    INDEX IX_account_deletion_tokens_user_id (user_id),
    INDEX IX_account_deletion_tokens_expires_at (expires_at)
);
GO

-- Add comments for documentation
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Stores email verification tokens for game account deletion requests',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'account_deletion_tokens';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Unique verification token sent via email',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'account_deletion_tokens',
    @level2type = N'COLUMN', @level2name = N'token';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Game account JID to be deleted',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'account_deletion_tokens',
    @level2type = N'COLUMN', @level2name = N'gameaccount_jid';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'When this token expires (typically 1 hour)',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'account_deletion_tokens',
    @level2type = N'COLUMN', @level2name = N'expires_at';

GO

PRINT 'Migration 002_account_deletion_verification.sql completed successfully';