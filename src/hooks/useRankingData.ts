import { useState, useEffect } from 'react';
import {
  fetchRankingData,
  RankingPlayer,
  RankingGuild,
  JobRanking,
  JobStatistics,
  JobLeaderboardEntry,
  JobProgressionData,
} from '@/utils/rankingUtils';

interface UseRankingDataResult {
  data: any; // Changed to any to handle Enhanced API responses
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useRankingData = (
  type: string,
  params?: { jobType?: number }
): UseRankingDataResult => {
  const [data, setData] = useState<any>(null); // Changed to null initially
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build URL with query parameters
      let url = type;
      if (params?.jobType && type === 'job-progression') {
        url += `?jobType=${params.jobType}`;
      }

      const result = await fetchRankingData(url);

      if (result.success) {
        // Handle both legacy array format and Enhanced API object format
        setData(result.data);
      } else {
        setError(result.message || 'Failed to fetch ranking data');
        setData(null);
      }
    } catch (err) {
      console.error('useRankingData error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type) {
      fetchData();
    }
  }, [type, params?.jobType]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
