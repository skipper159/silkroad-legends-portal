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

async function checkCurrentTables() {
  try {
    console.log('Verbinde zu Datenbank:', dbConfig.server + '/' + dbConfig.database);

    await sql.connect(dbConfig);

    // Alle Tabellen abrufen
    const tablesResult = await sql.query(`
      SELECT 
        t.TABLE_NAME,
        t.TABLE_TYPE
      FROM INFORMATION_SCHEMA.TABLES t
      WHERE t.TABLE_CATALOG = 'SRO_CMS'
      ORDER BY t.TABLE_NAME
    `);

    console.log('=== AKTUELLE DATENBANK TABELLEN ===');
    console.log('Database: SRO_CMS');
    console.log('Anzahl Tabellen:', tablesResult.recordset.length);
    console.log('');

    const tables = [];
    tablesResult.recordset.forEach((table, index) => {
      console.log(`${index + 1}. ${table.TABLE_NAME}`);
      tables.push(table.TABLE_NAME);
    });

    console.log('\n=== DETAILLIERTE TABELLEN-STRUKTUREN ===\n');

    // Für jede Tabelle die Spalten-Struktur abrufen
    for (let tableName of tables) {
      console.log(`--- ${tableName} ---`);

      const columnsResult = await sql.query(`
        SELECT 
          c.COLUMN_NAME,
          c.DATA_TYPE,
          c.IS_NULLABLE,
          c.COLUMN_DEFAULT,
          c.CHARACTER_MAXIMUM_LENGTH,
          c.NUMERIC_PRECISION,
          c.NUMERIC_SCALE,
          CASE 
            WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES'
            ELSE 'NO'
          END as IS_PRIMARY_KEY,
          CASE 
            WHEN c.COLUMN_NAME = 'id' AND c.DATA_TYPE IN ('int', 'bigint') THEN 'YES'
            ELSE 'NO'
          END as IS_IDENTITY
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN (
          SELECT ku.COLUMN_NAME
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
          WHERE tc.TABLE_NAME = '${tableName}' AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
        ) pk ON c.COLUMN_NAME = pk.COLUMN_NAME
        WHERE c.TABLE_NAME = '${tableName}'
        ORDER BY c.ORDINAL_POSITION
      `);

      columnsResult.recordset.forEach((col) => {
        let typeInfo = col.DATA_TYPE;
        if (col.CHARACTER_MAXIMUM_LENGTH) {
          typeInfo += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
        } else if (col.NUMERIC_PRECISION) {
          typeInfo += `(${col.NUMERIC_PRECISION}${
            col.NUMERIC_SCALE ? ',' + col.NUMERIC_SCALE : ''
          })`;
        }

        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const primaryKey = col.IS_PRIMARY_KEY === 'YES' ? '[PK]' : '';
        const identity = col.IS_IDENTITY === 'YES' ? '[IDENTITY]' : '';

        console.log(
          `  ${col.COLUMN_NAME}: ${typeInfo} ${nullable} ${primaryKey} ${identity}`.trim()
        );
      });

      console.log('');
    }

    await sql.close();
  } catch (error) {
    console.error('Fehler beim Abrufen der Tabellenstruktur:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkCurrentTables();
