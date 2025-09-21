-- SRO_CMS Web Tables Migration Script
-- This script adds the missing web application tables to the SRO_CMS database

USE [SRO_CMS]
GO

-- Create Roles table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Roles](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Name] [nvarchar](50) NOT NULL,
    PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED 
    (
        [Name] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    
    PRINT 'Created Roles table'
END
ELSE
    PRINT 'Roles table already exists'
GO

-- Create WebUsers table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WebUsers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[WebUsers](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [Username] [nvarchar](32) NOT NULL,
        [Email] [nvarchar](100) NOT NULL,
        [PasswordHash] [nvarchar](255) NOT NULL,
        [RoleId] [int] NOT NULL,
        [RegisteredAt] [datetime] NOT NULL,
        [LastLogin] [datetime] NULL,
        [IsBanned] [bit] NOT NULL,
        [LogTime] [time](7) NULL,
        [EmailVerified] [bit] NOT NULL,
        [VerificationToken] [nvarchar](255) NULL,
        [VerificationTokenExpiry] [datetime] NULL,
        [ResetPasswordToken] [nvarchar](255) NULL,
        [ResetPasswordTokenExpiry] [datetime] NULL,
    PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED 
    (
        [Username] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
    UNIQUE NONCLUSTERED 
    (
        [Email] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    
    PRINT 'Created WebUsers table'
END
ELSE
    PRINT 'WebUsers table already exists'
GO

-- Create LoginLogs table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LoginLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[LoginLogs](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [UserId] [int] NOT NULL,
        [IPAddress] [nvarchar](45) NOT NULL,
        [LoggedInAt] [datetime] NOT NULL,
    PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    
    PRINT 'Created LoginLogs table'
END
ELSE
    PRINT 'LoginLogs table already exists'
GO

-- Create SupportTickets table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SupportTickets]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[SupportTickets](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [UserId] [int] NOT NULL,
        [Subject] [nvarchar](150) NOT NULL,
        [Status] [nvarchar](20) NOT NULL,
        [Priority] [nvarchar](20) NOT NULL,
        [CreatedAt] [datetime] NOT NULL,
        [ClosedAt] [datetime] NULL,
    PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    
    PRINT 'Created SupportTickets table'
END
ELSE
    PRINT 'SupportTickets table already exists'
GO

-- Create TicketMessages table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TicketMessages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TicketMessages](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [TicketId] [int] NOT NULL,
        [SenderId] [int] NOT NULL,
        [Message] [nvarchar](max) NOT NULL,
        [SentAt] [datetime] NOT NULL,
        [IsFromStaff] [bit] NOT NULL,
    PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
    
    PRINT 'Created TicketMessages table'
END
ELSE
    PRINT 'TicketMessages table already exists'
GO

-- Create UserSessions table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSessions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[UserSessions](
        [Id] [int] IDENTITY(1,1) NOT NULL,
        [UserId] [int] NOT NULL,
        [SessionToken] [nvarchar](255) NOT NULL,
        [CreatedAt] [datetime] NOT NULL,
        [ExpiresAt] [datetime] NOT NULL,
    PRIMARY KEY CLUSTERED 
    (
        [Id] ASC
    )WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
    ) ON [PRIMARY]
    
    PRINT 'Created UserSessions table'
END
ELSE
    PRINT 'UserSessions table already exists'
GO

-- Add default constraints
ALTER TABLE [dbo].[LoginLogs] ADD DEFAULT (getdate()) FOR [LoggedInAt]
GO
ALTER TABLE [dbo].[SupportTickets] ADD DEFAULT ('open') FOR [Status]
GO
ALTER TABLE [dbo].[SupportTickets] ADD DEFAULT ('normal') FOR [Priority]
GO
ALTER TABLE [dbo].[SupportTickets] ADD DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[TicketMessages] ADD DEFAULT (getdate()) FOR [SentAt]
GO
ALTER TABLE [dbo].[TicketMessages] ADD DEFAULT ((0)) FOR [IsFromStaff]
GO
ALTER TABLE [dbo].[UserSessions] ADD DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[WebUsers] ADD DEFAULT (getdate()) FOR [RegisteredAt]
GO
ALTER TABLE [dbo].[WebUsers] ADD DEFAULT ((0)) FOR [IsBanned]
GO
ALTER TABLE [dbo].[WebUsers] ADD DEFAULT ((0)) FOR [EmailVerified]
GO

-- Add foreign key constraints (only if they don't exist)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_LoginLogs_WebUsers]') AND parent_object_id = OBJECT_ID(N'[dbo].[LoginLogs]'))
BEGIN
    ALTER TABLE [dbo].[LoginLogs] WITH CHECK ADD CONSTRAINT [FK_LoginLogs_WebUsers] FOREIGN KEY([UserId])
    REFERENCES [dbo].[WebUsers] ([Id])
    PRINT 'Added FK_LoginLogs_WebUsers constraint'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_SupportTickets_WebUsers]') AND parent_object_id = OBJECT_ID(N'[dbo].[SupportTickets]'))
BEGIN
    ALTER TABLE [dbo].[SupportTickets] WITH CHECK ADD CONSTRAINT [FK_SupportTickets_WebUsers] FOREIGN KEY([UserId])
    REFERENCES [dbo].[WebUsers] ([Id])
    PRINT 'Added FK_SupportTickets_WebUsers constraint'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TicketMessages_WebUsers]') AND parent_object_id = OBJECT_ID(N'[dbo].[TicketMessages]'))
BEGIN
    ALTER TABLE [dbo].[TicketMessages] WITH CHECK ADD CONSTRAINT [FK_TicketMessages_WebUsers] FOREIGN KEY([SenderId])
    REFERENCES [dbo].[WebUsers] ([Id])
    PRINT 'Added FK_TicketMessages_WebUsers constraint'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_TicketMessages_SupportTickets]') AND parent_object_id = OBJECT_ID(N'[dbo].[TicketMessages]'))
BEGIN
    ALTER TABLE [dbo].[TicketMessages] WITH CHECK ADD CONSTRAINT [FK_TicketMessages_SupportTickets] FOREIGN KEY([TicketId])
    REFERENCES [dbo].[SupportTickets] ([Id])
    PRINT 'Added FK_TicketMessages_SupportTickets constraint'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_UserSessions_WebUsers]') AND parent_object_id = OBJECT_ID(N'[dbo].[UserSessions]'))
