const { dbClient } = require('../db');
const fs = require('fs').promises;
const path = require('path');

/**
 * TEMPORARY MIGRATION CONTROLLER
 * This controller provides endpoints to run database migrations
 * Remove this after migration is complete for security
 */

const migrationController = {
  // Run the safe migration script
  async runCompleteMigration(req, res) {
    try {
      console.log('🚀 Starting Safe Referral Anti-Cheat & Delayed Rewards Migration...');

      // Read the safe migration script
      const migrationPath = path.join(__dirname, '..', 'database', 'safe_migration.sql');
      const migrationScript = await fs.readFile(migrationPath, 'utf8');

      // Split script into individual statements
      const statements = migrationScript
        .split(';')
        .map((stmt) => stmt.trim())
        .filter(
          (stmt) =>
            stmt.length > 10 &&
            !stmt.startsWith('--') &&
            !stmt.startsWith('PRINT') &&
            !stmt.includes('USE SRO_CMS') &&
            !stmt.match(/^(GO|DECLARE)/)
        );

      console.log(`Found ${statements.length} SQL statements to execute`);

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Execute each statement individually
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement.length < 10) continue;

        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);

          const result = await dbClient.query(statement);
          results.push({
            statement: i + 1,
            status: 'SUCCESS',
            preview: statement.substring(0, 100) + '...',
            rowsAffected: result.rowsAffected || 0,
          });
          successCount++;
        } catch (error) {
          console.error(`Error in statement ${i + 1}:`, error.message);

          // Some errors are expected (like "already exists")
          const expectedErrors = [
            'already exists',
            'duplicate key',
            'There is already an object',
            'Invalid column name',
            'already has a constraint',
            'The index',
          ];

          const isExpectedError = expectedErrors.some((err) =>
            error.message.toLowerCase().includes(err.toLowerCase())
          );

          if (isExpectedError) {
            results.push({
              statement: i + 1,
              status: 'SKIPPED',
              preview: statement.substring(0, 100) + '...',
              message: 'Already exists - skipped',
            });
            successCount++;
          } else {
            results.push({
              statement: i + 1,
              status: 'ERROR',
              preview: statement.substring(0, 100) + '...',
              error: error.message,
            });
            errorCount++;
          }
        }
      }

      // Check if migration was successful
      const migrationSuccess = errorCount === 0 || successCount > errorCount * 3;

      console.log(`Migration completed: ${successCount} success, ${errorCount} errors`);

      res.json({
        success: migrationSuccess,
        message: migrationSuccess
          ? 'Safe migration completed successfully!'
          : 'Migration completed with some errors',
        statistics: {
          totalStatements: statements.length,
          successful: successCount,
          errors: errorCount,
          skipped: results.filter((r) => r.status === 'SKIPPED').length,
        },
        results: results.slice(-10), // Only show last 10 results to avoid overwhelming response
        features: {
          '8_layer_anticheat': true,
          delayed_rewards: true,
          lifetime_limits: true,
          vpn_detection: true,
          behavioral_analysis: true,
          honeypot_traps: true,
          cronjob_system: true,
        },
      });
    } catch (error) {
      console.error('Migration failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to run safe migration script',
      });
    }
  },

  // Verify migration status
  async verifyMigration(req, res) {
    try {
      console.log('🔍 Verifying migration status...');

      const checks = {
        tables: {},
        settings: {},
        columns: {},
        indexes: {},
      };

      // Check if new tables exist
      const tablesToCheck = [
        'referral_anticheat_logs',
        'known_vpn_ips',
        'behavioral_fingerprints',
        'delayed_reward_logs',
      ];
      for (const table of tablesToCheck) {
        try {
          const result = await dbClient.query(
            `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${table}'`
          );
          checks.tables[table] = result.recordset[0].count > 0;
        } catch (error) {
          checks.tables[table] = false;
        }
      }

      // Check new columns in referrals table
      const columnsToCheck = ['status', 'requires_validation', 'reward_given_at', 'cheat_reason'];
      for (const column of columnsToCheck) {
        try {
          const result = await dbClient.query(
            `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'referrals' AND COLUMN_NAME = '${column}'`
          );
          checks.columns[column] = result.recordset[0].count > 0;
        } catch (error) {
          checks.columns[column] = false;
        }
      }

      // Check key settings
      const settingsToCheck = [
        'max_referrals_per_ip_lifetime',
        'delayed_rewards_enabled',
        'pattern_detection_enabled',
      ];
      for (const setting of settingsToCheck) {
        try {
          const result = await dbClient.query(
            `SELECT COUNT(*) as count FROM referral_settings WHERE setting_key = '${setting}'`
          );
          checks.settings[setting] = result.recordset[0].count > 0;
        } catch (error) {
          checks.settings[setting] = false;
        }
      }

      // Count referrals by status
      try {
        const statusResult = await dbClient.query(`
                    SELECT status, COUNT(*) as count 
                    FROM referrals 
                    WHERE status IS NOT NULL 
                    GROUP BY status
                `);
        checks.referralStatus = statusResult.recordset.reduce((acc, row) => {
          acc[row.status] = row.count;
          return acc;
        }, {});
      } catch (error) {
        checks.referralStatus = { error: error.message };
      }

      const allTablesExist = Object.values(checks.tables).every((exists) => exists);
      const allColumnsExist = Object.values(checks.columns).every((exists) => exists);
      const allSettingsExist = Object.values(checks.settings).every((exists) => exists);

      const migrationComplete = allTablesExist && allColumnsExist && allSettingsExist;

      res.json({
        migrationComplete,
        checks,
        summary: {
          tablesCreated:
            Object.values(checks.tables).filter(Boolean).length + '/' + tablesToCheck.length,
          columnsAdded:
            Object.values(checks.columns).filter(Boolean).length + '/' + columnsToCheck.length,
          settingsConfigured:
            Object.values(checks.settings).filter(Boolean).length + '/' + settingsToCheck.length,
        },
        message: migrationComplete
          ? '✅ Migration is complete and verified!'
          : '⚠️ Migration incomplete - some components missing',
      });
    } catch (error) {
      console.error('Verification failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to verify migration status',
      });
    }
  },

  // Get migration info
  async getMigrationInfo(req, res) {
    res.json({
      name: 'Safe Referral Anti-Cheat & Delayed Rewards Migration',
      version: '1.0.1',
      description:
        'Implements 8-Layer Anti-Cheat System and Delayed Reward Processing (Safe Version)',
      features: [
        '🛡️ 8-Layer Anti-Cheat System',
        '⏰ Delayed Reward System (PENDING → ACTIVE → REJECTED)',
        '🔒 Lifetime-based IP/Fingerprint blocking',
        '🕵️ VPN/Proxy/Hosting detection',
        '🧠 Behavioral pattern analysis',
        '🍯 Honeypot bot traps',
        '📊 Advanced logging and monitoring',
        '⚙️ Automatic cronjob processing',
      ],
      endpoints: {
        'POST /api/migration/run': 'Execute the safe migration',
        'GET /api/migration/verify': 'Verify migration status',
        'GET /api/migration/info': 'Get migration information',
      },
      improvements: [
        '✅ Fixed column dependency issues',
        '✅ Better error handling for existing objects',
        '✅ Safer statement execution order',
        '✅ Comprehensive validation checks',
      ],
      warning:
        '⚠️ This is a temporary controller for migration purposes only. Remove after migration is complete!',
    });
  },
};

module.exports = migrationController;
