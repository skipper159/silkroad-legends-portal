console.log('🔧 Testing rankings route structure...');

// Test if the rankings file can be loaded
try {
  const rankings = require('./routes/rankings');
  console.log('✅ Rankings route loaded successfully');
  console.log('📄 Route type:', typeof rankings);

  // Check Express app configuration
  const express = require('express');
  const app = express();

  app.use('/api/ranking', rankings);
  console.log('✅ Express app configured with rankings routes');

  // Start a test server
  const PORT = 3001;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Test server started on port ${PORT}`);

    // Test basic endpoint
    setTimeout(async () => {
      try {
        const http = require('http');

        const testEndpoint = (path) => {
          return new Promise((resolve, reject) => {
            const req = http.get(`http://localhost:${PORT}${path}`, (res) => {
              let data = '';
              res.on('data', (chunk) => (data += chunk));
              res.on('end', () => {
                resolve({ status: res.statusCode, data: data.substring(0, 100) });
              });
            });
            req.on('error', reject);
            req.setTimeout(2000, () => reject(new Error('Timeout')));
          });
        };

        console.log('\n🧪 Testing endpoints...');

        // Test Phase 3 endpoints
        const tests = [
          '/api/ranking/job-statistics',
          '/api/ranking/job-leaderboard-comparison',
          '/api/ranking/job-progression?jobType=1',
          '/api/ranking/trader',
          '/api/ranking/honor',
          '/api/ranking/top-player',
        ];

        for (const endpoint of tests) {
          try {
            const result = await testEndpoint(endpoint);
            console.log(`✅ ${endpoint}: ${result.status} - ${result.data.substring(0, 50)}...`);
          } catch (error) {
            console.log(`❌ ${endpoint}: ${error.message}`);
          }
        }
      } catch (error) {
        console.error('❌ Test error:', error.message);
      } finally {
        server.close();
        console.log('🔚 Test server stopped');
      }
    }, 1000);
  });
} catch (error) {
  console.error('❌ Failed to load rankings route:', error.message);
  console.error('Stack:', error.stack);
}
