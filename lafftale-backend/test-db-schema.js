// test-db-schema.js - Database Schema Discovery
const { getCharDb } = require('./db');

async function discoverSchema() {
  console.log('🔍 YOLO DATABASE SCHEMA DISCOVERY 🔍\n');

  try {
    // Check available tables
    const pool = await getCharDb();
    const tablesResult = await pool.request().query(`
      SELECT name FROM sys.tables 
      WHERE name LIKE '%guild%' OR name LIKE '%Guild%' OR name LIKE '%GUILD%'
      ORDER BY name
    `);

    console.log('📋 Guild-related tables:');
    tablesResult.recordset.forEach((row) => {
      console.log(`  - ${row.name}`);
    });

    // Test different possible table names
    const possibleTables = ['Guild', '_Guild', 'Guilds', '_Guilds', 'GUILD', '_GUILD'];

    for (const tableName of possibleTables) {
      try {
        const result = await pool.request().query(`SELECT TOP 1 * FROM ${tableName}`);
        console.log(`\n✅ Found table: ${tableName}`);
        console.log(`   Columns: ${Object.keys(result.recordset[0] || {}).join(', ')}`);
        break;
      } catch (error) {
        console.log(`❌ Table ${tableName} not found`);
      }
    }

    // Check all tables to find guild-related ones
    const allTablesResult = await pool.request().query(`
      SELECT name FROM sys.tables 
      ORDER BY name
    `);

    console.log('\n📊 All available tables:');
    allTablesResult.recordset.forEach((row) => {
      console.log(`  - ${row.name}`);
    });
  } catch (error) {
    console.error('❌ Schema discovery error:', error.message);
  }
}

discoverSchema().then(() => process.exit(0));
