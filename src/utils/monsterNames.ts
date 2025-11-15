/**
 * Monster Name Mapping
 * Maps monster CodeNames (SN_MOB_*) to English display names
 * Based on textdata_object files from KI_Ordner
 */

export const MONSTER_NAMES: Record<string, string> = {
  // Classic Unique Monsters
  SN_MOB_RM_TAHOMET: 'Demon Shaitan',
  SN_MOB_RM_TAHOMET_L2: 'Demon Shaitan (S)',
  SN_MOB_RM_TAHOMET_L3: "GM's Demon Shaitan",
  SN_MOB_TK_BONELORD: 'Lord Yarkan',
  SN_MOB_TK_BONELORD_L2: 'Lord Yarkan (S)',
  SN_MOB_TK_BONELORD_L3: "GM's Lord Yarkan",
  SN_MOB_TQ_WHITESNAKE: 'BeakYung The White Viper',
  SN_MOB_CH_TIGERWOMAN: 'Tiger Girl',
  SN_MOB_CH_TIGERWOMAN_L2: 'Tiger Girl (S)',
  SN_MOB_CH_TIGERWOMAN_L3: "GM's Tiger Girl",

  // Jupiter Temple Monsters
  SN_MOB_JUPITER_BABILION: 'Babilion',
  SN_MOB_JUPITER_BAAL: 'Baal',
  SN_MOB_JUPITER_ANGER_FANATICISM: 'Fury Zealot',
  SN_MOB_JUPITER_MEANNESS_FANATICISM: 'Hound Zealot',
  SN_MOB_JUPITER_VAMPIRE_DEVILDOG: 'Vampire Hound',
  SN_MOB_JUPITER_VAMPIRE_WATCHDOG: 'Vampire Guard',
  SN_MOB_JUPITER_CHARM_WITCH2: 'Evil Witch',
  SN_MOB_JUPITER_METAMORPHOSIS_CT: 'Metamorphosis Zealot',
  SN_MOB_JUPITER_METAMORPHOSIS_INFECTION: 'Metamorphosis Infecter',
  SN_MOB_JUPITER_DEMON_SERPENT: 'Demon Serpent',
  SN_MOB_JUPITER_BLOOD_SERPENT: 'Blood Serpent',
  SN_MOB_JUPITER_CURSING_FANATICISM: 'Cursed Zealot',
  SN_MOB_JUPITER_DEVIL_DARK: 'Dark Demon',
  SN_MOB_JUPITER_BLOOD_WITCH2: 'Vampire Witch',
  SN_MOB_JUPITER_GREED_WATCH: 'Greed Hound',
  SN_MOB_JUPITER_DARK_DOG: 'Zielkiaxe',
  SN_MOB_JUPITER_PAIN_FANATICISM: 'Pain Zealot',
  SN_MOB_JUPITER_HELL_FANATICISM: 'Hell Zealot',
  SN_MOB_JUPITER_BAAL_DEVILDOG: "Baal's Devil Dog",
  SN_MOB_JUPITER_BAAL_WATCHDOG: "Baal's Watch Dog",
  SN_MOB_JUPITER_CHARM_WITCH: 'Evil Enchantress',
  SN_MOB_JUPITER_TRANSFORMATION_FANATICISM: 'Metamorphosis Summoner',
  SN_MOB_JUPITER_FEAR_SERPENT: 'Fear Serpent',
  SN_MOB_JUPITER_METAMORPHOSIS_FANATICISM: 'Metamorphosis Demon',
  SN_MOB_JUPITER_NIGHTMARE_SERPENT: 'Nightmare Serpent',
  SN_MOB_JUPITER_DESPAIR_FANATICISM: 'Despair Zealot',
  SN_MOB_JUPITER_DEVIL_HELL: 'Hell Demon',
  SN_MOB_JUPITER_BLOOD_WITCH: 'Vampire Enchantress',
  SN_MOB_JUPITER_DESIRE_WATCH: 'Desire Watch',
  SN_MOB_JUPITER_DARK_DOG2: 'Zielkiaxe',
  SN_MOB_JUPITER_LIFE_SEED: 'Life Seed',
  SN_MOB_JUPITER_AUTHORITY_CROWN: 'Authority Crown',
  SN_MOB_JUPITER_HEAVENLY_GODS: 'Heavenly Gods',
  SN_MOB_JUPITER_REFLECTION_SHIELD: 'Deva Shield',
  SN_MOB_JUPITER_BABILION1: 'Babilion (Clone)',
  SN_MOB_JUPITER_PROHIBITION: 'Prohibition',
  SN_MOB_JUPITER_TEMPLE_PROTECTION_CLONE: 'Temple Defend Knight',
  SN_MOB_JUPITER_TEMPLE_WATCH_CLONE: 'Temple Observer',
  SN_MOB_JUPITER_TEMPLE_GUARD_CLONE: 'Temple Keeper',
  SN_MOB_JUPITER_TEMPLE_LION_CLONE: 'Battle Lion',
  SN_MOB_JUPITER_TEMPLE_WILDLION_CLONE: 'Roaring Battle Lion',
  SN_MOB_JUPITER_FIRE_PROTECTION_CLONE: 'Ironclaw of Revenge',
  SN_MOB_JUPITER_WATER_PROTECTION_CLONE: 'Ironclaw of Warning',
  SN_MOB_JUPITER_SOUL_PROTECTION_CLONE: 'Ironclaw of Protection',
  SN_MOB_JUPITER_RUIN_WATCHER_CLONE: 'Minotaur of Distress',
  SN_MOB_JUPITER_BAAL_FANATICISM_CLONE: "Baal's Follower",
  SN_MOB_JUPITER_ANGER_FANATICISM_CLONE: "Baal's Guide",
  SN_MOB_JUPITER_CRUEL_FANATICISM_CLONE: "Baal's Prophet",
  SN_MOB_JUPITER_BAAL_CURSING_FANATICISM_CLONE: "Mutant Baal's Guide",
  SN_MOB_JUPITER_BAAL_CURSING_WATCH_CLONE: "Mutant Baal's Prophet",
  SN_MOB_JUPITER_HELL_SERPENT_CLONE: 'Gorgon',

  // Dungeon Bosses
  SN_MOB_BOSS_DUNGEON_OA_URUCHI: 'Uruchi',
  SN_MOB_BOSS_DUNGEON_EU_KERBEROS: 'Cerberus',

  // Event Monsters
  SN_MOB_EVE_HAPPY_TIGERWOMAN: 'Happy Tiger Girl',
  SN_MOB_EVE_ANGRY_TAHOMET: 'Angry Demon Shaitan',
};

/**
 * Gets the English name for a monster CodeName
 * @param codeName - The monster's CodeName (e.g., 'SN_MOB_RM_TAHOMET')
 * @returns English name or formatted CodeName if not found
 */
export function getMonsterName(codeName: string | null | undefined): string {
  if (!codeName) {
    return 'Unknown Monster';
  }

  // Check if we have a mapping for this CodeName
  if (MONSTER_NAMES[codeName]) {
    return MONSTER_NAMES[codeName];
  }

  // If no mapping found, try to format the CodeName nicely
  // Remove 'SN_MOB_' prefix and format the rest
  const formatted = codeName
    .replace('SN_MOB_', '')
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return formatted;
}

/**
 * Formats a date to a readable string
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatKillDate(date: string | Date): string {
  const killDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - killDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}
