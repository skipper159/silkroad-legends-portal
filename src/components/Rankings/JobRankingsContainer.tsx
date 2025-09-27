import React, { useState, useEffect } from 'react';
import JobRankingsTable from './JobRankingsTable';

interface JobRanking {
  rank: number;
  CharID: number;
  CharName16: string;
  NickName16: string;
  RefObjID: number;
  JobType: number;
  JobLevel: number;
  JobExp: number;
  ReputationPoint: number;
  KillCount: number;
  DeathCount: number;
  Class: number;
  JobRank: number;
  GuildName?: string;
  JobTypeName: string;
  Race: string;
}

interface JobStatistics {
  totalHunters?: number;
  totalThieves?: number;
  totalTraders?: number;
  averageLevel: number;
  maxLevel: number;
  totalKills: number;
  averageReputation: number;
}

interface JobRankingData {
  rankings: JobRanking[];
  statistics: JobStatistics;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
}

interface JobRankingsContainerProps {
  searchTerm: string;
}

const JobRankingsContainer: React.FC<JobRankingsContainerProps> = ({ searchTerm }) => {
  // Data state for each job type
  const [hunterData, setHunterData] = useState<JobRanking[]>([]);
  const [thiefData, setThiefData] = useState<JobRanking[]>([]);
  const [traderData, setTraderData] = useState<JobRanking[]>([]);

  // Statistics state
  const [hunterStats, setHunterStats] = useState<JobStatistics>({
    averageLevel: 0,
    maxLevel: 0,
    totalKills: 0,
    averageReputation: 0,
  });
  const [thiefStats, setThiefStats] = useState<JobStatistics>({
    averageLevel: 0,
    maxLevel: 0,
    totalKills: 0,
    averageReputation: 0,
  });
  const [traderStats, setTraderStats] = useState<JobStatistics>({
    averageLevel: 0,
    maxLevel: 0,
    totalKills: 0,
    averageReputation: 0,
  });

  // Loading state
  const [loading, setLoading] = useState({
    hunter: true,
    thief: true,
    trader: true,
  });

  // Error state
  const [error, setError] = useState({
    hunter: null as string | null,
    thief: null as string | null,
    trader: null as string | null,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    hunter: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    thief: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    trader: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
  });

  // API base URL from environment variables
  const API_BASE = `${import.meta.env.VITE_API_baseurl}`;

  // API call functions
  const fetchJobRanking = async (jobType: 'hunter' | 'thief' | 'trader', page: number = 1) => {
    try {
      setLoading((prev) => ({ ...prev, [jobType]: true }));

      console.log(
        `Fetching ${jobType} rankings from: ${API_BASE}/api/rankings/${jobType}-rankings?page=${page}&limit=100`
      );
      const response = await fetch(`${API_BASE}/api/rankings/${jobType}-rankings?page=${page}&limit=100`);

      if (!response.ok) {
        console.error(`Failed to fetch ${jobType} rankings. Status: ${response.status}`);
        throw new Error(`Failed to fetch ${jobType} rankings. Status: ${response.status}`);
      }

      const data: JobRankingData = await response.json();
      console.log(`${jobType} rankings data:`, data);

      // Update state
      switch (jobType) {
        case 'hunter':
          setHunterData(data.rankings);
          setHunterStats(data.statistics);
          break;
        case 'thief':
          setThiefData(data.rankings);
          setThiefStats(data.statistics);
          break;
        case 'trader':
          setTraderData(data.rankings);
          setTraderStats(data.statistics);
          break;
      }

      setPagination((prev) => ({
        ...prev,
        [jobType]: {
          currentPage: data.pagination.currentPage,
          hasMore: data.pagination.hasMore,
          itemsPerPage: data.pagination.itemsPerPage,
        },
      }));

      setError((prev) => ({ ...prev, [jobType]: null }));
    } catch (err) {
      console.error(`Error fetching ${jobType} rankings:`, err);
      setError((prev) => ({
        ...prev,
        [jobType]: err instanceof Error ? err.message : `Failed to load ${jobType} rankings`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [jobType]: false }));
    }
  };

  // Page change handlers
  const handlePageChange = {
    hunter: (page: number) => fetchJobRanking('hunter', page),
    thief: (page: number) => fetchJobRanking('thief', page),
    trader: (page: number) => fetchJobRanking('trader', page),
  };

  // Initial data loading
  useEffect(() => {
    fetchJobRanking('hunter');
    fetchJobRanking('thief');
    fetchJobRanking('trader');
  }, []);

  // Filter data based on search term
  const filterRankings = (rankings: JobRanking[]) => {
    if (!searchTerm) return rankings;

    return rankings.filter(
      (player) =>
        player.CharName16?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.NickName16?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.GuildName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredHunterData = filterRankings(hunterData);
  const filteredThiefData = filterRankings(thiefData);
  const filteredTraderData = filterRankings(traderData);

  return (
    <JobRankingsTable
      hunterData={filteredHunterData}
      thiefData={filteredThiefData}
      traderData={filteredTraderData}
      hunterStats={hunterStats}
      thiefStats={thiefStats}
      traderStats={traderStats}
      loading={loading}
      error={error}
      searchTerm={searchTerm}
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  );
};

export default JobRankingsContainer;
