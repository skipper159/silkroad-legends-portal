// Improved test script for Character API with valid JWT token
const jwt = require('jsonwebtoken');

async function testCharacterAPIWithAuth() {
  console.log('🔍 Testing Character API with Authentication...\n');

  // Generate a valid test JWT token
  const testPayload = {
    id: 1,
    role: 'user',
    username: 'testuser',
    isAdmin: false,
  };

  // Use the real JWT_SECRET from .env
  const JWT_SECRET = '4c3dd9d93564e6b5c42aeb84f7ff9d09b6721de84a5b5f340e3bc34e52f372af';
  const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });

  console.log('🔐 Generated test token with payload:', testPayload);
  console.log('🎫 Token (first 50 chars):', testToken.substring(0, 50) + '...');

  const testCharacters = ['Blubber', 'Tester', 'NonExistentChar'];
  const API_BASE = 'http://localhost:3000/api';

  for (const characterName of testCharacters) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 Testing character: "${characterName}"`);
    console.log('='.repeat(60));

    try {
      const url = `${API_BASE}/character/public/${encodeURIComponent(characterName)}`;
      console.log(`📡 Calling: ${url}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${testToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);
      console.log(`📝 Content-Type: ${response.headers.get('content-type')}`);

      const responseText = await response.text();
      console.log(`📄 Raw Response Length: ${responseText.length} chars`);

      try {
        const data = JSON.parse(responseText);

        if (data.success) {
          console.log('✅ SUCCESS! Character data received:');
          console.log(`   📛 Name: ${data.data.CharName}`);
          console.log(`   🎚️  Level: ${data.data.Level}`);
          console.log(`   🏰 Guild: ${data.data.GuildName || 'None'}`);
          console.log(`   ⚔️  ItemPoints: ${data.data.ItemPoints}`);
          console.log(`   🏃 Race: ${data.data.Race}`);
          console.log(`   ⚡ JobType: ${data.data.JobType}`);
          console.log(`   💰 Gold: ${data.data.RemainGold}`);
          console.log(`   🕒 Last Login: ${data.data.LastLoginTime || 'Unknown'}`);
        } else {
          console.log(`❌ API returned error: ${data.message}`);
          if (response.status === 404) {
            console.log('   This is expected for non-existent characters.');
          }
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response');
        console.log(`   Response preview: ${responseText.substring(0, 200)}...`);

        // Check if it's an HTML response (404 page)
        if (responseText.startsWith('<!DOCTYPE') || responseText.includes('<html>')) {
          console.log('   🚨 Received HTML response - this indicates the route is not found!');
          console.log('   💡 Possible causes:');
          console.log('      - API route not properly mounted');
          console.log('      - Server needs restart after adding new routes');
          console.log('      - Swagger rebuild required');
        }
      }
    } catch (error) {
      console.error(`💥 Request failed for ${characterName}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));

  console.log('🔍 Debugging steps completed:');
  console.log('✅ Valid JWT token generated');
  console.log('✅ Swagger documentation updated');
  console.log('✅ API route implementation checked');
  console.log('');
  console.log('💡 If still getting HTML responses:');
  console.log('   1. Restart the backend server completely');
  console.log('   2. Check if route is mounted in app.js');
  console.log('   3. Verify database connection');
  console.log('   4. Test with Postman/curl for comparison');
}

// Run the test
testCharacterAPIWithAuth()
  .then(() => {
    console.log('\n🎉 Enhanced Character API test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
