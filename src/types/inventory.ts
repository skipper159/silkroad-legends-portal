export interface InventoryItem {
  id: number;
  icon: string; // Pfad zur PNG im public-Ordner
  name: string;
  friendlyName?: string; // Benutzerfreundlicher Name aus _Rigid_ItemNameDesc
  levelRequirements?: string[]; // Level-Anforderungen
  degree?: string; // Degree-Information
  stats: Record<string, string>;
}

export interface CharacterOverviewProps {
  characterId: number;
}
