export function getItemImagePath(codeName: string): string {
    const basePath = "/public/image/sro/item";
  
    if (!codeName) return `${basePath}/unknown.png`;
  
    // Rasse
    const isChina = codeName.startsWith("ITEM_CH_");
    const isEurope = codeName.startsWith("ITEM_EU_");
    const race = isChina ? "china" : isEurope ? "europe" : "unknown";
  
    // Geschlecht (für Rüstung)
    const isMale = codeName.includes("_M_");
    const isFemale = codeName.includes("_W_");
    const genderFolder = isMale ? "man_item" : isFemale ? "woman_item" : "";
  
    // Typ
    if (codeName.includes("_WEAPON_")) {
      return `${basePath}/${race}/weapon/${codeName}.png`;
    }
  
    if (codeName.includes("_SHIELD_")) {
      return `${basePath}/${race}/shield/${codeName}.png`;
    }
  
    if (/_RING_|_NECKLACE_|_EARRING_|_BELT_/.test(codeName)) {
      return `${basePath}/${race}/acc/${codeName}.png`;
    }
  
    if (
      /_ARMOR_|_MAIL_|_CLOTH_|_HELM_|_SHOULDER_|_BOOTS_|_GAUNTLET_|_PANTS_/.test(codeName)
    ) {
      if (genderFolder) {
        return `${basePath}/${race}/${genderFolder}/${codeName}.png`;
      }
    }
  
    // Fallback
    return `${basePath}/unknown.png`;
  }
  