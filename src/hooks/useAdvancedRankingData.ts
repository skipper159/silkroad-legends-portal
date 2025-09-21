// hooks/useAdvancedRankingData.ts
import { useState, useEffect, useCallback } from 'react';

// Enhanced type definitions for different ranking types
export interface UniqueRanking {
  rank: number;
  CharName16: string;
  Level: number;
  UniqueCount: number;
  TotalKills: number;
  TotalPoints: number;
  LastKill?: string;
  Race: string;
  GuildName?: string;
  RefObjID?: number;
}

export interface JobKDRanking {
  rank: number;
  CharName16: string;
  Level: number;
  JobKills: number;
  JobDeaths: number;
  KDRatio: number;
  TotalJobLevel: number;
  Race: string;
  GuildName?: string;
  RefObjID?: number;
}

export interface ItemRanking {
  rank: number;
  CharName16: string;
  Level: number;
  Race: string;
  GuildName?: string;
  RefObjID?: number;
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
}

export interface FortressGuildRanking {
  rank: number;
  GuildName: string;
  GuildLevel: number;
  FortressKills: number;
  FortressDeaths: number;
  KDRatio: number;
  ParticipatingMembers: number;
  LastFortressActivity?: string;
  TotalMembers: number;
  ControlledFortress?: number;
}

export interface RankingFilters {
  page?: number;
  limit?: number;
  jobType?: number;
  race?: string;
  monthly?: boolean;
  minPlus?: number;
  rarity?: string;
}

interface UseAdvancedRankingDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination?: {
    currentPage: number;
    pageSize: number;
    hasMore: boolean;
  };
  metadata?: {
    type: string;
    generatedAt: string;
    [key: string]: any;
  };
  refetch: () => void;
}

export const useAdvancedRankingData = <T = any>(
  rankingType: string,
  filters: RankingFilters = {}
): UseAdvancedRankingDataResult<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const fetchRankingData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.jobType) params.append('jobType', filters.jobType.toString());
      if (filters.race) params.append('race', filters.race);
      if (filters.monthly !== undefined) params.append('monthly', filters.monthly.toString());
      if (filters.minPlus) params.append('minPlus', filters.minPlus.toString());
      if (filters.rarity) params.append('rarity', filters.rarity);

      const queryString = params.toString();
      const url = `${
        import.meta.env.VITE_API_URL || 'http://localhost:3000'
      }/api/rankings/${rankingType}${queryString ? `?${queryString}` : ''}`;

      console.log('Fetching ranking data from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(Array.isArray(result.data) ? result.data : []);
        setPagination(result.pagination || null);
        setMetadata(result.metadata || null);
      } else {
        throw new Error(result.error || 'Failed to fetch ranking data');
      }
    } catch (err) {
      console.error('Advanced ranking fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
      setPagination(null);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  }, [rankingType, filters]);

  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]);

  return {
    data,
    loading,
    error,
    pagination,
    metadata,
    refetch: fetchRankingData,
  };
};

// Specialized hooks for specific ranking types
export const useUniqueRankingData = (filters: RankingFilters = {}) => {
  const rankingType = filters.monthly ? 'unique-monthly' : 'unique';
  return useAdvancedRankingData<UniqueRanking>(rankingType, filters);
};

export const useJobKDRankingData = (filters: RankingFilters = {}) => {
  return useAdvancedRankingData<JobKDRanking>('job-kd', filters);
};

export const useItemRankingData = (type: 'plus' | 'drop', filters: RankingFilters = {}) => {
  const rankingType = type === 'plus' ? 'item-plus' : 'item-drop';
  return useAdvancedRankingData<ItemRanking>(rankingType, filters);
};

export const useFortressGuildRankingData = (filters: RankingFilters = {}) => {
  return useAdvancedRankingData<FortressGuildRanking>('fortress-guild', filters);
};

export default useAdvancedRankingData;
