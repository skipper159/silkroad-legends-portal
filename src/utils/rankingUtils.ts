import { fetchWithAuth, weburl } from '@/lib/api';

export interface RankingPlayer {
  rank: number;
  CharName16?: string;
  CharName?: string; // For new API format
  Level?: number;
  CurLevel?: number; // For new API format
  Race?: string;
  Guild?: string;
  GuildName?: string; // For new API format
  Honor?: number;
  HwanLevel?: number;
  HwanTitle?: string;
  RefObjID?: number;
  FortressKills?: number;
  PKCount?: number;
  DiedCount?: number;
  KDRatio?: number;
  JobType?: number;
  JobLevel?: number;
  JobExp?: number;
  Contribution?: number;
  Reward?: number;
  CharID?: number; // For new API format
  RemainGold?: string; // For new API format
  ItemPoints?: number; // For new API format
  raceInfo?: any; // For new API format
  jobInfo?: any; // For new API format
  formattedGold?: string; // For new API format
  itemPointsFormatted?: string; // For new API format
  rn?: string; // For new API format
}

export interface JobRanking {
  rank: number;
  CharName16?: string;
  CharName?: string; // For new API format
  CurLevel: number;
  JobType: number;
  JobLevel: number;
  JobExp: number;
  Contribution?: number;
}

export interface JobStatistics {
  JobType: number;
  TotalPlayers: number;
  AverageLevel: number;
  MaxLevel: number;
  MinLevel: number;
  AverageExperience: number;
  MaxExperience: number;
  TotalContribution: number;
  AverageContribution: number;
  Level1_10: number;
  Level11_20: number;
  Level21_30: number;
  Level31_40: number;
  Level41_50: number;
  Exp0_1M: number;
  Exp1M_5M: number;
  Exp5M_10M: number;
  Exp10M_Plus: number;
}

export interface JobLeaderboardEntry {
  JobType: number;
  CharName16: string;
  JobLevel: number;
  JobExp: number;
  Contribution: number;
  JobRank: number;
  OverallRank: number;
}

export interface JobProgressionData {
  JobType: number;
  JobLevel: number;
  PlayerCount: number;
  AverageExp: number;
  MinExp: number;
  MaxExp: number;
  MedianExp: number;
}

export interface RankingGuild {
  rank: number;
  GuildName: string;
  Level?: number;
  MemberCount?: number;
  FortressPoints?: number;
  LeaderName?: string;
}

export interface RankingResponse {
  success: boolean;
  data:
    | RankingPlayer[]
    | RankingGuild[]
    | JobRanking[]
    | JobStatistics[]
    | JobLeaderboardEntry[]
    | JobProgressionData[];
  message?: string;
}

export const fetchRankingData = async (
  type: string,
  page: number = 1
): Promise<RankingResponse> => {
  try {
    // Use only Legacy API - stable and tested
    console.log(`Fetching rankings for ${type} using Legacy API...`);
    const response = await fetchWithAuth(`${weburl}/api/rankings/${type}?page=${page}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} rankings: ${response.status}`);
    }

    const data = await response.json();
    console.log('Legacy API Response for', type, ':', data);

    // Handle legacy success format
    if (data.success === true && data.data) {
      return {
        success: true,
        data: data.data,
      };
    }

    // Handle direct array response
    if (Array.isArray(data)) {
      return {
        success: true,
        data: data,
      };
    }

    // Handle other formats
    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error(`Error fetching ${type} rankings:`, error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const getRaceIcon = (refObjID: number): string => {
  return refObjID > 2000 ? '/images/com_kindred_europe.png' : '/images/com_kindred_china.png';
};

export const getHonorLevelIcon = (hwanLevel: number): string => {
  if (hwanLevel >= 1 && hwanLevel <= 5) {
    return `/images/honor/level_${hwanLevel}.svg`;
  }
  return '';
};

export const getRankIcon = (rank: number): string => {
  if (rank <= 3) {
    return `/images/ranking/rank${rank}.svg`;
  }
  return '';
};

export const formatKDRatio = (ratio: number): string => {
  return ratio.toFixed(2);
};

// Job-specific functions
export const getJobTypeIcon = (jobType: number | undefined | null): string => {
  if (jobType === null || jobType === undefined) {
    return '/images/jobs/unknown.svg';
  }

  switch (jobType) {
    case 1:
      return '/images/jobs/trader.svg';
    case 2:
      return '/images/jobs/thief.svg';
    case 3:
      return '/images/jobs/hunter.svg';
    default:
      return '/images/jobs/unknown.svg';
  }
};

export const getJobTypeName = (jobType: number | undefined | null): string => {
  if (jobType === null || jobType === undefined) {
    return 'Unknown';
  }

  switch (jobType) {
    case 1:
      return 'Trader';
    case 2:
      return 'Thief';
    case 3:
      return 'Hunter';
    default:
      return 'Unknown';
  }
};

export const getJobTypeColor = (jobType: number | undefined | null): string => {
  if (jobType === null || jobType === undefined) {
    return 'text-gray-400';
  }

  switch (jobType) {
    case 1:
      return 'text-blue-400'; // Trader
    case 2:
      return 'text-red-400'; // Thief
    case 3:
      return 'text-green-400'; // Hunter
    default:
      return 'text-gray-400';
  }
};

export const formatJobExperience = (exp: number | undefined | null): string => {
  if (exp === null || exp === undefined || isNaN(exp)) {
    return '0';
  }

  if (exp >= 1000000) {
    return `${(exp / 1000000).toFixed(1)}M`;
  } else if (exp >= 1000) {
    return `${(exp / 1000).toFixed(1)}K`;
  }
  return exp.toString();
};

// Phase 3: Advanced Job Statistics Utilities
export const formatStatisticsValue = (
  value: number,
  type: 'percentage' | 'number' | 'experience' = 'number'
): string => {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'experience':
      return formatJobExperience(value);
    case 'number':
    default:
      return value.toLocaleString();
  }
};

export const getJobTypeFullName = (jobType: number): string => {
  switch (jobType) {
    case 1:
      return 'Trader';
    case 2:
      return 'Thief';
    case 3:
      return 'Hunter';
    default:
      return 'Unknown';
  }
};

export const getJobLevelRange = (level: number): string => {
  if (level <= 10) return 'Beginner (1-10)';
  if (level <= 20) return 'Novice (11-20)';
  if (level <= 30) return 'Intermediate (21-30)';
  if (level <= 40) return 'Advanced (31-40)';
  if (level <= 50) return 'Expert (41-50)';
  return 'Master (50+)';
};

export const getExperienceRange = (exp: number): string => {
  if (exp <= 1000000) return 'Starter (0-1M)';
  if (exp <= 5000000) return 'Developing (1M-5M)';
  if (exp <= 10000000) return 'Experienced (5M-10M)';
  return 'Elite (10M+)';
};

export const calculateJobDistribution = (
  stats: JobStatistics[]
): { jobType: number; percentage: number }[] => {
  const total = stats.reduce((sum, stat) => sum + stat.TotalPlayers, 0);
  return stats.map((stat) => ({
    jobType: stat.JobType,
    percentage: total > 0 ? (stat.TotalPlayers / total) * 100 : 0,
  }));
};

export const getJobPerformanceRating = (
  level: number,
  exp: number,
  contribution: number
): 'Low' | 'Medium' | 'High' | 'Elite' => {
  const score = level * 0.3 + (exp / 1000000) * 0.5 + (contribution / 100000) * 0.2;

  if (score >= 40) return 'Elite';
  if (score >= 25) return 'High';
  if (score >= 15) return 'Medium';
  return 'Low';
};
