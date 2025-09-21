// Blue Stats Calculator basierend auf SRO CMS InventoryService.php
// Diese Funktion berechnet die Blue Stats (Magic Options) aus den MagParam Werten

// Umfassende Magic Options Konfiguration (basierend auf SRO CMS magopt.php)
const magicOptions = {
  // Map von Magic Option ID zu mLevel für Lookup
  0: {
    mLevel: 0,
    name: 'MATTR_DEC_MAXDUR',
    desc: 'Maximum Durability %desc% Reduce',
    type: 'special',
  },
  1: {
    mLevel: 1,
    name: 'MATTR_DEC_MAXDUR',
    desc: 'Maximum Durability %desc% Reduce',
    type: 'special',
  },
  2: {
    mLevel: 2,
    name: 'MATTR_DEC_MAXDUR',
    desc: 'Maximum Durability %desc% Reduce',
    type: 'special',
  },
  3: {
    mLevel: 3,
    name: 'MATTR_DEC_MAXDUR',
    desc: 'Maximum Durability %desc% Reduce',
    type: 'special',
  },
  4: {
    mLevel: 4,
    name: 'MATTR_DEC_MAXDUR',
    desc: 'Maximum Durability %desc% Reduce',
    type: 'special',
  },

  // STR Attributes (mLevel 1-21 unterstützt)
  5: { mLevel: 1, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  6: { mLevel: 2, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  7: { mLevel: 3, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  8: { mLevel: 4, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  9: { mLevel: 5, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  10: { mLevel: 6, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },

  11: { mLevel: 1, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  12: { mLevel: 2, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  13: { mLevel: 3, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  14: { mLevel: 4, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  15: { mLevel: 5, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  16: { mLevel: 6, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },

  // Resistances - Frostbite
  17: {
    mLevel: 1,
    name: 'MATTR_RESIST_FROSTBITE',
    desc: 'Freezing,FrostbiteHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  18: {
    mLevel: 2,
    name: 'MATTR_RESIST_FROSTBITE',
    desc: 'Freezing,FrostbiteHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  19: {
    mLevel: 3,
    name: 'MATTR_RESIST_FROSTBITE',
    desc: 'Freezing,FrostbiteHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  20: {
    mLevel: 4,
    name: 'MATTR_RESIST_FROSTBITE',
    desc: 'Freezing,FrostbiteHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  21: {
    mLevel: 5,
    name: 'MATTR_RESIST_FROSTBITE',
    desc: 'Freezing,FrostbiteHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  22: {
    mLevel: 6,
    name: 'MATTR_RESIST_FROSTBITE',
    desc: 'Freezing,FrostbiteHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },

  // Electric Shock Resistance
  23: {
    mLevel: 1,
    name: 'MATTR_RESIST_ESHOCK',
    desc: 'Electric shockHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  24: {
    mLevel: 2,
    name: 'MATTR_RESIST_ESHOCK',
    desc: 'Electric shockHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  25: {
    mLevel: 3,
    name: 'MATTR_RESIST_ESHOCK',
    desc: 'Electric shockHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  26: {
    mLevel: 4,
    name: 'MATTR_RESIST_ESHOCK',
    desc: 'Electric shockHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  27: {
    mLevel: 5,
    name: 'MATTR_RESIST_ESHOCK',
    desc: 'Electric shockHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  28: {
    mLevel: 6,
    name: 'MATTR_RESIST_ESHOCK',
    desc: 'Electric shockHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },

  // Burn Resistance
  29: {
    mLevel: 1,
    name: 'MATTR_RESIST_BURN',
    desc: 'BurnHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  30: {
    mLevel: 2,
    name: 'MATTR_RESIST_BURN',
    desc: 'BurnHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  31: {
    mLevel: 3,
    name: 'MATTR_RESIST_BURN',
    desc: 'BurnHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  32: {
    mLevel: 4,
    name: 'MATTR_RESIST_BURN',
    desc: 'BurnHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  33: {
    mLevel: 5,
    name: 'MATTR_RESIST_BURN',
    desc: 'BurnHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  34: {
    mLevel: 6,
    name: 'MATTR_RESIST_BURN',
    desc: 'BurnHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },

  // Poison Resistance
  35: {
    mLevel: 1,
    name: 'MATTR_RESIST_POISON',
    desc: 'PosioningHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  36: {
    mLevel: 2,
    name: 'MATTR_RESIST_POISON',
    desc: 'PosioningHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  37: {
    mLevel: 3,
    name: 'MATTR_RESIST_POISON',
    desc: 'PosioningHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  38: {
    mLevel: 4,
    name: 'MATTR_RESIST_POISON',
    desc: 'PosioningHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  39: {
    mLevel: 5,
    name: 'MATTR_RESIST_POISON',
    desc: 'PosioningHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  40: {
    mLevel: 6,
    name: 'MATTR_RESIST_POISON',
    desc: 'PosioningHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },

  // Zombie Resistance
  41: {
    mLevel: 1,
    name: 'MATTR_RESIST_ZOMBIE',
    desc: 'ZombieHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  42: {
    mLevel: 2,
    name: 'MATTR_RESIST_ZOMBIE',
    desc: 'ZombieHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  43: {
    mLevel: 3,
    name: 'MATTR_RESIST_ZOMBIE',
    desc: 'ZombieHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  44: {
    mLevel: 4,
    name: 'MATTR_RESIST_ZOMBIE',
    desc: 'ZombieHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  45: {
    mLevel: 5,
    name: 'MATTR_RESIST_ZOMBIE',
    desc: 'ZombieHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },
  46: {
    mLevel: 6,
    name: 'MATTR_RESIST_ZOMBIE',
    desc: 'ZombieHour %desc%% Reduce',
    type: 'resist',
    mValue: 20,
  },

  // Special Attributes - Immortal
  47: { mLevel: 1, name: 'MATTR_ATHANASIA', desc: 'Immortal (%desc% Time/times)', type: 'special' },
  48: { mLevel: 2, name: 'MATTR_ATHANASIA', desc: 'Immortal (%desc% Time/times)', type: 'special' },
  49: { mLevel: 3, name: 'MATTR_ATHANASIA', desc: 'Immortal (%desc% Time/times)', type: 'special' },
  50: { mLevel: 4, name: 'MATTR_ATHANASIA', desc: 'Immortal (%desc% Time/times)', type: 'special' },
  51: { mLevel: 5, name: 'MATTR_ATHANASIA', desc: 'Immortal (%desc% Time/times)', type: 'special' },
  52: { mLevel: 6, name: 'MATTR_ATHANASIA', desc: 'Immortal (%desc% Time/times)', type: 'special' },

  // Steady/Solid
  53: { mLevel: 1, name: 'MATTR_SOLID', desc: 'Steady (%desc% Time/times)', type: 'special' },
  54: { mLevel: 2, name: 'MATTR_SOLID', desc: 'Steady (%desc% Time/times)', type: 'special' },
  55: { mLevel: 3, name: 'MATTR_SOLID', desc: 'Steady (%desc% Time/times)', type: 'special' },
  56: { mLevel: 4, name: 'MATTR_SOLID', desc: 'Steady (%desc% Time/times)', type: 'special' },
  57: { mLevel: 5, name: 'MATTR_SOLID', desc: 'Steady (%desc% Time/times)', type: 'special' },
  58: { mLevel: 6, name: 'MATTR_SOLID', desc: 'Steady (%desc% Time/times)', type: 'special' },

  // Luck
  59: { mLevel: 1, name: 'MATTR_LUCK', desc: 'Luck (%desc% Time/times)', type: 'special' },
  60: { mLevel: 2, name: 'MATTR_LUCK', desc: 'Luck (%desc% Time/times)', type: 'special' },
  61: { mLevel: 3, name: 'MATTR_LUCK', desc: 'Luck (%desc% Time/times)', type: 'special' },
  62: { mLevel: 4, name: 'MATTR_LUCK', desc: 'Luck (%desc% Time/times)', type: 'special' },
  63: { mLevel: 5, name: 'MATTR_LUCK', desc: 'Luck (%desc% Time/times)', type: 'special' },
  64: { mLevel: 6, name: 'MATTR_LUCK', desc: 'Luck (%desc% Time/times)', type: 'special' },

  // Higher Level STR/INT (mLevel 7-12 mit mValue 6-8)
  68: { mLevel: 7, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  69: { mLevel: 8, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  70: { mLevel: 9, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  71: { mLevel: 10, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 6 },
  72: { mLevel: 11, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 8 },
  73: { mLevel: 12, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 8 },

  74: { mLevel: 7, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  75: { mLevel: 8, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  76: { mLevel: 9, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  77: { mLevel: 10, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 6 },
  78: { mLevel: 11, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 8 },
  79: { mLevel: 12, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 8 },

  // Durability (mLevel 1-12 mit mValue 160-200)
  80: {
    mLevel: 1,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  81: {
    mLevel: 2,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  82: {
    mLevel: 3,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  83: {
    mLevel: 4,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  84: {
    mLevel: 5,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  85: {
    mLevel: 6,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  86: {
    mLevel: 7,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  87: {
    mLevel: 8,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  88: {
    mLevel: 9,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  89: {
    mLevel: 10,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 160,
  },
  90: {
    mLevel: 11,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 200,
  },
  91: {
    mLevel: 12,
    name: 'MATTR_DUR',
    desc: 'Durability %desc%% Increase',
    type: 'equipment',
    mValue: 200,
  },

  // Hit Rate (mLevel 1-12 mit mValue 60)
  92: {
    mLevel: 1,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  93: {
    mLevel: 2,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  94: {
    mLevel: 3,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  95: {
    mLevel: 4,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  96: {
    mLevel: 5,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  97: {
    mLevel: 6,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  98: {
    mLevel: 7,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  99: {
    mLevel: 8,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  100: {
    mLevel: 9,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  101: {
    mLevel: 10,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  102: {
    mLevel: 11,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  103: {
    mLevel: 12,
    name: 'MATTR_HR',
    desc: 'Attack rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },

  // Evasion/Block Rate (mLevel 1-12 mit mValue 100)
  104: {
    mLevel: 1,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  105: {
    mLevel: 2,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  106: {
    mLevel: 3,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  107: {
    mLevel: 4,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  108: {
    mLevel: 5,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  109: {
    mLevel: 6,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  110: {
    mLevel: 7,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  111: {
    mLevel: 8,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  112: {
    mLevel: 9,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  113: {
    mLevel: 10,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  114: {
    mLevel: 11,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },
  115: {
    mLevel: 12,
    name: 'MATTR_EVADE_BLOCK',
    desc: 'Blocking ratio %desc%',
    type: 'combat',
    mValue: 100,
  },

  // Critical (mLevel 1-12 mit mValue 3)
  116: {
    mLevel: 1,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  117: {
    mLevel: 2,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  118: {
    mLevel: 3,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  119: {
    mLevel: 4,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  120: {
    mLevel: 5,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  121: {
    mLevel: 6,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  122: {
    mLevel: 7,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  123: {
    mLevel: 8,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  124: {
    mLevel: 9,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  125: {
    mLevel: 10,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  126: {
    mLevel: 11,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  127: {
    mLevel: 12,
    name: 'MATTR_EVADE_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },

  // Evasion Rate (mLevel 1-12 mit mValue 60)
  128: {
    mLevel: 1,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  129: {
    mLevel: 2,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  130: {
    mLevel: 3,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  131: {
    mLevel: 4,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  132: {
    mLevel: 5,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  133: {
    mLevel: 6,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  134: {
    mLevel: 7,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  135: {
    mLevel: 8,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  136: {
    mLevel: 9,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  137: {
    mLevel: 10,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  138: {
    mLevel: 11,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },
  139: {
    mLevel: 12,
    name: 'MATTR_ER',
    desc: 'Parry rate %desc%% Increase',
    type: 'combat',
    mValue: 60,
  },

  // HP (mLevel 1-12 mit mValue 850-1700)
  140: { mLevel: 1, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  141: { mLevel: 2, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  142: { mLevel: 3, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  143: { mLevel: 4, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  144: { mLevel: 5, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  145: { mLevel: 6, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  146: { mLevel: 7, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  147: { mLevel: 8, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  148: { mLevel: 9, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  149: { mLevel: 10, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 850 },
  150: { mLevel: 11, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 1700 },
  151: { mLevel: 12, name: 'MATTR_HP', desc: 'HP %desc% Increase', type: 'health', mValue: 1700 },

  // MP (mLevel 1-12 mit mValue 850-1700)
  152: { mLevel: 1, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  153: { mLevel: 2, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  154: { mLevel: 3, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  155: { mLevel: 4, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  156: { mLevel: 5, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  157: { mLevel: 6, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  158: { mLevel: 7, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  159: { mLevel: 8, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  160: { mLevel: 9, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  161: { mLevel: 10, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 850 },
  162: { mLevel: 11, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 1700 },
  163: { mLevel: 12, name: 'MATTR_MP', desc: 'MP %desc% Increase', type: 'mana', mValue: 1700 },

  // Astral, Lucky, Solid, Immortal für verschiedene Level
  212: { mLevel: 1, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  213: { mLevel: 2, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  214: { mLevel: 3, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  215: { mLevel: 4, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  216: { mLevel: 5, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  217: { mLevel: 6, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  218: { mLevel: 7, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  219: { mLevel: 8, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  220: { mLevel: 9, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  221: { mLevel: 10, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  222: { mLevel: 11, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  223: { mLevel: 12, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },

  // Critical (weitere Magic Option IDs für mLevel 1-12 mit mValue 3)
  257: {
    mLevel: 1,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  258: {
    mLevel: 2,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  259: {
    mLevel: 3,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  260: {
    mLevel: 4,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  261: {
    mLevel: 5,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  262: {
    mLevel: 6,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  263: {
    mLevel: 7,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  264: {
    mLevel: 8,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  265: {
    mLevel: 9,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  266: {
    mLevel: 10,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  267: {
    mLevel: 11,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },
  268: {
    mLevel: 12,
    name: 'MATTR_CRITICAL',
    desc: 'Critical %desc% Increase',
    type: 'combat',
    mValue: 3,
  },

  // Weitere Optionen für höhere Level (mLevel 13-21)
  591: { mLevel: 16, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 8 },
  592: { mLevel: 17, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 8 },
  593: { mLevel: 21, name: 'MATTR_STR', desc: 'Str %desc% Increase', type: 'stat', mValue: 8 },

  594: { mLevel: 16, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 8 },
  595: { mLevel: 17, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 8 },
  596: { mLevel: 21, name: 'MATTR_INT', desc: 'Int %desc% Increase', type: 'stat', mValue: 8 },

  // Special Attributes (höhere Level)
  491: {
    mLevel: 15,
    name: 'MATTR_ATHANASIA',
    desc: 'Immortal (%desc% Time/times)',
    type: 'special',
  },
  492: { mLevel: 15, name: 'MATTR_ASTRAL', desc: 'Astral (%desc% Time/times)', type: 'special' },
  493: { mLevel: 15, name: 'MATTR_LUCK', desc: 'Luck (%desc% Time/times)', type: 'special' },
  494: { mLevel: 15, name: 'MATTR_SOLID', desc: 'Steady (%desc% Time/times)', type: 'special' },
};

function calculateBlueStats(item) {
  const blueStats = [];
  const magParamNum = item.MagParamNum || 0;

  // Special handling for Astral, Lucky, Solid, Immortal (MagParam1)
  const param1 = parseInt(item.MagParam1) || 0;
  const bits = [512, 64, 8, 1];
  let remainingParam1 = param1 > 4611686018427387904 ? param1 - 4611686018427387904 : param1;

  // Check for special attributes in MagParam1
  bits.forEach((bit) => {
    const count = Math.floor(remainingParam1 / bit);
    if (count > 0) {
      remainingParam1 -= count * bit;
      let attributeName = '';
      switch (bit) {
        case 512:
          attributeName = 'MATTR_ASTRAL';
          break;
        case 64:
          attributeName = 'MATTR_LUCK';
          break;
        case 8:
          attributeName = 'MATTR_SOLID';
          break;
        case 1:
          attributeName = 'MATTR_ATHANASIA';
          break;
      }

      if (attributeName) {
        const option = Object.values(magicOptions).find((opt) => opt.name === attributeName);
        if (option) {
          blueStats.push({
            name: option.desc.replace('%desc%', count),
            value: count,
            code: attributeName,
            sortkey: option.sortkey,
          });
        }
      }
    }
  });

  // Process MagParam2 to MagParam12
  for (let i = 2; i <= Math.min(magParamNum, 12); i++) {
    const paramValue = parseInt(item[`MagParam${i}`]) || 0;

    if (paramValue <= 1) continue;

    // Special case for durability increase (value 65)
    if (paramValue === 65) {
      blueStats.push({
        name: 'Repair invalid (Maximum durability 400% increase)',
        value: 400,
        code: 'MATTR_DUR',
        sortkey: 21,
      });
      continue;
    }

    // Convert large number to hex and parse (PHP: str_pad(dechex($value), 11, '0', STR_PAD_LEFT))
    let hexParam;
    if (typeof item[`MagParam${i}`] === 'string') {
      // If it's a string representation of a large number
      const bigIntValue = BigInt(item[`MagParam${i}`]);
      hexParam = bigIntValue.toString(16).padStart(11, '0');
    } else {
      hexParam = paramValue.toString(16).padStart(11, '0');
    }

    // PHP: $id = hexdec(substr($hexParam, 3));
    // PHP: $value = hexdec(substr($hexParam, 0, 3));
    const optionId = parseInt(hexParam.substring(3), 16);
    let value = parseInt(hexParam.substring(0, 3), 16);

    const option = magicOptions[optionId];
    if (!option) continue;

    // Special handling for repair option
    if (option.name === 'MATTR_REPAIR') {
      value--;
    }

    blueStats.push({
      name: option.desc.replace('%desc%', value),
      value: value,
      code: option.name,
      sortkey: option.sortkey,
    });
  }

  // Sort by sortkey
  blueStats.sort((a, b) => a.sortkey - b.sortkey);

  return blueStats;
}

module.exports = { calculateBlueStats };
