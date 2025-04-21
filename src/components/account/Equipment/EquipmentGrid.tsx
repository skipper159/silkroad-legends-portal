import React from "react";
import { getItemImagePath } from "@/lib/itemimage"; // Pfad anpassen je nach Projektstruktur

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
]
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

        const imageSrc = item?.iconUrl || `/public/image/sro/interface/equipment/${slot}.png`;
        const glowVariants = ["rare-glow-a", "rare-glow-b", "rare-glow-c"];
        const glowClass = glowVariants[Math.floor(Math.random() * glowVariants.length)];


        return (
        <div key={slot} className={`w-[48px] h-[48px] relative ${i > 0 ? topMargin : ""}`}>
        {/* Slot-Hintergrund */}
        <img
          src={`/public/image/sro/interface/equipment/${slot}.png`}
          alt={`${slot}-background`}
          className="absolute top-0 left-0 w-full h-full z-0"
        />

        {/* Itembild */}
        {item?.iconUrl && (
          <img
          src={item.iconUrl}
          alt={slot}
          className="absolute top-1/2 left-1/2 w-[32px] h-[32px] z-10 -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      )}

        {/* ✨ SOX Effekt bei Rare */}
        {item?.rarity && item.rarity !== "normal" && (
          <img
            src={`/public/image/sro/SOX.gif?rnd=${Math.floor(Math.random() * 5)}`}
            alt="Sox-Glitzer"
            className={`absolute top-1/2 left-1/2 w-[32px] h-[32px] z-20 -translate-x-1/2 -translate-y-1/2 ${glowClass}`}
          />
        )}
      </div>
        );
      })}
    </div>
  );
};