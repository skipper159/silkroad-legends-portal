import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/ranking';

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📡 GET ${BASE_URL}${endpoint}`);

    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      timeout: 5000,
    });

    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Data count: ${response.data.data ? response.data.data.length : 'N/A'}`);

    if (response.data.success) {
      console.log(`✅ Success: ${response.data.success}`);
    } else {
      console.log(`❌ Failed: ${response.data.error || 'Unknown error'}`);
    }

    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(
        `📄 Response: ${error.response.status} - ${
          error.response.data?.error || error.response.statusText
        }`
      );
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests for Rankings...\n');

  const tests = [
    // Phase 3 Analytics
    ['/job-statistics', 'Job Statistics (Phase 3)'],
    ['/job-statistics?jobType=1', 'Job Statistics - Traders only'],
    ['/job-leaderboard-comparison', 'Job Leaderboard Comparison (Phase 3)'],
    ['/job-leaderboard-comparison?limit=5', 'Job Leaderboard - Top 5'],
    ['/job-progression?jobType=1', 'Job Progression - Traders (Phase 3)'],
    ['/job-progression?jobType=2&minLevel=5&maxLevel=20', 'Job Progression - Thieves Level 5-20'],

    // Phase 2 Job Rankings
    ['/trader', 'Trader Rankings (Phase 2)'],
    ['/trader?page=1&limit=5', 'Trader Rankings - First 5'],
    ['/thief', 'Thief Rankings (Phase 2)'],
    ['/hunter', 'Hunter Rankings (Phase 2)'],

    // Phase 1 Rankings
    ['/honor', 'Honor Rankings (Phase 1)'],
    ['/honor?race=Chinese&limit=3', 'Honor Rankings - Chinese only'],
    ['/fortress', 'Fortress Rankings (Phase 1)'],
    ['/fortress?minKills=10', 'Fortress Rankings - Min 10 kills'],
    ['/pvp', 'PvP Rankings (Phase 1)'],
    ['/pvp?race=European&minKD=1.5', 'PvP Rankings - European with K/D > 1.5'],

    // Legacy Routes
    ['/top-player', 'Legacy Player Rankings'],
    ['/top-guild', 'Legacy Guild Rankings'],
  ];

  let passed = 0;
  let failed = 0;

  for (const [endpoint, description] of tests) {
    const result = await testAPI(endpoint, description);
    if (result) {
      passed++;
    } else {
      failed++;
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}

runTests().catch(console.error);
