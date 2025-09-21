// Test für White Stats Implementierung
// Diese Datei kann entfernt werden nach erfolgreichem Test

const testItemData = {
  // Beispiel-Item aus der Datenbank (Dolch)
  itemId: 12345,
  slot: 6,
  CodeName128: 'ITEM_WEAPON_SWORD_01_B_RARE',
  iconUrl: '/assets/items/01_weapon/01_sword/01_sword.png',
  optLevel: 5,
  sealType: 'Seal of Moon',
  isSealed: true,

  // White Stats von der erweiterten SQL Query
  PhysicalDefense: 712,
  MagicalDefense: 998,
  PhysicalAbsorption: 0,
  MagicalAbsorption: 0,
  HitRate: 151,
  EvasionRate: 151,
  CriticalHitRate: 2,
  MaxHP: 1853938,
  MaxMP: 0,
  RequiredLevel: 74,
  Variance: 3, // Für zukünftige Berechnungen
};

console.log('Test Item Data für Equipment Tooltip:');
console.log(JSON.stringify(testItemData, null, 2));

// Simulation der Tooltip-Anzeige
console.log('\n=== Tooltip-Anzeige Simulation ===');
console.log(`${testItemData.CodeName128} (+${testItemData.optLevel})`);
console.log(`Sealed: ${testItemData.sealType}`);
console.log('\nWhite Stats:');
if (testItemData.PhysicalDefense > 0)
  console.log(`Physical Defense: ${testItemData.PhysicalDefense}`);
if (testItemData.MagicalDefense > 0) console.log(`Magical Defense: ${testItemData.MagicalDefense}`);
if (testItemData.HitRate > 0) console.log(`Hit Rate: ${testItemData.HitRate}`);
if (testItemData.EvasionRate > 0) console.log(`Evasion Rate: ${testItemData.EvasionRate}`);
if (testItemData.CriticalHitRate > 0)
  console.log(`Critical Hit Rate: ${testItemData.CriticalHitRate}`);
if (testItemData.MaxHP > 0) console.log(`Max HP: +${testItemData.MaxHP}`);
if (testItemData.RequiredLevel > 0) console.log(`Required Level: ${testItemData.RequiredLevel}`);

module.exports = { testItemData };
