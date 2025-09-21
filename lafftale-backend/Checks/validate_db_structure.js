require('dotenv').config();
const sql = require('mssql');

// Datenbank-Konfiguration direkt verwenden
const dbConfig = {
  user: process.env.DB_VPLUS_USER || 'sa',
  password: process.env.DB_VPLUS_PASSWORD,
  server: process.env.DB_VPLUS_SERVER,
  database: process.env.DB_VPLUS_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function validateDatabaseStructure() {
  try {
    console.log('=== VALIDIERUNG DER AKTUALISIERTEN DATABASE-SETUP.SQL ===\n');

    await sql.connect(dbConfig);

    // Definiere erwartete Tabellen basierend auf dem aktualisierten Script
    const expectedTables = [
      'migrations',
      'users',
      'user_roles',
      'news',
      'pages',
      'downloads',
      'settings',
      'votes',
      'vote_logs',
      'donate_logs',
      'vouchers',
      'referrals',
      'SupportTickets',
      'TicketMessages',
      'cache',
      'cache_locks',
      'jobs',
      'job_batches',
      'sessions',
      'password_reset_tokens',
      'personal_access_tokens',
      'failed_jobs',
    ];

    // Alle aktuellen Tabellen abrufen
    const result = await sql.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_CATALOG = 'SRO_CMS'
      ORDER BY TABLE_NAME
    `);

    const currentTables = result.recordset.map((row) => row.TABLE_NAME);

    console.log('Erwartete Tabellen:', expectedTables.length);
    console.log('Aktuelle Tabellen:', currentTables.length);
    console.log('');

    // Prüfung: Alle erwarteten Tabellen vorhanden?
    console.log('=== TABELLEN-ABGLEICH ===');
    let allFound = true;

    expectedTables.forEach((table) => {
      if (currentTables.includes(table)) {
        console.log(`✅ ${table} - VORHANDEN`);
      } else {
        console.log(`❌ ${table} - FEHLT`);
        allFound = false;
      }
    });

    // Zusätzliche Tabellen, die nicht im Script sind
    console.log('\n=== ZUSÄTZLICHE TABELLEN ===');
    currentTables.forEach((table) => {
      if (!expectedTables.includes(table)) {
        console.log(`ℹ️  ${table} - NICHT IM SCRIPT`);
      }
    });

    console.log('\n=== VOUCHERS SCHEMA VALIDIERUNG ===');
    const voucherColumns = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'vouchers'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Vouchers Spalten:');
    voucherColumns.recordset.forEach((col) => {
      console.log(
        `  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${
          col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'
        }`
      );
    });

    console.log('\n=== REFERRALS SCHEMA VALIDIERUNG ===');
    const referralColumns = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'referrals'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('Referrals Spalten:');
    referralColumns.recordset.forEach((col) => {
      console.log(
        `  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${
          col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'
        }`
      );
    });

    console.log('\n=== ZUSAMMENFASSUNG ===');
    if (allFound) {
      console.log('✅ Alle erwarteten Tabellen sind vorhanden!');
      console.log('✅ Database-setup.sql entspricht dem IST-Zustand!');
    } else {
      console.log('❌ Es fehlen einige Tabellen im Script!');
    }

    // Foreign Key Constraints prüfen
    console.log('\n=== FOREIGN KEY CONSTRAINTS ===');
    const fkResult = await sql.query(`
      SELECT 
        fk.name AS constraint_name,
        tp.name AS parent_table,
        cp.name AS parent_column,
        tr.name AS referenced_table,
        cr.name AS referenced_column
      FROM sys.foreign_keys fk
      INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
      INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
      INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
      INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
      ORDER BY tp.name, fk.name
    `);

    console.log('Foreign Key Constraints:');
    fkResult.recordset.forEach((fk) => {
      console.log(
        `  ${fk.parent_table}.${fk.parent_column} -> ${fk.referenced_table}.${fk.referenced_column}`
      );
    });

    await sql.close();
  } catch (error) {
    console.error('Fehler bei der Validierung:', error.message);
  }
}

validateDatabaseStructure();
