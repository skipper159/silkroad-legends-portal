export interface InventoryItem {
    id: number;
    icon: string;          // Pfad zur PNG im public-Ordner
    name: string;
    stats: Record<string, string>;
  }
  
  export interface CharacterOverviewProps {
    characterId: number;
  }