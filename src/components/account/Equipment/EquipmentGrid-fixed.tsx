import React from "react";
import { getItemImagePath } from "@/lib/itemimage"; // Pfad anpassen je nach Projektstruktur
import { getInterfaceUrl, getAssetUrl } from "@/utils/assetUtils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface EquipmentGridProps {
  side: "left" | "right";
  equipment: Record<string, any>;
}

const slotMap = {
  left: [
    "equip_slot_weapon",
    "equip_slot_helm",
    "equip_slot_mail",
    "equip_slot_pants",
    "equip_slot_earring",
    "equip_slot_l_ring",
    "equip_slot_avata_button",
  ],
  right: [
    "equip_slot_shield",
    "equip_slot_shoulderguard",
    "equip_slot_gauntlet",
    "equip_slot_boots",
    "equip_slot_necklace",
    "equip_slot_r_ring",
    "equip_slot_specialdress",
  ],
};

export const EquipmentGrid: React.FC<EquipmentGridProps> = ({ side, equipment }) => {
  const slots = slotMap[side];

  return (
    <div className="flex flex-col">
      {slots.map((slot, i) => {
        const item = equipment?.[slot]; // Item-Daten aus Backend
        const topMargin =
          i === 1 ? "mt-[24px]" :
          i === slots.length - 1 ? "mt-[12px]" :
          "mt-[3px]";

        const imageSrc = item?.iconUrl || getInterfaceUrl('equipment', `${slot}.PNG`);
        const glowVariants = ["rare-glow-a", "rare-glow-b", "rare-glow-c"];
        const glowClass = glowVariants[Math.floor(Math.random() * glowVariants.length)];

        return (
          <div key={slot} className={`w-[48px] h-[48px] relative ${i > 0 ? topMargin : ""}`}>
            {/* Slot-Hintergrund */}
            <img
              src={getInterfaceUrl('equipment', `${slot}.PNG`)}
              alt={`${slot}-background`}
              className="absolute top-0 left-0 w-full h-full z-0"
            />

            {/* Itembild mit Tooltip */}
            {item?.iconUrl && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <img
                      src={item.iconUrl}
                      alt={slot}
                      className="absolute top-1/2 left-1/2 w-[32px] h-[32px] z-10 -translate-x-1/2 -translate-y-1/2 object-contain cursor-help"
                    />
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="bg-blue-900/80 border border-blue-400 rounded-md p-3 shadow-lg max-w-xs text-white"
                  >
                    {/* Itemname + Plus */}
                    <div className={`text-sm font-bold ${
                      item.rarity === 'normal' && item.optLevel === 0
                        ? 'text-white'
                        : item.rarity === 'normal'
                        ? 'text-blue-400'
                        : item.rarity === 'rare'
                        ? 'text-yellow-400'
                        : item.rarity === 'legendary'
                        ? 'text-purple-400'
                        : 'text-amber-400'
                    }`}>
                      {item.name || item.CodeName128}{item.optLevel > 0 ? ` (+${item.optLevel})` : ""}
                    </div>

                    {/* Sealed Status */}
                    {item.isSealed && item.sealType !== 'Normal' && (
                      <div className="mt-2 text-sm text-yellow-300 font-bold">
                        {item.sealType}
                      </div>
                    )}

                    {/* White Stats - Attack/Defense Values */}
                    {(item.PhysicalDefense > 0 || item.MagicalDefense > 0 || item.HitRate > 0) && (
                      <div className="mt-2 text-sm text-white">
                        {item.PhysicalDefense > 0 && (
                          <div>Physical Defense: <span className="text-green-300">{item.PhysicalDefense}</span></div>
                        )}
                        {item.MagicalDefense > 0 && (
                          <div>Magical Defense: <span className="text-blue-300">{item.MagicalDefense}</span></div>
                        )}
                        {item.PhysicalAbsorption > 0 && (
                          <div>Physical Absorption: <span className="text-red-300">{item.PhysicalAbsorption}</span></div>
                        )}
                        {item.MagicalAbsorption > 0 && (
                          <div>Magical Absorption: <span className="text-purple-300">{item.MagicalAbsorption}</span></div>
                        )}
                        {item.HitRate > 0 && (
                          <div>Hit Rate: <span className="text-yellow-300">{item.HitRate}</span></div>
                        )}
                        {item.EvasionRate > 0 && (
                          <div>Evasion Rate: <span className="text-cyan-300">{item.EvasionRate}</span></div>
                        )}
                        {item.CriticalHitRate > 0 && (
                          <div>Critical Hit Rate: <span className="text-orange-300">{item.CriticalHitRate}</span></div>
                        )}
                        {item.MaxHP > 0 && (
                          <div>Max HP: <span className="text-red-400">+{item.MaxHP}</span></div>
                        )}
                        {item.MaxMP > 0 && (
                          <div>Max MP: <span className="text-blue-400">+{item.MaxMP}</span></div>
                        )}
                      </div>
                    )}

                    {/* Level Requirement */}
                    {item.RequiredLevel > 0 && (
                      <div className="mt-2 text-sm text-gray-300">
                        Required Level: <span className="text-yellow-300">{item.RequiredLevel}</span>
                      </div>
                    )}

                    {/* Basic Item Info */}
                    <div className="mt-2 text-sm text-gray-400">
                      Item ID: {item.itemId}<br />
                      Slot: {item.slot}<br />
                      {item.amount > 0 && <>Amount: {item.amount}<br /></>}
                    </div>
                  </TooltipContent>
                </Tooltip>
              
                {/* Sealed Effect für sealed Items */}
                {item?.isSealed && item.sealType !== 'Normal' && (
                  <img
                    src={getAssetUrl('assets/ui/seal.gif')}
                    alt="Sealed Effect"
                    className="absolute top-1/2 left-1/2 w-[32px] h-[32px] z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};