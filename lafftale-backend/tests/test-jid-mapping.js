// Test für JID-Zuordnung verstehen
const SilkManager = require('./models/silkManagerCompatible');
const { pool, poolConnect, sql } = require('./db');

async function testJIDMapping() {
  console.log('🔍 Testing JID Mapping zwischen Game und Portal System...\n');

  await poolConnect;

  try {
    // Test 1: Prüfe skipper159 in beiden Systemen
    console.log('📋 Test 1: skipper159 JID Mapping');

    // Game System JID
    const gameResult = await pool.request().input('username', sql.VarChar, 'skipper159').query(`
        SELECT JID as GameJID, StrUserID, PortalJID 
        FROM [SILKROAD_R_ACCOUNT].[dbo].[TB_User] 
        WHERE StrUserID = @username
      `);

    // Portal System JID
    const portalResult = await pool.request().input('username', sql.VarChar, 'skipper159').query(`
        SELECT JID as PortalJID, UserID 
        FROM [GB_JoymaxPortal].[dbo].[MU_User] 
        WHERE UserID = @username
      `);

    console.log('  Game System (TB_User):', gameResult.recordset[0]);
    console.log('  Portal System (MU_User):', portalResult.recordset[0]);
    console.log('');

    // Test 2: Silk Balance mit Portal JID
    const portalJID = gameResult.recordset[0].PortalJID;
    console.log(`📋 Test 2: Silk Balance mit Portal JID ${portalJID}`);
    const silkBalance = await SilkManager.getJCash(portalJID);
    console.log('  Silk Balance:', silkBalance);
    console.log('');

    // Test 3: Was passiert wenn wir Game JID verwenden?
    const gameJID = gameResult.recordset[0].GameJID;
    console.log(`📋 Test 3: Silk Balance mit Game JID ${gameJID} (sollte fehlschlagen)`);
    const wrongBalance = await SilkManager.getJCash(gameJID);
    console.log('  Silk Balance:', wrongBalance);
    console.log('');

    console.log('🎯 Erkenntnisse:');
    console.log('  ✅ Silk System verwendet Portal JID (MU_User.JID)');
    console.log('  ✅ Game System verwendet Game JID (TB_User.JID)');
    console.log('  ✅ Verknüpfung über TB_User.PortalJID = MU_User.JID');
    console.log('');
    console.log('💡 Lösung: SilkManager muss Game JID → Portal JID konvertieren!');
  } catch (error) {
    console.error('❌ Test Fehler:', error.message);
  }

  process.exit(0);
}

testJIDMapping().catch(console.error);
