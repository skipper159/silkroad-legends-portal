// Script to fix Foreign Key constraint issues in ticket system
const { getWebDb } = require('../db.js');

async function fixTicketForeignKeys() {
  try {
    console.log('Connecting to database...');
    const pool = await getWebDb();

    console.log('Starting Foreign Key constraint fixes...');

    // Step 1: Update data types to match users.id (bigint)
    console.log('Updating SupportTickets.UserId to bigint...');
    await pool.request().query(`
            ALTER TABLE [dbo].[SupportTickets] 
            ALTER COLUMN [UserId] BIGINT NOT NULL
        `);

    console.log('Updating TicketMessages.SenderId to bigint...');
    await pool.request().query(`
            ALTER TABLE [dbo].[TicketMessages] 
            ALTER COLUMN [SenderId] BIGINT NOT NULL
        `);

    // Step 2: Add Foreign Key constraints
    console.log('Adding Foreign Key constraint for SupportTickets...');
    await pool.request().query(`
            ALTER TABLE [dbo].[SupportTickets] 
            WITH CHECK ADD CONSTRAINT [FK_SupportTickets_Users] 
            FOREIGN KEY([UserId]) REFERENCES [dbo].[users] ([id])
        `);

    console.log('Adding Foreign Key constraint for TicketMessages...');
    await pool.request().query(`
            ALTER TABLE [dbo].[TicketMessages] 
            WITH CHECK ADD CONSTRAINT [FK_TicketMessages_Users] 
            FOREIGN KEY([SenderId]) REFERENCES [dbo].[users] ([id])
        `);

    console.log('Foreign Key constraints fixed successfully!');

    // Verify the changes
    console.log('\nVerifying changes...');
    const result = await pool.request().query(`
            SELECT 
                TABLE_NAME,
                COLUMN_NAME, 
                DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME IN ('SupportTickets', 'TicketMessages')
            AND COLUMN_NAME IN ('UserId', 'SenderId')
            ORDER BY TABLE_NAME, COLUMN_NAME
        `);

    console.table(result.recordset);
  } catch (error) {
    console.error('Error fixing Foreign Key constraints:', error);
  }
}

fixTicketForeignKeys();
