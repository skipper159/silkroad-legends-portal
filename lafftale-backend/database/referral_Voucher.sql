-- ===============================================
-- VOUCHERS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[vouchers]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[vouchers] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [code] nvarchar(255) NOT NULL,
        [type] nvarchar(50) NOT NULL DEFAULT 'silk',
        [value] int NOT NULL,
        [max_uses] int NOT NULL DEFAULT 1,
        [used_count] int NOT NULL DEFAULT 0,
        [active] bit NOT NULL DEFAULT 1,
        [expires_at] datetime2(0) NULL,
        [description] nvarchar(500) NULL,
        [created_by] bigint NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_vouchers] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_vouchers_creator] FOREIGN KEY ([created_by]) REFERENCES [users] ([id]) ON DELETE SET NULL
    );
    
    -- Indizes für vouchers
    CREATE UNIQUE INDEX [vouchers_code_unique] ON [vouchers] ([code]);
    CREATE INDEX [idx_vouchers_active] ON [vouchers] ([active]);
    CREATE INDEX [idx_vouchers_expires] ON [vouchers] ([expires_at]);
    CREATE INDEX [idx_vouchers_type] ON [vouchers] ([type]);
    
    PRINT 'Table vouchers created with indexes.';
END
GO

-- ===============================================
-- VOUCHER_LOGS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[voucher_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[voucher_logs] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [voucher_id] bigint NOT NULL,
        [jid] int NOT NULL,
        [username] nvarchar(255) NOT NULL,
        [ip] nvarchar(45) NOT NULL,
        [redeemed_at] datetime2(0) NOT NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_voucher_logs] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_voucher_logs_voucher] FOREIGN KEY ([voucher_id]) REFERENCES [vouchers] ([id]) ON DELETE CASCADE
    );
    
    -- Indizes für voucher_logs
    CREATE INDEX [idx_voucher_logs_jid] ON [voucher_logs] ([jid]);
    CREATE INDEX [idx_voucher_logs_voucher] ON [voucher_logs] ([voucher_id]);
    CREATE INDEX [idx_voucher_logs_redeemed] ON [voucher_logs] ([redeemed_at]);
    
    PRINT 'Table voucher_logs created with indexes.';
END
GO

-- ===============================================
-- REFERRALS TABLE
-- ===============================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[referrals]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[referrals] (
        [id] bigint IDENTITY(1,1) NOT NULL,
        [referrer_jid] int NOT NULL,
        [referrer_username] nvarchar(255) NOT NULL,
        [referred_jid] int NOT NULL,
        [referred_username] nvarchar(255) NOT NULL,
        [reward_points] int NOT NULL DEFAULT 0,
        [reward_silk] int NOT NULL DEFAULT 0,
        [redeemed] bit NOT NULL DEFAULT 0,
        [redeemed_at] datetime2(0) NULL,
        [created_at] datetime2(0) NULL,
        [updated_at] datetime2(0) NULL,
        CONSTRAINT [PK_referrals] PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Indizes für referrals
    CREATE INDEX [idx_referrals_referrer] ON [referrals] ([referrer_jid]);
    CREATE INDEX [idx_referrals_referred] ON [referrals] ([referred_jid]);
    CREATE INDEX [idx_referrals_redeemed] ON [referrals] ([redeemed]);
    CREATE UNIQUE INDEX [referrals_referred_unique] ON [referrals] ([referred_jid]);
    
    PRINT 'Table referrals created with indexes.';
END
GO