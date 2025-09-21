// test-modular-rankings.js
const express = require('express');
const rankingRoutes = require('./routes/ranking/index.js');

const app = express();

// Test the modular structure
app.use('/api/rankings', rankingRoutes);

// Simple test to check if routes are properly loaded
console.log('Testing modular ranking structure...');

// Check if the router has the expected routes
const routes = [];
function extractRoutes(router, basePath = '') {
  if (router.stack) {
    router.stack.forEach((layer) => {
      if (layer.route) {
        routes.push(`${basePath}${layer.route.path}`);
      } else if (layer.name === 'router') {
        extractRoutes(
          layer.handle,
          basePath + layer.regexp.source.replace('\\/?', '').replace('\\', '')
        );
      }
    });
  }
}

extractRoutes(rankingRoutes, '/api/rankings');

console.log('Available routes:');
routes.forEach((route) => {
  console.log(`  ${route}`);
});

console.log(`\nTotal routes: ${routes.length}`);
console.log('Modular ranking system loaded successfully!');

// Test basic functionality
(async () => {
  try {
    // Test imports
    const { getJobStatistics } = require('./routes/ranking/jobAnalytics');
    const { getPlayerRanking } = require('./routes/ranking/playerRankings');
    const { getHonorRanking } = require('./routes/ranking/honorRankings');

    console.log('\nModule imports successful:');
    console.log('✓ jobAnalytics module');
    console.log('✓ playerRankings module');
    console.log('✓ honorRankings module');
  } catch (error) {
    console.error('Module import error:', error.message);
  }
})();
