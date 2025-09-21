const sql = require('mssql');

// Direkte DB-Konfiguration für den Schema-Checker
const dbConfig = {
    user: process.env.DB_VPLUS_USER || 'sa',
    password: process.env.DB_VPLUS_PASSWORD || 'Oppermann2025',
    server: process.env.DB_VPLUS_SERVER || '89.163.230.156',
    database: process.env.DB_VPLUS_DATABASE || 'SRO_CMS',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

class DatabaseSchemaChecker {
    constructor() {
        this.pool = null;
        this.results = {
            tables: {},
            views: {},
            indexes: {},
            settings: {},
            overall: {
                isComplete: false,
                missingComponents: [],
                errors: []
            }
        };
    }

    async connect() {
        try {
            this.pool = await sql.connect(dbConfig);
            console.log('✅ Datenbankverbindung erfolgreich');
            return true;
        } catch (error) {
            console.error('❌ Datenbankverbindung fehlgeschlagen:', error.message);
            this.results.overall.errors.push(`Verbindungsfehler: ${error.message}`);
            return false;
        }
    }

    async checkTableExists(tableName, expectedColumns = []) {
        try {
            // Prüfe ob Tabelle existiert
            const tableQuery = `
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = @tableName AND TABLE_TYPE = 'BASE TABLE'
            `;
            
            const tableRequest = this.pool.request();
            tableRequest.input('tableName', sql.NVarChar, tableName);
            const tableResult = await tableRequest.query(tableQuery);

            if (tableResult.recordset.length === 0) {
                this.results.tables[tableName] = {
                    exists: false,
                    columns: {},
                    status: 'MISSING'
                };
                this.results.overall.missingComponents.push(`Tabelle: ${tableName}`);
                return false;
            }

            // Prüfe Spalten
            const columnsQuery = `
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    IS_NULLABLE,
                    COLUMN_DEFAULT,
                    CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = @tableName
                ORDER BY ORDINAL_POSITION
            `;

            const columnsRequest = this.pool.request();
            columnsRequest.input('tableName', sql.NVarChar, tableName);
            const columnsResult = await columnsRequest.query(columnsQuery);

            const existingColumns = {};
            columnsResult.recordset.forEach(col => {
                existingColumns[col.COLUMN_NAME] = {
                    type: col.DATA_TYPE,
                    nullable: col.IS_NULLABLE === 'YES',
                    default: col.COLUMN_DEFAULT,
                    maxLength: col.CHARACTER_MAXIMUM_LENGTH,
                    exists: true
                };
            });

            // Prüfe erwartete Spalten
            const missingColumns = [];
            expectedColumns.forEach(expectedCol => {
                if (!existingColumns[expectedCol]) {
                    missingColumns.push(expectedCol);
                    existingColumns[expectedCol] = { exists: false };
                }
            });

            this.results.tables[tableName] = {
                exists: true,
                columns: existingColumns,
                missingColumns: missingColumns,
                status: missingColumns.length > 0 ? 'INCOMPLETE' : 'COMPLETE'
            };

            if (missingColumns.length > 0) {
                this.results.overall.missingComponents.push(`Spalten in ${tableName}: ${missingColumns.join(', ')}`);
            }

            return missingColumns.length === 0;

        } catch (error) {
            console.error(`❌ Fehler beim Prüfen der Tabelle ${tableName}:`, error.message);
            this.results.overall.errors.push(`Tabellenfehler ${tableName}: ${error.message}`);
            return false;
        }
    }

    async checkViewExists(viewName) {
        try {
            const query = `
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.VIEWS 
                WHERE TABLE_NAME = @viewName
            `;
            
            const request = this.pool.request();
            request.input('viewName', sql.NVarChar, viewName);
            const result = await request.query(query);

            const exists = result.recordset.length > 0;
            this.results.views[viewName] = {
                exists: exists,
                status: exists ? 'COMPLETE' : 'MISSING'
            };

            if (!exists) {
                this.results.overall.missingComponents.push(`View: ${viewName}`);
            }

            return exists;

        } catch (error) {
            console.error(`❌ Fehler beim Prüfen der View ${viewName}:`, error.message);
            this.results.overall.errors.push(`View-Fehler ${viewName}: ${error.message}`);
            return false;
        }
    }

    async checkIndexExists(tableName, indexName) {
        try {
            const query = `
                SELECT i.name as index_name, t.name as table_name
                FROM sys.indexes i
                INNER JOIN sys.tables t ON i.object_id = t.object_id
                WHERE t.name = @tableName AND i.name = @indexName
            `;
            
            const request = this.pool.request();
            request.input('tableName', sql.NVarChar, tableName);
            request.input('indexName', sql.NVarChar, indexName);
            const result = await request.query(query);

            const exists = result.recordset.length > 0;
            const key = `${tableName}.${indexName}`;
            this.results.indexes[key] = {
                exists: exists,
                status: exists ? 'COMPLETE' : 'MISSING'
            };

            if (!exists) {
                this.results.overall.missingComponents.push(`Index: ${key}`);
            }

            return exists;

        } catch (error) {
            console.error(`❌ Fehler beim Prüfen des Index ${indexName}:`, error.message);
            this.results.overall.errors.push(`Index-Fehler ${indexName}: ${error.message}`);
            return false;
        }
    }

    async checkReferralSettings() {
        try {
            const expectedSettings = [
                'anticheat_enabled',
                'max_referrals_per_ip_per_day',
                'max_referrals_per_fingerprint_per_day',
                'block_duplicate_ip_referrals',
                'block_duplicate_fingerprint_referrals',
                'suspicious_referral_review_required'
            ];

            const query = `
                SELECT setting_key, setting_value, description
                FROM referral_settings
                WHERE setting_key IN ('${expectedSettings.join("','")}')
            `;

            const result = await this.pool.request().query(query);
            
            const existingSettings = {};
            result.recordset.forEach(setting => {
                existingSettings[setting.setting_key] = {
                    value: setting.setting_value,
                    description: setting.description,
                    exists: true
                };
            });

            const missingSettings = [];
            expectedSettings.forEach(setting => {
                if (!existingSettings[setting]) {
                    missingSettings.push(setting);
                    existingSettings[setting] = { exists: false };
                }
            });

            this.results.settings = {
                expected: expectedSettings,
                existing: existingSettings,
                missing: missingSettings,
                status: missingSettings.length === 0 ? 'COMPLETE' : 'INCOMPLETE'
            };

            if (missingSettings.length > 0) {
                this.results.overall.missingComponents.push(`Settings: ${missingSettings.join(', ')}`);
            }

            return missingSettings.length === 0;

        } catch (error) {
            console.error('❌ Fehler beim Prüfen der Referral Settings:', error.message);
            this.results.overall.errors.push(`Settings-Fehler: ${error.message}`);
            return false;
        }
    }

    async runCompleteCheck() {
        console.log('🔍 === DATENBANK SCHEMA VOLLSTÄNDIGKEITSPRÜFUNG ===\n');

        if (!await this.connect()) {
            return this.results;
        }

        let allChecksPass = true;

        // 1. Prüfe Basis-Tabellen
        console.log('📋 Prüfe Basis-Tabellen...');
        const baseTablesPass = await this.checkTableExists('referrals', [
            'id', 'code', 'jid', 'invited_jid', 'points', 'redeemed', 'created_at',
            'ip_address', 'fingerprint', 'is_valid', 'cheat_reason'  // Anti-Cheat Felder
        ]);
        
        const settingsTablePass = await this.checkTableExists('referral_settings', [
            'id', 'setting_key', 'setting_value', 'description', 'created_at', 'updated_at'
        ]);

        const logsTablePass = await this.checkTableExists('referral_anticheat_logs', [
            'id', 'user_id', 'ip_address', 'fingerprint', 'action', 'referral_code',
            'is_suspicious', 'detection_reason', 'user_agent', 'created_at'
        ]);

        allChecksPass = allChecksPass && baseTablesPass && settingsTablePass && logsTablePass;

        // 2. Prüfe Views
        console.log('👁️  Prüfe Anti-Cheat Views...');
        const views = [
            'v_suspicious_referrals',
            'v_ip_referral_stats', 
            'v_fingerprint_referral_stats',
            'v_daily_anticheat_stats'
        ];

        for (const view of views) {
            const viewPass = await this.checkViewExists(view);
            allChecksPass = allChecksPass && viewPass;
        }

        // 3. Prüfe Indizes
        console.log('📊 Prüfe Performance-Indizes...');
        const indexes = [
            { table: 'referrals', index: 'IX_referrals_ip_address' },
            { table: 'referrals', index: 'IX_referrals_fingerprint' },
            { table: 'referrals', index: 'IX_referrals_created_at' },
            { table: 'referrals', index: 'IX_referrals_jid_valid' }
        ];

        for (const { table, index } of indexes) {
            const indexPass = await this.checkIndexExists(table, index);
            allChecksPass = allChecksPass && indexPass;
        }

        // 4. Prüfe Einstellungen
        console.log('⚙️  Prüfe Anti-Cheat Einstellungen...');
        const settingsPass = await this.checkReferralSettings();
        allChecksPass = allChecksPass && settingsPass;

        // 5. Finales Ergebnis
        this.results.overall.isComplete = allChecksPass;

        await sql.close();
        
        console.log('\n🏁 === PRÜFUNG ABGESCHLOSSEN ===');
        this.printResults();
        
        return this.results;
    }

    printResults() {
        console.log(`\n📊 === ERGEBNIS-ÜBERSICHT ===`);
        console.log(`Status: ${this.results.overall.isComplete ? '✅ VOLLSTÄNDIG' : '❌ UNVOLLSTÄNDIG'}\n`);

        // Tabellen Status
        console.log('📋 TABELLEN:');
        Object.entries(this.results.tables).forEach(([table, info]) => {
            const status = info.status === 'COMPLETE' ? '✅' : info.status === 'INCOMPLETE' ? '⚠️' : '❌';
            console.log(`  ${status} ${table}: ${info.status}`);
            
            if (info.missingColumns && info.missingColumns.length > 0) {
                console.log(`    🔸 Fehlende Spalten: ${info.missingColumns.join(', ')}`);
            }
        });

        // Views Status
        console.log('\n👁️  VIEWS:');
        Object.entries(this.results.views).forEach(([view, info]) => {
            const status = info.exists ? '✅' : '❌';
            console.log(`  ${status} ${view}: ${info.status}`);
        });

        // Indizes Status
        console.log('\n📊 INDIZES:');
        Object.entries(this.results.indexes).forEach(([index, info]) => {
            const status = info.exists ? '✅' : '❌';
            console.log(`  ${status} ${index}: ${info.status}`);
        });

        // Settings Status
        console.log('\n⚙️  EINSTELLUNGEN:');
        if (this.results.settings.status) {
            const status = this.results.settings.status === 'COMPLETE' ? '✅' : '❌';
            console.log(`  ${status} Anti-Cheat Settings: ${this.results.settings.status}`);
            
            if (this.results.settings.missing && this.results.settings.missing.length > 0) {
                console.log(`    🔸 Fehlende Settings: ${this.results.settings.missing.join(', ')}`);
            }
        }

        // Fehlende Komponenten
        if (this.results.overall.missingComponents.length > 0) {
            console.log('\n❌ FEHLENDE KOMPONENTEN:');
            this.results.overall.missingComponents.forEach(component => {
                console.log(`  🔸 ${component}`);
            });
        }

        // Fehler
        if (this.results.overall.errors.length > 0) {
            console.log('\n🚨 FEHLER:');
            this.results.overall.errors.forEach(error => {
                console.log(`  ❌ ${error}`);
            });
        }

        console.log('\n💡 EMPFEHLUNGEN:');
        if (!this.results.overall.isComplete) {
            console.log('  1. Führe install_anticheat_complete.sql aus');
            console.log('  2. Prüfe Datenbankverbindung und Berechtigungen');
            console.log('  3. Führe diesen Check erneut aus');
        } else {
            console.log('  ✅ Schema ist vollständig - Anti-Cheat System bereit!');
        }
    }

    // Schneller Check für API Endpunkte
    async quickHealthCheck() {
        try {
            if (!await this.connect()) return false;

            const query = `
                SELECT 
                    (SELECT COUNT(*) FROM referrals WHERE ip_address IS NOT NULL) as referrals_with_ip,
                    (SELECT COUNT(*) FROM referrals WHERE fingerprint IS NOT NULL) as referrals_with_fingerprint,
                    (SELECT COUNT(*) FROM referral_settings WHERE setting_key LIKE 'anticheat%') as anticheat_settings,
                    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_NAME LIKE 'v_%referral%') as anticheat_views
            `;

            const result = await this.pool.request().query(query);
            await sql.close();

            return {
                isHealthy: true,
                stats: result.recordset[0]
            };

        } catch (error) {
            console.error('Health Check Fehler:', error.message);
            return {
                isHealthy: false,
                error: error.message
            };
        }
    }
}

module.exports = DatabaseSchemaChecker;

// CLI Ausführung
if (require.main === module) {
    const checker = new DatabaseSchemaChecker();
    
    const command = process.argv[2];
    
    if (command === 'health') {
        checker.quickHealthCheck().then(result => {
            console.log('🏥 Health Check:', result);
            process.exit(result.isHealthy ? 0 : 1);
        });
    } else {
        checker.runCompleteCheck().then(results => {
            process.exit(results.overall.isComplete ? 0 : 1);
        });
    }
}