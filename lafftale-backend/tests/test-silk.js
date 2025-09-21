// Test Script für SilkManagerCompatible
const SilkManager = require('./models/silkManagerCompatible');

async function testSilkManager() {
  console.log('🧪 Testing SilkManagerCompatible...\n');

  try {
    // Test 1: Error Message Translation
    console.log('📋 Test 1: Error Message Translation');
    console.log('  Error 0:', SilkManager.getErrorMessage(0));
    console.log('  Error -131076:', SilkManager.getErrorMessage(-131076));
    console.log('  Error -393259:', SilkManager.getErrorMessage(-393259));
    console.log('');

    // Test 2: JCash Balance für Test Account (mit sicherer Test-JID)
    console.log('📋 Test 2: JCash Balance Test');
    const testJID = 999999; // Sicherer Test-Account
    const balance = await SilkManager.getJCash(testJID);
    console.log('  Balance für JID', testJID, ':', balance);
    console.log('');

    console.log('✅ Alle Tests abgeschlossen!');
  } catch (error) {
    console.error('❌ Test Fehler:', error.message);

    // Prüfe spezifische DB-Verbindungsprobleme
    if (error.message.includes('login failed') || error.message.includes('network')) {
      console.log(
        '\n💡 Tipp: Stelle sicher, dass die Datenbankverbindung korrekt konfiguriert ist'
      );
      console.log('   Prüfe config.js für DB-Einstellungen');
    }
  }

  process.exit(0);
}

// Führe Tests aus
testSilkManager().catch(console.error);
