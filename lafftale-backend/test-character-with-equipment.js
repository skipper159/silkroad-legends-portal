const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test credentials
const testCredentials = {
  username: 'testuser',
  password: 'testpass',
};

async function testCharacterWithEquipment() {
  try {
    console.log('🧪 Testing Enhanced Character API with Equipment/Inventory...\n');

    // 1. Login to get token
    console.log('1. Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, testCredentials);
    const token = loginRes.data.token;
    console.log('✅ Login successful');

    // 2. Test Character API with known character
    const characterName = 'Blubber'; // Using known test character
    console.log(`2. Testing character API for: ${characterName}`);

    const characterRes = await axios.get(`${BASE_URL}/api/character/public/${characterName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (characterRes.data.success) {
      const character = characterRes.data.data;
      console.log('✅ Character data received:');
      console.log(`   Name: ${character.CharName}`);
      console.log(`   ID: ${character.id}`);
      console.log(`   Level: ${character.Level}`);
      console.log(`   Race: ${character.Race}`);
      console.log(`   Strength: ${character.Strength}`);
      console.log(`   Intellect: ${character.Intellect}`);
      console.log(`   HP: ${character.HP}`);
      console.log(`   MP: ${character.MP}`);
      console.log(`   Item Points: ${character.ItemPoints}`);
      console.log(`   Guild: ${character.GuildName}`);

      // 3. Test Equipment API if character ID is available
      if (character.id) {
        console.log('\n3. Testing Equipment API...');
        try {
          const equipmentRes = await axios.get(
            `${BASE_URL}/api/characters/inventory/${character.id}?min=0&max=12`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log(`✅ Equipment API works - Found ${equipmentRes.data.length} equipment items`);

          // Show first few equipment items
          equipmentRes.data.slice(0, 3).forEach((item) => {
            console.log(
              `   Slot ${item.slot}: ${item.name || 'Unknown Item'} (ID: ${item.itemId})`
            );
          });
        } catch (equipError) {
          console.log('❌ Equipment API error:', equipError.response?.data || equipError.message);
        }

        // 4. Test Inventory API
        console.log('\n4. Testing Inventory API...');
        try {
          const inventoryRes = await axios.get(
            `${BASE_URL}/api/characters/inventory/${character.id}?min=13&max=108`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log(`✅ Inventory API works - Found ${inventoryRes.data.length} inventory items`);

          // Show first few inventory items
          inventoryRes.data.slice(0, 3).forEach((item) => {
            console.log(
              `   Slot ${item.slot}: ${item.name || 'Unknown Item'} (Amount: ${item.amount || 1})`
            );
          });
        } catch (invError) {
          console.log('❌ Inventory API error:', invError.response?.data || invError.message);
        }
      } else {
        console.log('⚠️  No character ID available - Equipment/Inventory APIs cannot be tested');
      }
    } else {
      console.log('❌ Character API failed:', characterRes.data.message);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testCharacterWithEquipment();
