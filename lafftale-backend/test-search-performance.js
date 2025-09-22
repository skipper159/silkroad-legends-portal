// Test script for search performance comparison
const {
  getPlayerRankingWithGlobalRank,
  getPlayerRankingOptimized,
} = require('./routes/ranking/playerRankings');

async function testSearchPerformance() {
  console.log('🔍 Testing Search Performance Comparison...\n');

  const searchTerm = 'Blubber';
  const limit = 20;

  try {
    // Test old method
    console.log('⏱️  Testing OLD method (individual GlobalRank queries)...');
    const startOld = Date.now();
    const oldResults = await getPlayerRankingWithGlobalRank(limit, 0, {
      charName: searchTerm,
    });
    const oldTime = Date.now() - startOld;
    console.log(`✅ Old method completed in: ${oldTime}ms`);
    console.log(`📊 Found ${oldResults.length} results`);
    if (oldResults.length > 0) {
      console.log(
        `🎯 First result: ${oldResults[0].CharName} - GlobalRank: ${oldResults[0].GlobalRank}`
      );
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test new optimized method
    console.log('⚡ Testing NEW optimized method (single query with GlobalRank)...');
    const startNew = Date.now();
    const newResults = await getPlayerRankingOptimized(limit, 0, {
      charName: searchTerm,
    });
    const newTime = Date.now() - startNew;
    console.log(`✅ New method completed in: ${newTime}ms`);
    console.log(`📊 Found ${newResults.length} results`);
    if (newResults.length > 0) {
      console.log(
        `🎯 First result: ${newResults[0].CharName} - GlobalRank: ${newResults[0].GlobalRank}`
      );
    }

    // Performance comparison
    console.log('\n' + '='.repeat(50));
    console.log('📈 PERFORMANCE COMPARISON:');
    console.log('='.repeat(50));
    console.log(`Old method: ${oldTime}ms`);
    console.log(`New method: ${newTime}ms`);

    if (oldTime > newTime) {
      const improvement = (((oldTime - newTime) / oldTime) * 100).toFixed(1);
      console.log(`🚀 Performance improvement: ${improvement}% faster!`);
      console.log(`⚡ Speed up: ${(oldTime / newTime).toFixed(1)}x faster`);
    } else {
      console.log('⚠️  New method is slower than expected');
    }

    // Verify results match
    console.log('\n📋 RESULT VERIFICATION:');
    console.log('='.repeat(50));
    if (oldResults.length === newResults.length) {
      console.log('✅ Result count matches');

      // Check if first few results match
      let resultsMatch = true;
      for (let i = 0; i < Math.min(3, oldResults.length, newResults.length); i++) {
        if (
          oldResults[i].CharName !== newResults[i].CharName ||
          oldResults[i].GlobalRank !== newResults[i].GlobalRank
        ) {
          resultsMatch = false;
          console.log(`❌ Mismatch at position ${i}:`);
          console.log(`   Old: ${oldResults[i].CharName} (Rank ${oldResults[i].GlobalRank})`);
          console.log(`   New: ${newResults[i].CharName} (Rank ${newResults[i].GlobalRank})`);
        }
      }

      if (resultsMatch) {
        console.log('✅ Results match perfectly!');
      }
    } else {
      console.log(`❌ Result count differs: Old=${oldResults.length}, New=${newResults.length}`);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSearchPerformance()
  .then(() => {
    console.log('\n🎉 Performance test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
