// Test script for search performance with common search terms
const {
  getPlayerRankingWithGlobalRank,
  getPlayerRankingOptimized,
} = require('./routes/ranking/playerRankings');

async function testSearchPerformanceWithCommonTerm() {
  console.log('🔍 Testing Search Performance with Common Search Terms...\n');

  const searchTerms = ['a', 'se', 'test']; // Common letters/terms that will return many results
  const limit = 50; // More results to show the real difference

  for (const searchTerm of searchTerms) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 Testing search term: "${searchTerm}"`);
    console.log('='.repeat(60));

    try {
      // Test old method
      console.log('⏱️  Testing OLD method...');
      const startOld = Date.now();
      const oldResults = await getPlayerRankingWithGlobalRank(limit, 0, {
        charName: searchTerm,
      });
      const oldTime = Date.now() - startOld;
      console.log(`✅ Old method: ${oldTime}ms (${oldResults.length} results)`);

      // Test new optimized method
      console.log('⚡ Testing NEW method...');
      const startNew = Date.now();
      const newResults = await getPlayerRankingOptimized(limit, 0, {
        charName: searchTerm,
      });
      const newTime = Date.now() - startNew;
      console.log(`✅ New method: ${newTime}ms (${newResults.length} results)`);

      // Performance comparison
      if (oldTime > newTime) {
        const improvement = (((oldTime - newTime) / oldTime) * 100).toFixed(1);
        const speedup = (oldTime / newTime).toFixed(1);
        console.log(`🚀 Improvement: ${improvement}% faster (${speedup}x speedup)`);
      } else {
        console.log('⚠️  New method is slower');
      }

      // Show sample results
      if (oldResults.length > 0 && newResults.length > 0) {
        console.log(`📊 Sample results:`);
        console.log(`   Old: ${oldResults[0].CharName} (GlobalRank: ${oldResults[0].GlobalRank})`);
        console.log(`   New: ${newResults[0].CharName} (GlobalRank: ${newResults[0].GlobalRank})`);
      }

      // If we have many results, the performance difference should be huge
      if (oldResults.length >= 10) {
        console.log(`💡 With ${oldResults.length} results, performance difference is significant!`);
      }
    } catch (error) {
      console.error(`❌ Test failed for "${searchTerm}":`, error.message);
    }
  }
}

// Run the test
testSearchPerformanceWithCommonTerm()
  .then(() => {
    console.log('\n🎉 Performance test completed!');
    console.log('\n💡 Summary: The new optimized method should show significant improvements');
    console.log('   especially when searching for common terms that return many results.');
    console.log('   Instead of running 50+ individual queries for GlobalRank calculation,');
    console.log('   we now use a single optimized query with window functions.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
