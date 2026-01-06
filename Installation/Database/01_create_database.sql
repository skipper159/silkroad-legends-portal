-- ============================================
-- SILKROAD LEGENDS PORTAL - DATABASE SETUP
-- ============================================
-- Part 1: Create Database
-- Run this script FIRST to create the SRO_CMS database
-- ============================================

USE master;
GO

-- Create the CMS database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SRO_CMS')
BEGIN
    CREATE DATABASE SRO_CMS;
    PRINT '✅ Database SRO_CMS created successfully.';
END
ELSE
BEGIN
    PRINT '⚠️ Database SRO_CMS already exists.';
END
GO

-- Switch to the new database
USE SRO_CMS;
GO

PRINT '';
PRINT '============================================';
PRINT 'Database SRO_CMS is ready!';
PRINT 'Next step: Run 02_create_tables.sql';
PRINT '============================================';
GO
