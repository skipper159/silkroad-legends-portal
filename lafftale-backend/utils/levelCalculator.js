// utils/levelCalculator.js
// Item Level Requirements Calculator based on SRO CMS logic

/**
 * Get the level requirements display string for an item
 * Based on SRO CMS InventoryService and item-blues-whites.blade.php logic
 * @param {Object} item - Item data from database
 * @returns {Array} Array of level requirement strings
 */
const getItemLevelRequirements = (item) => {
  const levelRequirements = [];

  // TypeID2 = 4 means job-related items
  if (item.TypeID2 === 4) {
    if (item.ReqLevel1) {
      levelRequirements.push(`Job level: ${item.ReqLevel1}`);
    }
  } else {
    // For other items, check regular level requirements
    if (item.ReqLevel1) {
      // TypeID3 = 9, 10 are weapons with mastery requirements
      if ([9, 10].includes(item.TypeID3)) {
        // Check mastery requirements
        if (item.ReqLevelType1 > 1) {
          const masteryName = getMasteryName(item.ReqLevelType1);
          levelRequirements.push(`Mastery level: ${masteryName} Mastery ${item.ReqLevel1}`);
        }
        if (item.ReqLevelType2 > 1) {
          const masteryName = getMasteryName(item.ReqLevelType2);
          levelRequirements.push(`Mastery level: ${masteryName} Mastery ${item.ReqLevel2}`);
        }
        if (item.ReqLevelType3 > 1) {
          const masteryName = getMasteryName(item.ReqLevelType3);
          levelRequirements.push(`Mastery level: ${masteryName} Mastery ${item.ReqLevel3}`);
        }
        if (item.ReqLevelType4 > 1) {
          const masteryName = getMasteryName(item.ReqLevelType4);
          levelRequirements.push(`Mastery level: ${masteryName} Mastery ${item.ReqLevel4}`);
        }
      } else {
        // Regular level requirement
        levelRequirements.push(`Required level: ${item.ReqLevel1}`);
      }
    }
  }

  return levelRequirements;
};

/**
 * Get mastery name by ID
 * Based on SRO CMS config/ranking.php skill_mastery configuration
 * @param {number} masteryId - Mastery type ID
 * @returns {string} Mastery name
 */
const getMasteryName = (masteryId) => {
  const masteryTypes = {
    1: 'None',
    2: 'Sword',
    3: 'Blade',
    4: 'Spear',
    5: 'Glaive',
    6: 'Bow',
    7: 'Fire',
    8: 'Cold',
    9: 'Lightning',
    10: 'Force',
    11: 'Dark',
    12: 'Shield',
    13: 'Recovery',
    14: 'Strength',
    15: 'Intelligence',
    16: 'Alchemy',
    17: 'Rogue',
    18: 'Enchant',
    19: 'Special',
    20: 'Trader',
    21: 'Thief',
    22: 'Hunter',
  };

  return masteryTypes[masteryId] || 'Unknown';
};

/**
 * Get item degree information
 * @param {Object} item - Item data
 * @returns {string|null} Degree display string
 */
const getItemDegree = (item) => {
  // TypeID2 = 1 and TypeID3 not in [13, 14] for mounting parts
  if (item.TypeID2 === 1 && ![13, 14].includes(item.TypeID3)) {
    if (item.TypeID2 === 4) {
      // Job-related items show JobDegree as Level
      return item.JobDegree ? `Level: ${item.JobDegree}` : null;
    } else if (item.TypeID2 !== 3) {
      // Other items show Degree in degrees
      return item.Degree ? `Degree: ${item.Degree} degrees` : null;
    }
  }

  return null;
};

module.exports = {
  getItemLevelRequirements,
  getItemDegree,
};
