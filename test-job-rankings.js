// Test Script für Job Rankings APIs
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3001/api/rankings';

async function testJobRankings() {
  const endpoints = ['job-all', 'job-trader', 'job-thief', 'job-hunter'];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint}...`);
      const response = await fetch(`${baseUrl}/${endpoint}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: ${data.length} results`);
        if (data.length > 0) {
          console.log(
            `   Sample: ${data[0].CharName16} - Level ${data[0].CurLevel} - Job Level ${data[0].JobLevel}`
          );
        }
      } else {
        console.log(`❌ ${endpoint}: Error ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

// Führe Tests aus
testJobRankings()
  .then(() => {
    console.log('\nTest completed!');
    process.exit(0);
  })
  .catch(console.error);
