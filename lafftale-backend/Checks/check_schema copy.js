// Test script to check database schema and identify data type conflicts
const sql = require('mssql');
const { getWebDb } = require('../db.js');

async function checkDatabaseSchema() {
  try {
    console.log('Connecting to database...');
    const pool = await getWebDb();

    // Check data types of relevant columns
    console.log('\n=== Column Data Types ===');
    const dataTypesQuery = `
            SELECT 
                TABLE_NAME,
                COLUMN_NAME, 
                DATA_TYPE,
                CHARACTER_MAXIMUM_LENGTH,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('users', 'WebUsers', 'SupportTickets', 'TicketMessages')
            AND COLUMN_NAME IN ('id', 'UserId', 'SenderId')
            ORDER BY TABLE_NAME, COLUMN_NAME
        `;

    const dataTypes = await pool.request().query(dataTypesQuery);
    console.table(dataTypes.recordset);

    // Check existing foreign key constraints
    console.log('\n=== Existing Foreign Key Constraints ===');
    const fkQuery = `
            SELECT 
                fk.name AS ForeignKeyName,
                tp.name AS ParentTable,
                cp.name AS ParentColumn,
                tr.name AS ReferencedTable,
                cr.name AS ReferencedColumn
            FROM sys.foreign_keys fk
            INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
            INNER JOIN sys.tables tp ON fkc.parent_object_id = tp.object_id
            INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
            INNER JOIN sys.tables tr ON fkc.referenced_object_id = tr.object_id
            INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
            WHERE tp.name IN ('SupportTickets', 'TicketMessages')
        `;

    const foreignKeys = await pool.request().query(fkQuery);
    console.table(foreignKeys.recordset);

    // Check for data conflicts
    console.log('\n=== Data Conflict Analysis ===');

    // Check existing tickets
    const ticketCountResult = await pool
      .request()
      .query('SELECT COUNT(*) as count FROM SupportTickets');
    const ticketCount = ticketCountResult.recordset[0].count;
    console.log(`Total SupportTickets: ${ticketCount}`);

    // Check existing messages
    const messageCountResult = await pool
      .request()
      .query('SELECT COUNT(*) as count FROM TicketMessages');
    const messageCount = messageCountResult.recordset[0].count;
    console.log(`Total TicketMessages: ${messageCount}`);

    // Check for orphaned tickets (if any exist)
    if (ticketCount > 0) {
      const orphanedTicketsQuery = `
                SELECT COUNT(*) as orphaned_count
                FROM SupportTickets ST
                LEFT JOIN users U ON ST.UserId = U.id
                WHERE U.id IS NULL
            `;
      const orphanedTickets = await pool.request().query(orphanedTicketsQuery);
      console.log(`Orphaned SupportTickets: ${orphanedTickets.recordset[0].orphaned_count}`);
    }

    if (messageCount > 0) {
      const orphanedMessagesQuery = `
                SELECT COUNT(*) as orphaned_count
                FROM TicketMessages TM
                LEFT JOIN users U ON TM.SenderId = U.id
                WHERE U.id IS NULL
            `;
      const orphanedMessages = await pool.request().query(orphanedMessagesQuery);
      console.log(`Orphaned TicketMessages: ${orphanedMessages.recordset[0].orphaned_count}`);
    }

    console.log('\n=== Schema Analysis Complete ===');
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    // Connection wird automatisch von getWebConnection verwaltet
  }
}

checkDatabaseSchema();
