// Test Script für Phase 3 Job Analytics APIs
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3001/api/rankings';

async function testPhase3APIs() {
  const endpoints = [
    'job-statistics',
    'job-leaderboard-comparison',
    'job-progression',
    'job-progression?jobType=1', // Trader specific
    'job-progression?jobType=2', // Thief specific
    'job-progression?jobType=3', // Hunter specific
  ];

  console.log('🚀 Testing Phase 3 Job Analytics APIs...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await fetch(`${baseUrl}/${endpoint}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: ${data.length} results`);

        if (endpoint === 'job-statistics' && data.length > 0) {
          console.log(
            `   Sample Stats: JobType=${data[0].JobType}, TotalPlayers=${
              data[0].TotalPlayers
            }, AvgLevel=${data[0].AverageLevel?.toFixed(1)}`
          );
        } else if (endpoint === 'job-leaderboard-comparison' && data.length > 0) {
          console.log(
            `   Sample Leaderboard: ${data[0].CharName16} - Job ${data[0].JobType} Level ${data[0].JobLevel}`
          );
        } else if (endpoint.startsWith('job-progression') && data.length > 0) {
          console.log(
            `   Sample Progression: Level ${data[0].JobLevel} - ${
              data[0].PlayerCount
            } players, Avg EXP: ${data[0].AverageExp?.toFixed(0)}`
          );
        }
      } else {
        console.log(`❌ ${endpoint}: Error ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    console.log('');
  }
}

// Test Job Statistics Format
console.log('📊 Expected Job Statistics Format:');
console.log('JobType, TotalPlayers, AverageLevel, MaxLevel, MinLevel');
console.log('AverageExperience, MaxExperience, TotalContribution');
console.log('Level1_10, Level11_20, Level21_30, Level31_40, Level41_50');
console.log('Exp0_1M, Exp1M_5M, Exp5M_10M, Exp10M_Plus\n');

// Führe Tests aus
testPhase3APIs()
  .then(() => {
    console.log('✨ Phase 3 API Testing completed!');
    process.exit(0);
  })
  .catch(console.error);
