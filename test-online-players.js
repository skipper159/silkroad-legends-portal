// Test script to manually set and get online players cache
const cache = require('./lafftale-backend/utils/cache');
const MetricsService = require('./lafftale-backend/services/metricsService');
const { getAccountDb } = require('./lafftale-backend/db');

async function testOnlinePlayersAPI() {
  try {
    console.log('Testing Online Players API...');

    // Test 1: Check current cache value
    console.log('1. Current cache value:', MetricsService.getPlayersOnline());

    // Test 2: Manually set cache value
    console.log('2. Setting cache value to 1...');
    MetricsService.setPlayersOnline(1, 120);
    console.log('   Cache value after set:', MetricsService.getPlayersOnline());

    // Test 3: Test database query
    console.log('3. Testing database query...');
    const accountDb = await getAccountDb();
    const result = await accountDb.request().query(`
            SELECT 
                SUM(nUserCount) as TotalOnlinePlayers,
                MAX(dLogDate) as LastUpdate,
                DATEDIFF(minute, MAX(dLogDate), GETDATE()) as MinutesAgo
            FROM _ShardCurrentUser 
            WHERE dLogDate = (SELECT MAX(dLogDate) FROM _ShardCurrentUser)
        `);

    const playerData = result.recordset[0];
    console.log('   Database result:', playerData);

    // Test 4: Set real value from database
    const onlineCount = playerData?.TotalOnlinePlayers || 0;
    console.log(`4. Setting real value from DB: ${onlineCount}`);
    MetricsService.setPlayersOnline(onlineCount, 120);
    console.log('   Final cache value:', MetricsService.getPlayersOnline());

    console.log('✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testOnlinePlayersAPI();