BEGIN
    ALTER TABLE [dbo].[UserSessions] WITH CHECK ADD CONSTRAINT [FK_UserSessions_WebUsers] FOREIGN KEY([UserId])
    REFERENCES [dbo].[WebUsers] ([Id])
    PRINT 'Added FK_UserSessions_WebUsers constraint'
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_WebUsers_Roles]') AND parent_object_id = OBJECT_ID(N'[dbo].[WebUsers]'))
BEGIN
    ALTER TABLE [dbo].[WebUsers] WITH CHECK ADD CONSTRAINT [FK_WebUsers_Roles] FOREIGN KEY([RoleId])
    REFERENCES [dbo].[Roles] ([Id])
    PRINT 'Added FK_WebUsers_Roles constraint'
END
GO

-- Insert default roles if they don't exist
IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [Name] = 'admin')
BEGIN
    INSERT INTO [dbo].[Roles] ([Name]) VALUES ('admin')
    PRINT 'Inserted admin role'
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [Name] = 'user')
BEGIN
    INSERT INTO [dbo].[Roles] ([Name]) VALUES ('user')
    PRINT 'Inserted user role'
END
GO

IF NOT EXISTS (SELECT * FROM [dbo].[Roles] WHERE [Name] = 'moderator')
BEGIN
    INSERT INTO [dbo].[Roles] ([Name]) VALUES ('moderator')
    PRINT 'Inserted moderator role'
END
GO

PRINT 'Web tables migration completed successfully!'
GO