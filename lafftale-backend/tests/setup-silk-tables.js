/**
 * Setup Script für Silk Admin System
 * Erstellt die notwendigen Tabellen für Silk Statistics
 */

const SilkStatsService = require('./services/silkStatsService');

async function setupSilkTables() {
  console.log('🚀 Setup Silk Admin System Tabellen...\n');

  try {
    // Stelle sicher, dass alle Tabellen existieren
    console.log('1️⃣ Prüfe und erstelle Silk Statistics Tabellen...');
    await SilkStatsService.ensureTablesExist();

    console.log('\n2️⃣ Teste Verbindung zu SilkStatsService...');

    // Teste den Service mit einer einfachen Stats Abfrage
    const testStats = await SilkStatsService.getServerStats(false);
    console.log('✅ SilkStatsService erfolgreich getestet');
    console.log('📊 Cached Stats verfügbar:', testStats.cached);

    console.log('\n🎯 Setup erfolgreich abgeschlossen!');
    console.log('');
    console.log('✅ Tabellen erstellt:');
    console.log('  - silk_server_stats (Server-weite Statistiken)');
    console.log('  - silk_account_cache (Account Silk Cache)');
    console.log('');
    console.log('🚀 Das Silk Admin System ist jetzt einsatzbereit!');
  } catch (error) {
    console.error('❌ Setup Fehler:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

// Führe Setup aus
setupSilkTables().catch((error) => {
  console.error('❌ Unerwarteter Setup Fehler:', error);
  process.exit(1);
});
