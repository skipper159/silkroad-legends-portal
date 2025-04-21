const imageCache = new Map();

function getItemImagePath(codeName) {
  const basePath = "/public/image/sro/item";

  if (!codeName) {
    console.warn("[ImagePath] Kein CodeName übergeben.");
    return `${basePath}/unknown.jpg`;
  }

  // 🧠 Cache-Hit prüfen
  if (imageCache.has(codeName)) {
    return imageCache.get(codeName);
  }

  const cn = codeName.toUpperCase();

  const isChina = cn.startsWith("ITEM_CH_");
  const isEurope = cn.startsWith("ITEM_EU_");
  const race = isChina ? "china" : isEurope ? "europe" : "unknown";

  const isMale = cn.includes("_M_");
  const isFemale = cn.includes("_W_");
  const genderFolder = isMale ? "man_item" : isFemale ? "woman_item" : "";

  const raritySuffixes = ["_A_RARE", "_B_RARE", "_C_RARE"];
  let cleanedCode = cn;
  raritySuffixes.forEach(suffix => {
    cleanedCode = cleanedCode.replace(suffix, "");
  });

  // Waffen
  const weaponMatch = cleanedCode.match(/(SWORD|BLADE|BOW|SPEAR|TBLADE|DAGGER|CROSSBOW|STAFF|AXE|HARP|TWOHANDED|ONEHANDED)_\d+/);
  if (weaponMatch) {
    const fileName = weaponMatch[0].toLowerCase();
    const path = `${basePath}/${race}/weapon/${fileName}.jpg`;
    imageCache.set(codeName, path);
    return path;
  }

  // Schild
  const shieldMatch = cleanedCode.match(/SHIELD_\d+/);
  if (shieldMatch) {
    const fileName = shieldMatch[0].toLowerCase(); // z. B. shield_10
    const path = `${basePath}/${race}/shield/${fileName}.jpg`;
    imageCache.set(codeName, path);
    return path;
  }
  
  // Accessoires
  const accMatch = cleanedCode.match(/(RING|NECKLACE|EARRING|BELT)_\d+/);
  if (accMatch) {
    const fileName = accMatch[0].toLowerCase(); // z. B. ring_10
    const path = `${basePath}/${race}/acc/${fileName}.jpg`;
    imageCache.set(codeName, path);
    return path;
  }

  // Kleidung
  const clothingMatch = cleanedCode.match(/(HEAVY|LIGHT|CLOTHES)_(\d+)_(HA|BA|SA|AA|LA|FA|CA)/);
  if (clothingMatch && genderFolder) {
    const [, type, degree, slot] = clothingMatch;
    const fileName = `${type.toLowerCase()}_${degree}_${slot.toLowerCase()}`;
    const path = `${basePath}/${race}/${genderFolder}/${fileName}.jpg`;
    imageCache.set(codeName, path);
    return path;
  }
  // Avatar/Job-Kleidung (z. B. ITEM_CH_M_TRADE_TRADER_05)
  const jobClothingMatch = cleanedCode.match(/ITEM_(CH|EU)_(M|W)_TRADE_(TRADER|HUNTER|THIEF)_(\d+)/);
  if (jobClothingMatch) {
    const [, raceCode, gender, jobType, degree] = jobClothingMatch;
    const raceFolder = raceCode === "CH" ? "china" : "europe";
    const genderFolder = gender === "M" ? "man_item" : "woman_item";
    const fileName = `${jobType.toLowerCase()}_${degree}`;
    const path = `${basePath}/${raceFolder}/${genderFolder}/${fileName}.jpg`;
    imageCache.set(codeName, path);
    return path;
}

  // ❗ Kein Match → unknown
  console.warn(`[ImagePath] Kein Bildpfad gefunden für: ${codeName}`);
  const fallback = `${basePath}/unknown.jpg`;
  imageCache.set(codeName, fallback);
  return fallback;
}

module.exports = { getItemImagePath };
