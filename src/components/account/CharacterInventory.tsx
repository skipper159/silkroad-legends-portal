import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUIElementUrl } from '@/utils/assetUtils';

interface InventoryItem {
  id: number;
  itemId: number;
  slot: number;
  amount?: number;
  plus?: number;
  name?: string;
  friendlyName?: string; // Benutzerfreundlicher Name
  iconUrl?: string;
  rarity?: 'normal' | 'rare' | 'unique' | 'legendary';
  isSpecial?: boolean;
  isSealed?: boolean;
  sealType?: string;
  optLevel?: number;
  whiteStats?: any; // White Stats Object
  blueStats?: any[]; // Blue Stats Array
  levelRequirements?: string[]; // Level-Anforderungen
  degree?: string; // Degree-Information
}

interface InventoryGridProps {
  items: InventoryItem[];
  rows?: number;
  cols?: number;
  className?: string;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ items, rows = 13, cols = 8, className = '' }) => {
  // Create a grid with all slots
  const totalSlots = rows * cols;
  const slots = Array.from({ length: totalSlots }, (_, index) => {
    const item = items.find((item) => item.slot === index);
    return { slotIndex: index, item };
  });

  const getItemQualityClass = (rarity?: string, plus?: number) => {
    if (plus && plus > 0) {
      if (plus >= 7) return 'item-plus-7';
      if (plus >= 6) return 'item-plus-6';
      if (plus >= 5) return 'item-plus-5';
      if (plus >= 4) return 'item-plus-4';
      if (plus >= 3) return 'item-plus-3';
      if (plus >= 2) return 'item-plus-2';
      if (plus >= 1) return 'item-plus-1';
    }

    switch (rarity) {
      case 'legendary':
        return 'item-legendary';
      case 'unique':
        return 'item-epic';
      case 'rare':
        return 'item-rare';
      default:
        return 'item-common';
    }
  };

  return (
    <TooltipProvider>
      <div className={`inventory-grid ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {slots.map(({ slotIndex, item }) => (
          <div
            key={slotIndex}
            className={`inventory-slot ${item ? 'equipped' : 'empty'} ${getItemQualityClass(item?.rarity, item?.plus)}`}
          >
            {item && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='sro-item-detail'>
                    {item.isSpecial && (
                      <img src={getUIElementUrl('seal.gif')} alt='Special Item' className='sro-item-special-seal' />
                    )}
                    <div className='item'>
                      <img
                        src={item.iconUrl || getUIElementUrl('man_item/clothes_11_aa_set_a.png')}
                        alt={item.name || `Item ${item.itemId || item.id}`}
                        onError={(e) => {
                          // Fallback chain for missing icons
                          const currentSrc = e.currentTarget.src;
                          if (!currentSrc.includes('clothes_11_aa_set_a.png')) {
                            e.currentTarget.src = getUIElementUrl('man_item/clothes_11_aa_set_a.png');
                          } else if (!currentSrc.includes('icon_default.png')) {
                            e.currentTarget.src = getUIElementUrl('icon_default.png');
                          }
                        }}
                      />
                      {item.amount && item.amount > 1 && <span className='amount'>{item.amount}</span>}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side='right'
                  className='bg-blue-900/90 border border-blue-400 rounded-md p-3 shadow-xl max-w-xs text-white z-50'
                >
                  {/* Itemname + Plus */}
                  <div
                    className={`text-sm font-bold ${
                      item.rarity === 'normal' && (item.optLevel || 0) === 0
                        ? 'text-white'
                        : item.rarity === 'normal'
                        ? 'text-blue-400'
                        : item.rarity === 'rare'
                        ? 'text-yellow-400'
                        : item.rarity === 'legendary'
                        ? 'text-purple-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {item.friendlyName || item.name || 'Unknown Item'}
                    {(item.optLevel || item.plus) &&
                      (item.optLevel || item.plus) > 0 &&
                      ` (+${item.optLevel || item.plus})`}
                  </div>

                  {/* Sealed Status */}
                  {item.isSealed && item.sealType !== 'Normal' && (
                    <div className='mt-2 text-sm text-yellow-300 font-bold'>{item.sealType}</div>
                  )}

                  {/* White Stats - Attack/Defense Values */}
                  {item.whiteStats && Object.keys(item.whiteStats).length > 0 && (
                    <div className='mt-2 text-sm text-white'>
                      {item.whiteStats.PhysicalAttack && (
                        <div className='text-white'>{item.whiteStats.PhysicalAttack.display}</div>
                      )}
                      {item.whiteStats.MagicalAttack && (
                        <div className='text-white'>{item.whiteStats.MagicalAttack.display}</div>
                      )}
                      {item.whiteStats.PhysicalDefense && (
                        <div className='text-white'>{item.whiteStats.PhysicalDefense.display}</div>
                      )}
                      {item.whiteStats.MagicalDefense && (
                        <div className='text-white'>{item.whiteStats.MagicalDefense.display}</div>
                      )}
                      {item.whiteStats.HitRate && <div className='text-white'>{item.whiteStats.HitRate.display}</div>}
                      {item.whiteStats.CriticalHitRate && (
                        <div className='text-white'>{item.whiteStats.CriticalHitRate.display}</div>
                      )}
                      {item.whiteStats.EvasionRate && (
                        <div className='text-white'>{item.whiteStats.EvasionRate.display}</div>
                      )}
                      {item.whiteStats.BlockRate && (
                        <div className='text-white'>{item.whiteStats.BlockRate.display}</div>
                      )}
                      {item.whiteStats.AttackRange && (
                        <div className='text-white'>{item.whiteStats.AttackRange.display}</div>
                      )}
                      {/* Accessory-specific stats */}
                      {item.whiteStats.PhysicalAbsorption && (
                        <div className='text-white'>{item.whiteStats.PhysicalAbsorption.display}</div>
                      )}
                      {item.whiteStats.MagicalAbsorption && (
                        <div className='text-white'>{item.whiteStats.MagicalAbsorption.display}</div>
                      )}
                      {item.whiteStats.PhysicalReinforce && (
                        <div className='text-white'>{item.whiteStats.PhysicalReinforce.display}</div>
                      )}
                      {item.whiteStats.MagicalReinforce && (
                        <div className='text-white'>{item.whiteStats.MagicalReinforce.display}</div>
                      )}
                      {item.whiteStats.Durability && (
                        <div className='text-white'>{item.whiteStats.Durability.display}</div>
                      )}
                    </div>
                  )}

                  {/* Blue Stats - Magic Options */}
                  {item.blueStats && item.blueStats.length > 0 && (
                    <div className='mt-2 text-sm'>
                      {item.blueStats.map((stat, index) => (
                        <div key={index} className='text-blue-300'>
                          {stat.name}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Item Degree */}
                  {item.degree && <div className='mt-2 text-sm text-gray-300'>{item.degree}</div>}

                  {/* Level Requirements */}
                  {item.levelRequirements && item.levelRequirements.length > 0 && (
                    <div className='mt-2 text-sm text-yellow-300'>
                      {item.levelRequirements.map((requirement, index) => (
                        <div key={index}>{requirement}</div>
                      ))}
                    </div>
                  )}

                  {/* Basic Item Info */}
                  <div className='mt-2 text-sm text-gray-400'>
                    Slot: {item.slot}
                    {item.amount && item.amount > 1 && (
                      <>
                        <br />
                        Amount: {item.amount}
                      </>
                    )}
                    {item.rarity && item.rarity !== 'normal' && (
                      <>
                        <br />
                        Quality: {item.rarity}
                      </>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};

interface CharacterInventoryProps {
  characterId: number;
  items: InventoryItem[];
}

export const CharacterInventory: React.FC<CharacterInventoryProps> = ({ characterId, items }) => {
  return (
    <div className='bg-theme-surface rounded-lg border border-theme-primary/20 p-4'>
      <InventoryGrid items={items} rows={13} cols={8} className='max-w-full' />
    </div>
  );
};
