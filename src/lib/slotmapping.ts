export function getSlotNameFromId(slotId: number): string | null {
    const map = {
      0: "equip_slot_helm",           // HA
      1: "equip_slot_mail",           // BA
      2: "equip_slot_shoulderguard",  // SA
      3: "equip_slot_gauntlet",       // AA
      4: "equip_slot_pants",          // LA
      5: "equip_slot_boots",          // FA
      6: "equip_slot_weapon",
      7: "equip_slot_shield",
      8: "equip_slot_specialdress",   // Trader Job Suit
      9: "equip_slot_earring",
      10: "equip_slot_necklace",
      11: "equip_slot_l_ring",
      12: "equip_slot_r_ring",
    };
    return map[slotId] || null;
  }