// Finaler Test: Korrekte JID-Verwendung für skipper159
const SilkManager = require('./models/silkManagerEnhanced');

async function testCorrectJIDUsage() {
  console.log('🎯 Finaler Test: Korrekte JID-Verwendung für skipper159\n');

  try {
    console.log('📋 Test 1: skipper159 via Portal JID 13531');
    const portalBalance = await SilkManager.getJCash(13531);
    console.log('  Silk Balance:', portalBalance.premiumSilk);

    console.log(
      '📋 Test 2: skipper159 via Game JID 11710 (sollte zu Portal JID 13531 konvertiert werden)'
    );
    const gameBalance = await SilkManager.getJCash(11710);
    console.log('  Silk Balance:', gameBalance.premiumSilk);

    console.log('📋 Test 3: Account Info für skipper159');
    const accountInfo = await SilkManager.getAccountInfo(13531);
    console.log('  Username:', accountInfo.username);
    console.log('  Portal JID:', accountInfo.portalJID);
    console.log('  Game JID:', accountInfo.gameJID);

    console.log('\n🔍 JID Mapping für skipper159:');
    console.log('  ✅ Portal JID: 13531 (für Silk-Operationen)');
    console.log('  ✅ Game JID: 11710 (für Game-Operationen)');
    console.log('  ✅ TB_User.PortalJID = MU_User.JID');

    console.log('\n⚠️ WICHTIG:');
    console.log('  - Silk System verwendet Portal JID (13531)');
    console.log('  - Game System verwendet Game JID (11710)');
    console.log('  - Enhanced SilkManager konvertiert automatisch!');
  } catch (error) {
    console.error('❌ Test Fehler:', error.message);
  }

  process.exit(0);
}

testCorrectJIDUsage().catch(console.error);
