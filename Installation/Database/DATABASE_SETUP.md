# Silkroad Legends Portal - Database Setup Guide

## 📋 Overview

This directory contains the complete SQL scripts for setting up the **SRO_CMS** database for the Silkroad Legends Portal.

The scripts have been created based on the production database and contain all necessary tables and seed data.

## 🗂️ Script Order

The scripts must be executed in this **exact order**:

### 1. `01_create_database.sql`

- Creates the `SRO_CMS` database
- Run this script **first**
- Safe to run multiple times (IF NOT EXISTS check)

### 2. `02_create_tables.sql`

- Creates **all** tables for the portal
- Contains 39 tables with complete definitions
- Run this script **after** creating the database

### 3. `03_seed_data.sql`

- Inserts initial configuration data
- Contains default settings and sample data
- Run this script **last**

## 📊 Database Structure

The database contains the following table categories:

- Default settings (site name, rates, toggles)
- Referral reward tiers
- Sample pages (About, Rules, Downloads, Guide)
- Example vote sites
- Footer structure

---

### 🔐 Users & Authentication

- `users` - Portal users (linked to game accounts)
- `user_roles` - Role-based access control
- `user_gameaccounts` - Portal ↔ Game Account linking
- `sessions` - Session storage
- `password_reset_tokens` - Password reset functionality
- `personal_access_tokens` - API Tokens

### 📰 Content Management

- `news` - Server announcements and updates
- `pages` - Static content pages (About, Rules, etc.)
- `downloads` - Client & Patch downloads
- `settings` - Key-Value configuration store

### 🎁 Vote & Donation System

- `votes` - Vote site configuration
- `vote_logs` - User vote history
- `donate_logs` - Donation transaction history
- `vouchers` - Redeemable voucher codes
- `voucher_logs` - Voucher redemption history

### 👥 Referral System

- `referrals` - Referral tracking with anti-cheat features
- `referral_settings` - Referral system configuration
- `referral_rewards` - Tier-based rewards
- `referral_redemption_log` - Reward redemptions
- `delayed_reward_logs` - Delayed reward processing

### 🛡️ Anti-Cheat & Security

- `referral_anticheat_logs` - Anti-cheat logging
- `behavioral_fingerprints` - Behavioral fingerprinting
- `known_vpn_ips` - VPN detection database

### 🎫 Support System

- `SupportTickets` - Support tickets
- `TicketMessages` - Ticket messages/replies

### 📊 Statistics & Tracking

- `silk_account_cache` - Silk balance caching
- `silk_server_stats` - Server-wide Silk statistics
- `players_online_history` - Online player count history

### 🔧 Framework & System

- `cache` - Cache storage
- `cache_locks` - Cache locking mechanism
- `jobs` - Job queue
- `job_batches` - Job batch tracking
- `failed_jobs` - Failed jobs
- `migrations` - Migration tracking
- `cron_job_settings` - Scheduled task configuration
- `account_deletion_tokens` - Account deletion requests

### 🎨 Frontend Configuration

- `footer_sections` - Footer navigation sections
- `footer_links` - Footer navigation links
- `footer_hardcoded_links` - Hardcoded footer links

---

## 🔍 Key Features

### Referral System with Anti-Cheat

The referral system is the core component and includes extensive anti-cheat features:

- **Behavioral Fingerprinting**: Detects suspicious behavior patterns
- **VPN Detection**: Prevents abuse through VPN usage
- **Delayed Rewards**: Rewards are delayed and validated
- **Extensive Logging**: All actions are logged for analysis

### Silk Management

- **Caching**: Silk balances are cached for performance
- **Statistics**: Server-wide Silk statistics for analytics
- **Donation Tracking**: Complete donation history

### Support System

- **Ticket System**: Professional support ticket system
- **Staff Messaging**: Distinction between user and staff messages
- **Status Tracking**: Ticket status and priority management

---

## 📝 Seed Data

The `03_seed_data.sql` script inserts the following initial data:

### Default Settings (17 entries)

- Site Information (Name, Logo, Description)
- Server Status (IP, Port, Maintenance Mode)
- Feature Toggles (Registration, Vote, Donation, Referral)
- Rates & Limits (Silk, EXP, Gold, Item Rates)
- Cache Settings (Ranking Cache Duration)

### Referral Configuration

- 4 Referral Settings
- 4 Reward Tiers (100, 250, 500, 1000 points)

### Sample Content

- 4 Static Pages (About, Rules, Downloads, Guide)
- 3 Vote Sites (XtremeTop100, GTop100, MMOTop)
- Footer structure with links
- 3 Cron Job settings

---

## ⚠️ Important Notes

### Foreign Key Constraints

The scripts use foreign keys for data integrity:

- `CASCADE` for dependent data (deleted when parent is deleted)
- `SET NULL` for optional references
- `NO ACTION` for protected references

### Indexes

All critical fields are indexed:

