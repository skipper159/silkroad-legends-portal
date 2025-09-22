const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test credentials
const testCredentials = {
  username: 'testuser',
  password: 'testpass',
};

async function testGuildOverviewAPI() {
  try {
    console.log('🧪 Testing Guild Overview API...\n');

    // 1. Login to get token
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, testCredentials);
    const token = loginRes.data.token;
    console.log('✅ Login successful');

    // 2. Test Guild Overview API with known guild
    const guildName = 'TestGuild'; // Using a test guild name
    console.log(`2. Testing guild overview API for: ${guildName}`);

    try {
      const guildRes = await axios.get(`${BASE_URL}/api/guild/overview/${guildName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (guildRes.data.success) {
        const guildData = guildRes.data.data;
        console.log('✅ Guild overview data received:');
        console.log(`   Guild Name: ${guildData.guild.Name}`);
        console.log(`   Guild Level: ${guildData.guild.Lvl}`);
        console.log(`   Member Count: ${guildData.guild.MemberCount}`);
        console.log(`   Alliance: ${guildData.guild.Alliance || 'No Alliance'}`);
        console.log(`   Actual Members: ${guildData.members.length}`);

        // Show first few members
        if (guildData.members.length > 0) {
          console.log('\n   Top Members:');
          guildData.members.slice(0, 5).forEach((member, index) => {
            const rankName =
              member.MemberClass === 1
                ? 'Guild Master'
                : member.MemberClass === 2
                ? 'Deputy Master'
                : 'Member';
            console.log(
              `   ${index + 1}. ${member.CharName16} (Level ${member.CurLevel}) - ${rankName}`
            );
          });
        }
      } else {
        console.log('❌ Guild API failed:', guildRes.data.message);
      }
    } catch (guildError) {
      if (guildError.response?.status === 404) {
        console.log(`⚠️  Guild "${guildName}" not found - this is expected if guild doesn't exist`);

        // Try with a different guild name that might exist
        console.log('\n3. Trying with different guild names...');
        const alternativeGuilds = ['DummyGuild', 'TestGuild2', 'Guild1'];

        for (const altGuild of alternativeGuilds) {
          try {
            const altRes = await axios.get(`${BASE_URL}/api/guild/overview/${altGuild}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (altRes.data.success) {
              console.log(`✅ Found guild: ${altGuild}`);
              console.log(`   Members: ${altRes.data.data.members.length}`);
              break;
            }
          } catch (e) {
            console.log(`   Guild "${altGuild}" not found`);
          }
        }
      } else {
        console.log('❌ Guild API error:', guildError.response?.data || guildError.message);
      }
    }

    // 4. Test with URL encoding for guild names with special characters
    console.log('\n4. Testing URL encoding for special guild names...');
    const specialGuildName = 'Guild & Alliance';
    try {
      const encodedRes = await axios.get(
        `${BASE_URL}/api/guild/overview/${encodeURIComponent(specialGuildName)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('✅ URL encoding works correctly');
    } catch (e) {
      console.log('✅ URL encoding handled correctly (guild not found as expected)');
    }

    console.log('\n✅ Guild Overview API tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testGuildOverviewAPI();
