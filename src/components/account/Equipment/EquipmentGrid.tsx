import React from "react";

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
        const item = equipment?.[slot];
        // Abstand zwischen Slot 1 und 2 = 24px
        const topMargin =
          i === 1 ? "mt-[24px]" :
          i === slots.length - 1 ? "mt-[12px]" :
          "mt-[3px]";

        return (
          <div key={i} className={`w-[48px] h-[48px] ${i > 0 ? topMargin : ""}`}>
            <img
              src={
                item
                ? `/public/image/sro/item/${item.icon}`
                : `/public/image/sro/interface/equipment/${slot}.png`
              }
              alt={slot}
              className="w-full h-full object-contain opacity-80"
            />
          </div>
        );
      })}
    </div>
  );
};