// config/ranking.js - SRO-CMS compatible ranking configuration
module.exports = {
  // Cache Settings
  cache: {
    ttl: 60 * 60, // 1 hour in seconds
    keyPrefix: 'lafftale_ranking',
    enabled: true,
    ranking_player: 60, // minutes
    ranking_guild: 60,
    ranking_unique: 30,
    ranking_honor: 120,
    ranking_fortress: 30,
    ranking_job: 60,
    ranking_item: 60,
    character_info: 1440, // 24 hours
    guild_info: 720, // 12 hours
  },

  // Main ranking menu configuration
  menu: {
    ranking_player: {
      enabled: true,
      name: 'Player',
      route: '/api/rankings/top-player',
      icon: 'trophy',
      description: 'Top players by level and experience',
    },
    ranking_guild: {
      enabled: true,
      name: 'Guild',
      route: '/api/rankings/top-guild',
      icon: 'users',
      description: 'Top guilds by level and members',
    },
    ranking_unique: {
      enabled: true,
      name: 'Unique',
      route: '/api/rankings/unique',
      icon: 'gem',
      description: 'Unique monster kill rankings',
    },
    ranking_unique_monthly: {
      enabled: true,
      name: 'Monthly Unique',
      route: '/api/rankings/unique-monthly',
      icon: 'calendar',
      description: 'Monthly unique monster kills',
    },
    ranking_honor: {
      enabled: true,
      name: 'Honor',
      route: '/api/rankings/honor',
      icon: 'crown',
      description: 'Honor point rankings',
    },
    ranking_fortress_player: {
      enabled: true,
      name: 'Fortress',
      route: '/api/rankings/fortress-player',
      icon: 'castle',
      description: 'Fortress war player rankings',
    },
    ranking_fortress_guild: {
      enabled: true,
      name: 'Guild Wars',
      route: '/api/rankings/fortress-guild',
      icon: 'shield',
      description: 'Fortress war guild rankings',
    },
    ranking_pvp_kd: {
      enabled: true,
      name: 'PvP K/D',
      route: '/api/rankings/pvp-kd',
      icon: 'target',
      description: 'PvP kill/death ratios',
    },
    ranking_job_kd: {
      enabled: true,
      name: 'Job K/D',
      route: '/api/rankings/job-kd',
      icon: 'swords',
      description: 'Job kill/death ratios',
    },
    ranking_item_plus: {
      enabled: true,
      name: 'Enhanced Items',
      route: '/api/rankings/item-plus',
      icon: 'star',
      description: 'Item enhancement rankings',
    },
    ranking_item_drop: {
      enabled: true,
      name: 'Rare Drops',
      route: '/api/rankings/item-drop',
      icon: 'gift',
      description: 'Rare item drop rankings',
    },

    // Legacy menu items for compatibility
    player: {
      enabled: true,
      name: 'Player Ranking',
      icon: 'fa fa-users',
      route: '/rankings/top-player',
      description: 'Top players by level and equipment',
    },
    trader: {
      enabled: true,
      name: 'Trader Ranking',
      icon: 'fa fa-shopping-cart',
      route: '/rankings/trader',
      description: 'Top traders by level',
    },
    honor: {
      enabled: true,
      name: 'Honor Ranking',
      icon: 'fa fa-star',
      route: '/rankings/honor',
      description: 'Honor warriors ranking',
    },
    pvp: {
      enabled: true,
      name: 'PvP Ranking',
      icon: 'fa fa-sword',
      route: '/rankings/pvp',
      description: 'Player vs Player kill rankings',
    },
    fortress: {
      enabled: true,
      name: 'Fortress Ranking',
      icon: 'fa fa-castle',
      route: '/rankings/fortress-players',
      description: 'Fortress war participants',
    },
    guild: {
      enabled: true,
      name: 'Guild Ranking',
      icon: 'fa fa-users',
      route: '/rankings/guild',
      description: 'Top guilds by members and level',
    },
    unique: {
      enabled: true,
      name: 'Unique Kills',
      icon: 'fa fa-dragon',
      route: '/rankings/unique',
      description: 'Unique monster hunting',
    },
    job_analytics: {
      enabled: true,
      name: 'Job Analytics',
      icon: 'fa fa-chart-bar',
      route: '/rankings/job-statistics',
      description: 'Advanced job statistics and analysis',
    },
  },

  // Job-specific ranking menu
  job_menu: {
    ranking_job_all: {
      enabled: true,
      name: 'All Jobs',
      route: '/api/rankings/job-kd',
      jobType: null,
    },
    ranking_job_hunters: {
      enabled: true,
      name: 'Hunters',
      route: '/api/rankings/hunter',
      jobType: 1,
    },
    ranking_job_thieves: {
      enabled: true,
      name: 'Thieves',
      route: '/api/rankings/thief',
      jobType: 2,
    },
    ranking_job_traders: {
      enabled: false,
      name: 'Traders',
      route: '/api/rankings/trader',
      jobType: 3,
    }, // Deaktiviert wie in SRO-CMS
  },

  // Job Menu Configuration (Legacy)
  jobMenu: {
    all: {
      enabled: true,
      name: 'All Jobs',
      route: '/rankings/job-progression',
      description: 'All job types comparison',
    },
    trader: {
      enabled: true,
      name: 'Traders',
      route: '/rankings/trader',
      jobType: 1,
      description: 'Merchant and trading specialists',
    },
    thief: {
      enabled: true,
      name: 'Thieves',
      route: '/rankings/thief',
      jobType: 2,
      description: 'Stealth and thievery experts',
    },
    hunter: {
      enabled: true,
      name: 'Hunters',
      route: '/rankings/hunter',
      jobType: 3,
      description: 'Combat and hunting specialists',
    },
  },

  // Unique monster configuration with point values (based on SRO-CMS ranking.php)
  uniques: {
    MOB_CH_TIGERWOMAN: {
      id: 1954,
      name: 'Tiger Girl',
      points: 1,
      location: 'Jangan',
      difficulty: 'Easy',
    },
    MOB_RM_ROC: {
      id: 3877,
      name: 'Roc',
      points: 15,
      location: 'Taklamakan Desert',
      difficulty: 'Legendary',
    },
    MOB_RM_ISYUTARU: {
      id: 2905,
      name: 'Isyutaru',
      points: 8,
      location: 'Taklamakan Desert',
      difficulty: 'Hard',
    },
    MOB_RM_URUCHI: {
      id: 2957,
      name: 'Uruchi',
      points: 10,
      location: 'Taklamakan Desert',
      difficulty: 'Very Hard',
    },
    MOB_EU_CAPTIVY: {
      id: 14466,
      name: 'Captain Ivy',
      points: 20,
      location: 'Constantinople',
      difficulty: 'Legendary',
    },
    MOB_CH_BLACKWOODSPIDER: {
      id: 1982,
      name: 'Blackwood Spider',
      points: 3,
      location: 'Donwhang',
      difficulty: 'Medium',
    },
    MOB_RM_CERBERUS: {
      id: 6035,
      name: 'Cerberus',
      points: 12,
      location: 'Flame Mountain',
      difficulty: 'Very Hard',
    },
    MOB_EU_MEDUSA: {
      id: 14468,
      name: 'Medusa',
      points: 18,
      location: 'Alexandria',
      difficulty: 'Legendary',
    },
  },

  // Character model ID to race/gender mapping (based on SRO-CMS)
  character_image: {
    // Chinese Race
    14717: { race: 'chinese', gender: 'male', image: '1_m.png' },
    14718: { race: 'chinese', gender: 'female', image: '1_f.png' },

    // European Race
    14719: { race: 'european', gender: 'male', image: '2_m.png' },
    14720: { race: 'european', gender: 'female', image: '2_f.png' },

    // Additional character models
    1907: { race: 'chinese', gender: 'male', image: 'warrior_m.png' },
    1908: { race: 'chinese', gender: 'female', image: 'warrior_f.png' },
    1909: { race: 'chinese', gender: 'male', image: 'rogue_m.png' },
    1910: { race: 'chinese', gender: 'female', image: 'rogue_f.png' },

    14650: { race: 'european', gender: 'male', image: 'knight_m.png' },
    14651: { race: 'european', gender: 'female', image: 'knight_f.png' },
    14652: { race: 'european', gender: 'male', image: 'wizard_m.png' },
    14653: { race: 'european', gender: 'female', image: 'wizard_f.png' },
  },

  // VIP level configuration
  vip_level: {
    level_access: 4,
    level: {
      0: { name: 'Normal', image: '', color: '#ffffff' },
      1: { name: 'Iron', image: 'viplevel_1.jpg', color: '#c0c0c0' },
      2: { name: 'Bronze', image: 'viplevel_2.jpg', color: '#cd7f32' },
      3: { name: 'Silver', image: 'viplevel_3.jpg', color: '#c0c0c0' },
      4: { name: 'Gold', image: 'viplevel_4.jpg', color: '#ffd700' },
      5: { name: 'Platinum', image: 'viplevel_5.jpg', color: '#e5e4e2' },
      6: { name: 'VIP', image: 'viplevel_6.jpg', color: '#ff6b6b' },
    },
  },

  // Guild authority levels (based on SRO-CMS)
  guild_authority: {
    1: 'Leader',
    2: 'Deputy Commander',
    4: 'Fortress War Administrator',
    8: 'Production Administrator',
    16: 'Training Administrator',
    32: 'Military Engineer',
    64: 'Union Administrator',
    128: 'Member',
  },

  // Hwan level titles by race
  hwan_level: {
    chinese: {
      1: 'Captain',
      2: 'General',
      3: 'Senior General',
      4: 'Chief General',
      5: 'Vice Lord',
      6: 'General Lord',
      7: 'Lord',
      8: 'King',
    },
    european: {
      1: 'Knight',
      2: 'Baronet',
      3: 'Baron',
      4: 'Count',
      5: 'Marquis',
      6: 'Duke',
      7: 'Prince',
      8: 'King',
    },
  },

  // Skill mastery names by race
  skill_mastery: {
    chinese: {
      1: 'Blade',
      2: 'Glavie',
      3: 'Bow',
      4: 'Sword',
      5: 'Spear',
      6: 'Axe',
      7: 'Cold',
      8: 'Lightning',
      9: 'Fire',
      10: 'Force',
      11: 'Recovery',
    },
    european: {
      1: 'Warrior',
      2: 'Wizard',
      3: 'Rogue',
      4: 'Warlock',
      5: 'Bard',
      6: 'Cleric',
      7: 'Assassin',
      8: 'Archer',
    },
  },

  // Hidden Players/Guilds (Admin configurable)
  hidden: {
    characters: [
      '[GM]Eva',
      '[GM]m1xawy',
      '[Admin]',
      'TestChar',
      'DevAccount',
      '[GM]Admin',
      '[TEST]Character',
      'SystemBot',
    ],
    guilds: ['RigidStaff', 'AdminGuild', 'TestGuild', 'GmGuild', 'SystemGuild'],
  },

  // Extra features configuration
  extra: {
    character_status: false,
    advanced_unique_ranking: true,
    kill_logs: {
      pvp: true,
      job: true,
    },
    item_logs: {
      plus: {
        enabled: true,
        plus: 8,
        degree: 8,
        type: 'Seal of Sun', // Seal of Star, Seal of Moon, Seal of Sun, Seal of roc
      },
      drop: {
        enabled: true,
        degree: 8,
        type: 'Seal of Sun',
      },
    },
    fortress_war: {
      enabled: true,
      show_history: true,
      history_limit: 50,
    },
    guild_wars: {
      enabled: true,
      show_statistics: true,
    },
  },

  // Race Configuration (Legacy)
  characterRace: {
    0: { name: 'Chinese Male', flag: 'cn', color: '#FF6B6B' },
    1: { name: 'Chinese Female', flag: 'cn', color: '#FF6B6B' },
    2: { name: 'European Male', flag: 'eu', color: '#4ECDC4' },
    3: { name: 'European Female', flag: 'eu', color: '#4ECDC4' },
  },

  // Job Type Configuration
  jobType: {
    0: { name: 'None', color: '#95A5A6', icon: 'fa fa-user' },
    1: { name: 'Trader', color: '#F39C12', icon: 'fa fa-shopping-cart' },
    2: { name: 'Thief', color: '#8E44AD', icon: 'fa fa-mask' },
    3: { name: 'Hunter', color: '#E74C3C', icon: 'fa fa-crosshairs' },
  },

  // Honor Level Configuration
  honorLevel: {
    0: { name: 'Civilian', color: '#BDC3C7', min: 0, max: 99 },
    1: { name: 'Soldier', color: '#3498DB', min: 100, max: 499 },
    2: { name: 'Warrior', color: '#2ECC71', min: 500, max: 999 },
    3: { name: 'Hero', color: '#F39C12', min: 1000, max: 4999 },
    4: { name: 'Legend', color: '#E74C3C', min: 5000, max: 9999 },
    5: { name: 'Myth', color: '#9B59B6', min: 10000, max: 99999 },
  },

  // Unique Monster Points System
  uniquePoints: {
    Isyutaru: 100,
    Demon_Shaitan: 90,
    Uruchi: 80,
    Ivy: 70,
    Lord_Yarkan: 60,
    Captain_Ivy: 50,
    Cerberus: 40,
    Uruchi_Leader: 30,
    Tiger_Girl: 20,
    Medusa: 10,
    default: 5,
  },

  // Item Points Calculation
  itemPoints: {
    enabled: true,
    rareBonus: {
      A_RARE: 5,
      B_RARE: 10,
      C_RARE: 15,
      D_RARE: 20,
    },
    plusBonus: {
      multiplier: 1.5, // Each plus level multiplier
      maxBonus: 50, // Maximum bonus from plus
    },
    socketBonus: {
      perSocket: 3,
      maxSockets: 4,
    },
  },

  // API Response Configuration
  api: {
    standardResponse: true,
    includeMetadata: true,
    includePagination: true,
    includeFilters: true,
    maxLimit: 500,
    defaultLimit: 100,
  },

  // Performance Settings
  performance: {
    enableQueryOptimization: true,
    useIndexHints: true,
    enableParallelQueries: false,
    queryTimeout: 30000, // 30 seconds
    maxConnections: 10,
  },

  // Feature Flags
  features: {
    itemPointsRanking: true,
    realTimeUpdates: false,
    advancedFiltering: true,
    characterDetails: true,
    guildDetails: true,
    competitionMode: false,
    achievementTracking: false,
  },
};
