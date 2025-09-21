-- SQL Script to create missing tables for Node.js backend compatibility with PHP CMS features
-- Run this script in your database to add the missing tables

-- Settings table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='settings' AND xtype='U')
CREATE TABLE settings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    [key] NVARCHAR(255) NOT NULL UNIQUE,
    value NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- News table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='news' AND xtype='U')
CREATE TABLE news (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    content NVARCHAR(MAX) NOT NULL,
    excerpt NVARCHAR(500),
    published BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- User roles table (if not exists from PHP migration)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_roles' AND xtype='U')
CREATE TABLE user_roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    is_admin BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES WebUsers(Id) ON DELETE CASCADE
);

-- Pages table (for CMS pages)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pages' AND xtype='U')
CREATE TABLE pages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL UNIQUE,
    content NVARCHAR(MAX) NOT NULL,
    published BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Insert default settings
IF NOT EXISTS (SELECT * FROM settings WHERE [key] = 'site_name')
INSERT INTO settings ([key], value) VALUES ('site_name', 'Silkroad Legends Portal');

IF NOT EXISTS (SELECT * FROM settings WHERE [key] = 'site_description')
INSERT INTO settings ([key], value) VALUES ('site_description', 'Official Silkroad Online Private Server');

IF NOT EXISTS (SELECT * FROM settings WHERE [key] = 'maintenance_mode')
INSERT INTO settings ([key], value) VALUES ('maintenance_mode', 'false');

IF NOT EXISTS (SELECT * FROM settings WHERE [key] = 'registration_enabled')
INSERT INTO settings ([key], value) VALUES ('registration_enabled', 'true');

IF NOT EXISTS (SELECT * FROM settings WHERE [key] = 'max_accounts_per_ip')
INSERT INTO settings ([key], value) VALUES ('max_accounts_per_ip', '3');

-- Ensure Roles table exists with basic roles
IF NOT EXISTS (SELECT * FROM Roles WHERE Name = 'Admin')
INSERT INTO Roles (Name, Description) VALUES ('Admin', 'Administrator');

IF NOT EXISTS (SELECT * FROM Roles WHERE Name = 'User')
INSERT INTO Roles (Name, Description) VALUES ('User', 'Regular User');

IF NOT EXISTS (SELECT * FROM Roles WHERE Name = 'Moderator')
INSERT INTO Roles (Name, Description) VALUES ('Moderator', 'Moderator');

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_settings_key')
CREATE INDEX IX_settings_key ON settings([key]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_news_slug')
CREATE INDEX IX_news_slug ON news(slug);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_news_published')
CREATE INDEX IX_news_published ON news(published);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_user_roles_user_id')
CREATE INDEX IX_user_roles_user_id ON user_roles(user_id);

-- Update existing WebUsers table if needed (add missing columns)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WebUsers' AND COLUMN_NAME = 'LastLogin')
ALTER TABLE WebUsers ADD LastLogin DATETIME2;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WebUsers' AND COLUMN_NAME = 'RegisteredAt')
ALTER TABLE WebUsers ADD RegisteredAt DATETIME2 DEFAULT GETDATE();

PRINT 'Database schema updated successfully!';