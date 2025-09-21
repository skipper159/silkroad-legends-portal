const { getWebDb, sql } = require('./db');

async function checkSchema() {
  try {
    // Verbindung zur Datenbank
    const pool = await getWebDb();
    console.log('Connected to web database');

    // Alle Tabellen auflisten
    const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);

    console.log('\n=== Verfügbare Tabellen ===');
    tablesResult.recordset.forEach((table) => {
      console.log(`- ${table.TABLE_NAME}`);
    });

    // Spalten der users Tabelle prüfen
    console.log('\n=== Users Tabelle Struktur ===');
    const usersColumnsResult = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users'
            ORDER BY ORDINAL_POSITION
        `);

    if (usersColumnsResult.recordset.length > 0) {
      usersColumnsResult.recordset.forEach((column) => {
        console.log(
          `- ${column.COLUMN_NAME} (${column.DATA_TYPE}) ${
            column.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'
          }`
        );
      });
    } else {
      console.log('Tabelle "users" nicht gefunden');
    }

    // Prüfe andere Admin-Tabellen
    const adminTables = ['downloads', 'vouchers', 'votes', 'referrals', 'pages'];

    for (const tableName of adminTables) {
      console.log(`\n=== ${tableName.toUpperCase()} Tabelle Struktur ===`);
      const tableColumnsResult = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '${tableName}'
                ORDER BY ORDINAL_POSITION
            `);

      if (tableColumnsResult.recordset.length > 0) {
        tableColumnsResult.recordset.forEach((column) => {
          console.log(
            `- ${column.COLUMN_NAME} (${column.DATA_TYPE}) ${
              column.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'
            }`
          );
        });
      } else {
        console.log(`Tabelle "${tableName}" nicht gefunden`);
      }
    }
  } catch (err) {
    console.error('Database error:', err.message);
  }
}

checkSchema();
