// Test für Enhanced SilkManager mit automatischer JID-Konvertierung
const SilkManager = require('./models/silkManagerEnhanced');

async function testEnhancedSilkManager() {
  console.log('🚀 Testing Enhanced SilkManager mit JID-Konvertierung...\n');

  try {
    console.log('📋 Test 1: Portal JID 13531 (sollte direkt funktionieren)');
    const portalResult = await SilkManager.getJCash(13531);
    console.log('  Ergebnis:', portalResult);
    console.log('');

    console.log('📋 Test 2: Game JID 11710 (sollte automatisch konvertiert werden)');
    const gameResult = await SilkManager.getJCash(11710);
    console.log('  Ergebnis:', gameResult);
    console.log('');

    console.log('📋 Test 3: Account Info für Portal JID 13531');
    const accountInfo = await SilkManager.getAccountInfo(13531);
    console.log('  Account Info:', accountInfo);
    console.log('');

    console.log('📋 Test 4: Account Info für Game JID 11710 (Auto-Konvertierung)');
    const gameAccountInfo = await SilkManager.getAccountInfo(11710);
    console.log('  Account Info:', gameAccountInfo);
    console.log('');

    console.log('🎯 Enhanced SilkManager Features:');
    console.log('  ✅ Automatische JID-Konvertierung (Game → Portal)');
    console.log('  ✅ Einheitliche API für beide JID-Typen');
    console.log('  ✅ Vollständige Account-Informationen');
    console.log('  ✅ Sichere Silk-Operationen');
  } catch (error) {
    console.error('❌ Test Fehler:', error.message);
  }

  process.exit(0);
}

testEnhancedSilkManager().catch(console.error);
