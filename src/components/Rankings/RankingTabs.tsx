import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Import all ranking components
import TopPlayerRanking from './TopPlayerRanking';
import TopGuildRanking from './TopGuildRanking';
import UniqueRankingTable from './UniqueRankingTable';
import JobKDRankingTable from './JobKDRankingTable';
import JobRankingsContainer from './JobRankingsContainer';
import HonorRankingTable from './HonorRankingTable';
import FortressRankingTable from './FortressRankingTable';
import PvPRankingTable from './PvPRankingTable';

// Import types
import { RankingPlayer, RankingGuild, HonorRanking, FortressRanking, PvPRanking } from './types';

// Import types from existing components
interface UniqueRanking {
  rank: number;
  CharName16: string;
  Level: number;
  UniqueCount: number;
  TotalKills: number;
  TotalPoints: number;
  LastKill?: string;
  Race: string;
  GuildName?: string;
}

interface JobKDRankingData {
  rank: number;
  CharName16: string;
  Level: number;
  JobKills: number;
  JobDeaths: number;
  KDRatio: number;
  TotalJobLevel: number;
  Race: string;
  GuildName?: string;
}

interface RankingTabsProps {}

const RankingTabs: React.FC<RankingTabsProps> = () => {
  const [activeTab, setActiveTab] = useState('top-player');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate state for input value
  const [isSearching, setIsSearching] = useState(false); // Loading state for search

  // State for all ranking data
  const [topPlayers, setTopPlayers] = useState<RankingPlayer[]>([]);
  const [topGuilds, setTopGuilds] = useState<RankingGuild[]>([]);
  const [uniqueKills, setUniqueKills] = useState<UniqueRanking[]>([]);
  const [monthlyUniqueKills, setMonthlyUniqueKills] = useState<UniqueRanking[]>([]);
  const [jobKDRankings, setJobKDRankings] = useState<JobKDRankingData[]>([]);
  const [honorRankings, setHonorRankings] = useState<HonorRanking[]>([]);
  const [fortressRankings, setFortressRankings] = useState<FortressRanking[]>([]);
  const [pvpRankings, setPvpRankings] = useState<PvPRanking[]>([]);

  // Loading states
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  // Pagination states
  const [pagination, setPagination] = useState<{
    [key: string]: { currentPage: number; hasMore: boolean; itemsPerPage: number };
  }>({
    topPlayers: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    topGuilds: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    uniqueKills: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    monthlyUniqueKills: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    jobKDRankings: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    honorRankings: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    fortressRankings: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
    pvpRankings: { currentPage: 1, hasMore: false, itemsPerPage: 100 },
  });

  // API base URL from environment variables
  const API_BASE = `${import.meta.env.VITE_API_baseurl}/api`;

  // Fetch data function with pagination and search support
  const fetchData = async (
    endpoint: string,
    setter: Function,
    key: string,
    page = 1,
    limit?: number,
    search?: string
  ) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: null }));

    try {
      const offset = (page - 1) * (limit || pagination[key]?.itemsPerPage || 100);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(
        `${API_BASE}${endpoint}?page=${page}&limit=${
          limit || pagination[key]?.itemsPerPage || 100
        }&offset=${offset}${searchParam}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const results = data.data || [];

      // Update pagination state
      setPagination((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          currentPage: page,
          hasMore: data.pagination?.hasMore || results.length === (limit || prev[key]?.itemsPerPage || 100),
        },
      }));

      setter(results);
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      setErrors((prev) => ({ ...prev, [key]: error instanceof Error ? error.message : 'Unknown error' }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Page change handler
  const handlePageChange = (key: string, endpoint: string, setter: Function) => (page: number) => {
    fetchData(endpoint, setter, key, page, undefined, searchTerm);
  };

  // Search handler - resets to page 1 and performs search
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setIsSearching(searchValue !== ''); // Show searching state for non-empty searches

    // Refetch current tab data with search term
    const currentTabData = {
      'top-player': { endpoint: '/rankings/top-player', setter: setTopPlayers, key: 'topPlayers' },
      'top-guild': { endpoint: '/rankings/guild', setter: setTopGuilds, key: 'topGuilds' },
      unique: { endpoint: '/rankings/unique', setter: setUniqueKills, key: 'uniqueKills' },
      'monthly-unique': {
        endpoint: '/rankings/unique-monthly',
        setter: setMonthlyUniqueKills,
        key: 'monthlyUniqueKills',
      },
      'job-kd': { endpoint: '/rankings/job-kd', setter: setJobKDRankings, key: 'jobKDRankings' },
      honor: { endpoint: '/rankings/honor', setter: setHonorRankings, key: 'honorRankings' },
      fortress: { endpoint: '/rankings/fortress-guild', setter: setFortressRankings, key: 'fortressRankings' },
      pvp: { endpoint: '/rankings/pvp', setter: setPvpRankings, key: 'pvpRankings' },
    };

    const tabData = currentTabData[activeTab as keyof typeof currentTabData];
    if (tabData) {
      // Reset to page 1 for search
      setPagination((prev) => ({
        ...prev,
        [tabData.key]: { ...prev[tabData.key], currentPage: 1 },
      }));

      // Perform search and then clear searching state
      fetchData(tabData.endpoint, tabData.setter, tabData.key, 1, undefined, searchValue)
        .then(() => setIsSearching(false))
        .catch(() => setIsSearching(false));
    }
  };

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'top-player':
        if (topPlayers.length === 0) {
          fetchData('/rankings/top-player', setTopPlayers, 'topPlayers', 1);
        }
        break;
      case 'top-guild':
        if (topGuilds.length === 0) {
          fetchData('/rankings/guild', setTopGuilds, 'topGuilds', 1);
        }
        break;
      case 'unique':
        if (uniqueKills.length === 0) {
          fetchData('/rankings/unique', setUniqueKills, 'uniqueKills', 1);
        }
        break;
      case 'monthly-unique':
        if (monthlyUniqueKills.length === 0) {
          fetchData('/rankings/unique-monthly', setMonthlyUniqueKills, 'monthlyUniqueKills', 1);
        }
        break;
      case 'job-rankings':
        // Job rankings data is managed by JobRankingsContainer
        break;
      case 'job-kd':
        if (jobKDRankings.length === 0) {
          fetchData('/rankings/job-kd', setJobKDRankings, 'jobKDRankings', 1);
        }
        break;
      case 'honor':
        if (honorRankings.length === 0) {
          fetchData('/rankings/honor', setHonorRankings, 'honorRankings', 1);
        }
        break;
      case 'fortress':
        if (fortressRankings.length === 0) {
          fetchData('/rankings/fortress-guild', setFortressRankings, 'fortressRankings', 1);
        }
        break;
      case 'pvp':
        if (pvpRankings.length === 0) {
          fetchData('/rankings/pvp', setPvpRankings, 'pvpRankings', 1);
        }
        break;
    }
  }, [activeTab]);

  // Debounce effect for search input (2 seconds delay)
  useEffect(() => {
    if (searchInput.trim() === '') {
      // If search input is empty, immediately clear search
      if (searchTerm !== '') {
        handleSearch('');
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      if (searchInput !== searchTerm) {
        handleSearch(searchInput);
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]); // Only trigger when searchInput changes

  // Reset search when tab changes
  useEffect(() => {
    setSearchInput('');
    setSearchTerm('');
    setIsSearching(false);
  }, [activeTab]);

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Search Input */}
      <div className='relative mb-6'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
        {isSearching && (
          <div className='absolute right-3 top-3 h-4 w-4'>
            <div className='w-4 h-4 border-2 border-theme-primary border-t-transparent rounded-full animate-spin'></div>
          </div>
        )}
        <Input
          placeholder='Search rankings... (searches automatically after 2 seconds)'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className='pl-10 pr-10 bg-theme-surface border-theme-border text-theme-text placeholder-theme-text-muted'
        />
        {/* Search countdown indicator */}
        {searchInput !== searchTerm && searchInput.trim() && (
          <div className='absolute right-12 top-3 text-xs text-theme-primary/70'>Searching in 2s...</div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3 lg:grid-cols-9'>
          <TabsTrigger value='top-player'>Top Player</TabsTrigger>
          <TabsTrigger value='top-guild'>Top Guild</TabsTrigger>
          <TabsTrigger value='unique'>Unique</TabsTrigger>
          <TabsTrigger value='monthly-unique'>Monthly Unique</TabsTrigger>
          <TabsTrigger value='job-rankings'>Job Rankings</TabsTrigger>
          <TabsTrigger value='job-kd'>Job K/D</TabsTrigger>
          <TabsTrigger value='honor'>Honor</TabsTrigger>
          <TabsTrigger value='fortress'>Fortress</TabsTrigger>
          <TabsTrigger value='pvp'>PvP</TabsTrigger>
        </TabsList>

        <div className='mt-6'>
          <TabsContent value='top-player' className='mt-0'>
            <TopPlayerRanking
              data={topPlayers || []}
              loading={loading.topPlayers || false}
              error={errors.topPlayers || null}
              searchTerm={searchTerm}
              currentPage={pagination.topPlayers?.currentPage || 1}
              hasMore={pagination.topPlayers?.hasMore || false}
              onPageChange={handlePageChange('topPlayers', '/rankings/top-player', setTopPlayers)}
              itemsPerPage={pagination.topPlayers?.itemsPerPage || 100}
            />
          </TabsContent>

          <TabsContent value='top-guild' className='mt-0'>
            <TopGuildRanking
              data={topGuilds || []}
              loading={loading.topGuilds || false}
              error={errors.topGuilds || null}
              searchTerm={searchTerm}
              currentPage={pagination.topGuilds?.currentPage || 1}
              hasMore={pagination.topGuilds?.hasMore || false}
              onPageChange={handlePageChange('topGuilds', '/rankings/guild', setTopGuilds)}
              itemsPerPage={pagination.topGuilds?.itemsPerPage || 100}
            />
          </TabsContent>

          <TabsContent value='unique' className='mt-0'>
            <UniqueRankingTable
              data={uniqueKills || []}
              loading={loading.uniqueKills || false}
              error={errors.uniqueKills || null}
              searchTerm={searchTerm}
              currentPage={pagination.uniqueKills?.currentPage || 1}
              hasMore={pagination.uniqueKills?.hasMore || false}
              onPageChange={handlePageChange('uniqueKills', '/rankings/unique', setUniqueKills)}
              itemsPerPage={pagination.uniqueKills?.itemsPerPage || 100}
            />
          </TabsContent>

          <TabsContent value='monthly-unique' className='mt-0'>
            <UniqueRankingTable
              data={monthlyUniqueKills || []}
              loading={loading.monthlyUniqueKills || false}
              error={errors.monthlyUniqueKills || null}
              searchTerm={searchTerm}
              isMonthly={true}
              currentPage={pagination.monthlyUniqueKills?.currentPage || 1}
              hasMore={pagination.monthlyUniqueKills?.hasMore || false}
              onPageChange={handlePageChange('monthlyUniqueKills', '/rankings/unique-monthly', setMonthlyUniqueKills)}
              itemsPerPage={pagination.monthlyUniqueKills?.itemsPerPage || 100}
            />
          </TabsContent>

          <TabsContent value='job-rankings' className='mt-0'>
            <JobRankingsContainer searchTerm={searchTerm} />
          </TabsContent>

          <TabsContent value='job-kd' className='mt-0'>
            <JobKDRankingTable
              data={jobKDRankings || []}
              loading={loading.jobKDRankings || false}
              error={errors.jobKDRankings || null}
              searchTerm={searchTerm}
              currentPage={pagination.jobKDRankings.currentPage}
              hasMore={pagination.jobKDRankings.hasMore}
              itemsPerPage={pagination.jobKDRankings.itemsPerPage}
              totalItems={
                pagination.jobKDRankings.hasMore
                  ? pagination.jobKDRankings.currentPage * pagination.jobKDRankings.itemsPerPage + 1
                  : jobKDRankings?.length || 0
              }
              onPageChange={handlePageChange('jobKDRankings', '/rankings/job-kd', setJobKDRankings)}
            />
          </TabsContent>

          <TabsContent value='honor' className='mt-0'>
            <HonorRankingTable
              data={honorRankings || []}
              loading={loading.honorRankings || false}
              error={errors.honorRankings || null}
              searchTerm={searchTerm}
              currentPage={pagination.honorRankings?.currentPage || 1}
              hasMore={pagination.honorRankings?.hasMore || false}
              onPageChange={handlePageChange('honorRankings', '/rankings/honor', setHonorRankings)}
              itemsPerPage={pagination.honorRankings?.itemsPerPage || 100}
            />
          </TabsContent>

          <TabsContent value='fortress' className='mt-0'>
            <FortressRankingTable
              data={fortressRankings || []}
              loading={loading.fortressRankings || false}
              error={errors.fortressRankings || null}
              searchTerm={searchTerm}
              currentPage={pagination.fortressRankings?.currentPage || 1}
              hasMore={pagination.fortressRankings?.hasMore || false}
              onPageChange={handlePageChange('fortressRankings', '/rankings/fortress-guild', setFortressRankings)}
              itemsPerPage={pagination.fortressRankings?.itemsPerPage || 100}
            />
          </TabsContent>

          <TabsContent value='pvp' className='mt-0'>
            <PvPRankingTable
              data={pvpRankings || []}
              loading={loading.pvpRankings || false}
              error={errors.pvpRankings || null}
              searchTerm={searchTerm}
              currentPage={pagination.pvpRankings?.currentPage || 1}
              hasMore={pagination.pvpRankings?.hasMore || false}
              onPageChange={handlePageChange('pvpRankings', '/rankings/pvp', setPvpRankings)}
              itemsPerPage={pagination.pvpRankings?.itemsPerPage || 100}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default RankingTabs;
