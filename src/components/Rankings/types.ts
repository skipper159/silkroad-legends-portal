// Ranking types and interfaces
export interface RankingPlayer {
  CharID: number;
  CharName?: string;
  CharName16?: string;
  CurLevel?: number;
  Level?: number;
  RemainGold?: number;
  formattedGold?: string;
  ItemPoints?: number;
  GuildName?: string;
  Guild?: string;
  raceInfo?: {
    name: string;
    flag: string;
  };
}

export interface RankingGuild {
  ID: number;
  Name: string;
  Lv?: number;
  Level?: number;
  MemberCount?: number;
  Alliance?: string;
  Rank?: number;
  Notice?: string;
}

export interface UniqueKill {
  rank?: number;
  CharID: number;
  CharName?: string;
  CharName16?: string;
  Level?: number;
  RefObjID: number;
  KillTime: string;
  UniqueName: string;
  SilkTotal: number;
  NameStrID?: string;
  UniqueIcon?: string;
  UniqueCount?: number;
  TotalKills?: number;
  TotalPoints?: number;
  LastKill?: string;
  Race?: string;
  GuildName?: string;
  raceInfo?: {
    name: string;
    flag: string;
  };
}

export interface ItemRanking {
  rank?: number;
  CharID: number;
  CharName?: string;
  CharName16?: string;
  Level?: number;
  Race?: string;
  GuildName?: string;
  RefItemID?: number;
  OptLevel?: number;
  Plus?: number;
  ItemName?: string;
  // For Enhancement Rankings
  HighEnhancements?: number;
  MaxEnhancement?: number;
  TotalEnhancements?: number;
  // For Drop Rankings
  SealOfSunDrops?: number;
  SealOfMoonDrops?: number;
  SealOfStarDrops?: number;
  SealOfNovaDrops?: number;
  TotalRareDrops?: number;
  LastDrop?: string;
  raceInfo?: {
    name: string;
    flag: string;
  };
}

export interface JobKDRanking {
  rank?: number;
  CharID: number;
  CharName?: string;
  CharName16?: string;
  Level?: number;
  JobType?: number;
  JobLevel?: number;
  Kills?: number;
  Deaths?: number;
  KDRatio?: number;
  JobName?: string;
  JobIcon?: string;
  JobKills?: number;
  JobDeaths?: number;
  TotalJobLevel?: number;
  Race?: string;
  GuildName?: string;
  raceInfo?: {
    name: string;
    flag: string;
  };
}

export interface FortressRanking {
  GuildID: number;
  GuildName: string;
  FortressName: string;
  TaxRatio: number;
  DefenseLevel: number;
  LastConquest?: string;
  Region?: string;
}

export interface HonorRanking {
  CharID: number;
  CharName?: string;
  CharName16?: string;
  HonorPoint: number;
  LatestHKTime?: string;
  Level?: number;
  raceInfo?: {
    name: string;
    flag: string;
  };
}

export interface PvPRanking {
  CharID: number;
  CharName?: string;
  CharName16?: string;
  PK_Count: number;
  PD_Count: number;
  KDRatio: number;
  Level?: number;
  raceInfo?: {
    name: string;
    flag: string;
  };
}

// Helper function to get player name with fallback
export const getPlayerName = (
  player: RankingPlayer | UniqueKill | ItemRanking | JobKDRanking | HonorRanking | PvPRanking
): string => {
  return player.CharName || player.CharName16 || 'Unknown Player';
};

// Utility functions for rankings
export const getRankIcon = (rank: number): string => {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return rank.toString();
  }
};

export const formatGold = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
};

export const getJobIcon = (jobType: number): string => {
  const jobIcons: { [key: number]: string } = {
    1: '/images/jobs/trader.png',
    2: '/images/jobs/thief.png',
    3: '/images/jobs/hunter.png',
  };
  return jobIcons[jobType] || '/images/jobs/default.png';
};

export const getJobName = (jobType: number): string => {
  const jobNames: { [key: number]: string } = {
    1: 'Trader',
    2: 'Thief',
    3: 'Hunter',
  };
  return jobNames[jobType] || 'Unknown';
};
