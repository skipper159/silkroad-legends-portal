const { getWebDb } = require('./db');

async function checkSchemas() {
  try {
    const pool = await getWebDb();

    console.log('=== VOUCHERS SCHEMA ===');
    const voucherStructure = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'vouchers'
      ORDER BY ORDINAL_POSITION
    `);
    voucherStructure.recordset.forEach((col) => {
      console.log(
        `${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`
      );
    });

    console.log('\n=== REFERRALS SCHEMA ===');
    const referralStructure = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'referrals'
      ORDER BY ORDINAL_POSITION
    `);
    referralStructure.recordset.forEach((col) => {
      console.log(
        `${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`
      );
    });

    // Test ein einfaches Query
    console.log('\n=== VOUCHER TEST QUERY ===');
    try {
      const voucherTest = await pool.request().query('SELECT TOP 1 * FROM vouchers');
      console.log(
        'Voucher query successful, columns:',
        Object.keys(voucherTest.recordset[0] || {})
      );
    } catch (error) {
      console.log('Voucher query error:', error.message);
    }

    console.log('\n=== REFERRAL TEST QUERY ===');
    try {
      const referralTest = await pool.request().query('SELECT TOP 1 * FROM referrals');
      console.log(
        'Referral query successful, columns:',
        Object.keys(referralTest.recordset[0] || {})
      );
    } catch (error) {
      console.log('Referral query error:', error.message);
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

checkSchemas();
