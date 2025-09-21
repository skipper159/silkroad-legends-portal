// utils/itemUtils.ts
import { getItemIconUrl } from './assetUtils';

/**
 * Mapping der ItemID zu Icon-Pfaden basierend auf SRO Item-System
 * Dies ist eine vereinfachte Version - in einem realen System würde man
 * eine Datenbank oder JSON-Datei mit allen Item-Informationen haben
 */

interface ItemInfo {
  iconPath: string;
  name?: string;
  category?: string;
  rarity?: 'normal' | 'rare' | 'unique' | 'legendary';
}

/**
 * Get item icon URL based on iconPath from database
 * @param iconPath - The iconPath from _RefObjCommon.AssocFileIcon128 (already processed)
 * @returns Complete URL to the item icon
 */
export const getItemIconByPath = (iconPath: string): string => {
  if (!iconPath || iconPath === 'xxx') {
    return getItemIconUrl('common', 'man_item/clothes_11_aa_set_a.png');
  }

  // iconPath comes from database like: "item\europe\man_item\clothes_09_aa.png"
  // First, normalize all backslashes to forward slashes
  let cleanPath = iconPath.replace(/\\/g, '/');

  // Remove 'item/' prefix if present (our structure doesn't have it)
  if (cleanPath.startsWith('item/')) {
    cleanPath = cleanPath.substring(5); // Remove 'item/'
  }

  // Handle COS items (they're in etc/ folder in our structure)
  if (cleanPath.startsWith('cos/')) {
    cleanPath = cleanPath.replace(/^cos\//, '');
    return getItemIconUrl('etc', cleanPath);
  }

  return getItemIconUrl('', cleanPath); // No category prefix needed as it's in the path
};

/**
 * Legacy function - kept for compatibility
 */
export const getItemIconByID = (itemId: string | number): string => {
  return getItemIconUrl('common', 'man_item/clothes_11_aa_set_a.png');
};

/**
 * Get item information based on ItemID
 * @param itemData - The item data from the API (now includes more details)
 * @returns Item information object
 */
export const getItemInfo = (itemData: any): ItemInfo => {
  // itemData now comes with iconPath and detailed info from the API
  const itemId = itemData.itemId || itemData.id;
  const iconPath = itemData.iconPath;
  const codeName = itemData.CodeName128 || '';
  const soxType = itemData.soxType || 'Normal';

  if (!itemId) {
    return {
      iconPath: getItemIconUrl('common', 'man_item/clothes_11_aa_set_a.png'),
      name: 'Unknown Item',
      category: 'common',
      rarity: 'normal',
    };
  }

  const id = String(itemId);
  let category = 'common';
  let name = codeName || `Item ${id}`;
  let rarity: 'normal' | 'rare' | 'unique' | 'legendary' = 'normal';

  // Determine rarity based on soxType from backend
  if (soxType && soxType !== 'Normal') {
    if (soxType.includes('Nova')) {
      rarity = 'legendary';
    } else if (soxType.includes('Star') || soxType.includes('Moon') || soxType.includes('Sun')) {
      rarity = 'rare';
    }
  }

  // Use the iconPath from database to determine item info
  if (iconPath) {
    if (iconPath.includes('europe')) {
      category = 'europe';
      // Clean up CodeName for better display
      if (codeName.startsWith('ITEM_EU_')) {
        name = codeName.replace('ITEM_EU_', '').replace(/_/g, ' ');
      } else {
        name = `European Item ${id}`;
      }
    } else if (iconPath.includes('china')) {
      category = 'china';
      if (codeName.startsWith('ITEM_CH_')) {
        name = codeName.replace('ITEM_CH_', '').replace(/_/g, ' ');
      } else {
        name = `Chinese Item ${id}`;
      }
    } else if (iconPath.includes('cos')) {
      category = 'cos';
      if (codeName.startsWith('ITEM_COS_')) {
        name = codeName.replace('ITEM_COS_', '').replace(/_/g, ' ');
      } else {
        name = `COS Item ${id}`;
      }
      rarity = 'unique';
    } else if (iconPath.includes('etc')) {
      category = 'etc';
      if (codeName.includes('potion')) {
        name = codeName.includes('hp') ? 'HP Potion' : 'MP Potion';
      } else if (codeName.includes('scroll')) {
        name = 'Scroll';
      } else {
        name = codeName.replace('ITEM_ETC_', '').replace(/_/g, ' ');
      }
    }
  }

  return {
    iconPath: iconPath
      ? getItemIconByPath(iconPath)
      : getItemIconUrl('common', 'man_item/clothes_11_aa_set_a.png'),
    name,
    category,
    rarity,
  };
};

/**
 * Transform inventory data from API to include icon URLs
 * @param inventoryData - Raw inventory data from API
 * @returns Transformed inventory data with icon URLs
 */
export const transformInventoryData = (inventoryData: any[]): any[] => {
  return inventoryData.map((item) => {
    const itemInfo = getItemInfo(item); // Pass the whole item object now

    return {
      ...item,
      iconUrl: itemInfo.iconPath,
      name: itemInfo.name,
      friendlyName: item.friendlyName, // Benutzerfreundlicher Name
      category: itemInfo.category,
      rarity: itemInfo.rarity,
      isSealed: item.soxType && item.soxType !== 'Normal', // Add sealed status
      sealType: item.soxType || 'Normal', // Add seal type
      optLevel: item.OptLevel || 0, // Enhancement level
      amount: item.amount || 0, // Stack amount for consumables
      whiteStats: item.whiteStats, // White Stats Object
      blueStats: item.blueStats, // Blue Stats Array
      levelRequirements: item.levelRequirements, // Level-Anforderungen
      degree: item.degree, // Degree-Information
    };
  });
};