- Primary Keys (automatic)
- Foreign Keys (for performance)
- Unique Constraints (for data integrity)
- Frequently used filter fields

### Data Types

- `bigint` for IDs (supports large numbers)
- `nvarchar` for Unicode text (international characters)
- `datetime` / `datetime2` for timestamps
- `bit` for boolean values
- `decimal` for monetary values

---

## 🔄 Re-Installation

All scripts can safely be run multiple times:

- `IF NOT EXISTS` checks prevent duplicates
- Existing tables are **not** overwritten
- Seed data is only inserted if it doesn't exist

---

## 🚀 Quick Start

```sql
-- 1. Create Database
USE master;
GO
-- Run 01_create_database.sql

-- 2. Create Tables
USE SRO_CMS;
GO
-- Run 02_create_tables.sql

-- 3. Insert Seed Data
USE SRO_CMS;
GO
-- Run 03_seed_data.sql
```

---

## 📊 Table Statistics

- **Total**: 39 Tables
- **Core System**: 12 Tables
- **Referral System**: 7 Tables
- **Framework**: 7 Tables
- **Content & Config**: 8 Tables
- **Support & Tracking**: 5 Tables

---

## 🔗 Database Connections

The backend connects to **multiple databases**:

```
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                     │
└─────────────────┬────────────────────┬──────────────────┘
                  │                    │
     ┌────────────▼────────────┐ ┌────▼────────────────┐
     │       SRO_CMS           │ │  Silkroad Databases │
     │   (Web Portal Data)     │ │                     │
     │                         │ │  - SRO_ACCOUNT      │
     │  - users, news, pages   │ │  - SRO_SHARD        │
     │  - votes, donations     │ │  - SRO_LOG          │
     │  - vouchers, referrals  │ │  - SRO_NODEJS       │
     │  - support tickets      │ │                     │
     └─────────────────────────┘ └─────────────────────┘
```

### Environment Configuration

In your `lafftale-backend/.env`:

```env
# SRO_CMS (Web Portal)
DB_VPLUS_SERVER=localhost
DB_VPLUS_DATABASE=SRO_CMS
DB_VPLUS_USER=sa
DB_VPLUS_PASSWORD=your-password

# Game Account Database
DB_ACCOUNT_DATABASE=SRO_ACCOUNT

# Game Shard Database
DB_GAME_DATABASE=SRO_SHARD

# Game Log Database
DB_LOG_DATABASE=SRO_LOG

# Character Database
DB_CHAR_DATABASE=SRO_SHARD

# NodeJS Database (for specific features)
DB_NODEJS_DATABASE=SRO_NODEJS
```

---

## 🔒 Security Notes

> ⚠️ **Important**: Seed data does NOT contain user credentials.

- Create admin user via registration process
- Grant admin role via direct SQL:
  ```sql
  INSERT INTO user_roles (user_id, role, granted_by, granted_at)
  VALUES (1, 'admin', NULL, GETDATE());
  ```

---

## 📁 File Reference

```
Installation/Database/
├── 01_create_database.sql    # Step 1: Creates SRO_CMS database
├── 02_create_tables.sql      # Step 2: Creates all 39 tables
├── 03_seed_data.sql          # Step 3: Inserts sample data
└── DATABASE_SETUP.md         # This documentation
```

---

## ❓ Troubleshooting

### "Database already exists"

Safe to ignore - scripts are idempotent (can be run multiple times).

### "Foreign key constraint" errors

Run scripts in correct order: 01 → 02 → 03

### Backend cannot connect

1. Verify SQL Server is running
2. Check Firewall (Port 1433 must be open)
3. Verify credentials in `.env`
4. Ensure TCP/IP is enabled in SQL Server Configuration Manager

### Missing Tables

Ensure `02_create_tables.sql` completed successfully. You should have 39 tables.

---

## ✅ Successful Installation

After successful installation, you should see output similar to:

### After 01_create_database.sql:

```
✅ Database SRO_CMS created successfully.
============================================
Database SRO_CMS is ready!
Next step: Run 02_create_tables.sql
============================================
```

### After 02_create_tables.sql:

```
✅ All tables created successfully!
============================================
Core Tables:
  - users, user_roles, user_gameaccounts
  - news, pages, downloads
  - settings
...
Next step: Run 03_seed_data.sql for sample data
============================================
```

### After 03_seed_data.sql:

```
✅ Seed data inserted successfully!
============================================
Inserted:
  - 17 default settings
  - 4 referral settings + 4 reward tiers
  - 4 sample pages
  - 3 sample vote sites
  - Footer structure with links
  - Cron job defaults

Your database is ready to use!
============================================
```

The database is now ready for use with the Silkroad Legends Portal!

---

## 📖 Related Documentation

- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Full deployment guide
- [lafftale-backend README](../../lafftale-backend/README.md) - Backend documentation
- [INSTALL.md](../INSTALL.md) - Complete installation guide
