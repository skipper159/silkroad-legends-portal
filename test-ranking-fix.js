// Test script to verify ranking fix
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testRankingWithSearch() {
  console.log('Testing ranking system with search...');

  try {
    // Test normal ranking (should show 1, 2, 3, etc.)
    console.log('\n=== Testing normal ranking (no search) ===');
    const normalResponse = await fetch(`${API_BASE}/rankings/top-player?limit=5`);
    const normalData = await normalResponse.json();

    if (normalData.success && normalData.data) {
      normalData.data.forEach((player, index) => {
        console.log(
          `Position ${index + 1}: ${player.CharName} - GlobalRank: ${
            player.GlobalRank
          }, ItemPoints: ${player.ItemPoints}`
        );
      });
    }

    // Test search ranking (should show actual global ranks)
    console.log('\n=== Testing search ranking (search for "Blubber") ===');
    const searchResponse = await fetch(`${API_BASE}/rankings/top-player?limit=5&search=Blubber`);
    const searchData = await searchResponse.json();

    if (searchData.success && searchData.data) {
      searchData.data.forEach((player, index) => {
        console.log(
          `Search Result ${index + 1}: ${player.CharName} - GlobalRank: ${
            player.GlobalRank
          }, ItemPoints: ${player.ItemPoints}`
        );
      });
    } else {
      console.log('No search results found');
    }

    // Test with another search term
    console.log('\n=== Testing search ranking (search for "test") ===');
    const testSearchResponse = await fetch(`${API_BASE}/rankings/top-player?limit=5&search=test`);
    const testSearchData = await testSearchResponse.json();

    if (testSearchData.success && testSearchData.data) {
      testSearchData.data.forEach((player, index) => {
        console.log(
          `Search Result ${index + 1}: ${player.CharName} - GlobalRank: ${
            player.GlobalRank
          }, ItemPoints: ${player.ItemPoints}`
        );
      });
    } else {
      console.log('No search results found for "test"');
    }
  } catch (error) {
    console.error('Error testing ranking system:', error.message);
    console.log('Make sure the backend is running on localhost:3000');
  }
}

testRankingWithSearch();
