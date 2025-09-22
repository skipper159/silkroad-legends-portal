import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Import all ranking components
import TopPlayerRanking from './TopPlayerRanking';
import TopGuildRanking from './TopGuildRanking';
import UniqueRankingTable from './UniqueRankingTable';
import ItemRankingTable from './ItemRankingTable';
import JobKDRankingTable from './JobKDRankingTable';
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

interface ItemRankingData {
  rank: number;
  CharName16: string;
  Level: number;
  Race: string;
  GuildName?: string;
  HighEnhancements?: number;
  MaxEnhancement?: number;
  TotalEnhancements?: number;
  SealOfSunDrops?: number;
  SealOfMoonDrops?: number;
  SealOfStarDrops?: number;
  SealOfNovaDrops?: number;
  TotalRareDrops?: number;
  LastDrop?: string;
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

  // State for all ranking data
  const [topPlayers, setTopPlayers] = useState<RankingPlayer[]>([]);
  const [topGuilds, setTopGuilds] = useState<RankingGuild[]>([]);
  const [uniqueKills, setUniqueKills] = useState<UniqueRanking[]>([]);
  const [monthlyUniqueKills, setMonthlyUniqueKills] = useState<UniqueRanking[]>([]);
  const [itemRankings, setItemRankings] = useState<ItemRankingData[]>([]);
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
    topPlayers: { currentPage: 1, hasMore: false, itemsPerPage: 50 },
    topGuilds: { currentPage: 1, hasMore: false, itemsPerPage: 25 },
    uniqueKills: { currentPage: 1, hasMore: false, itemsPerPage: 50 },
    monthlyUniqueKills: { currentPage: 1, hasMore: false, itemsPerPage: 50 },
    itemRankings: { currentPage: 1, hasMore: false, itemsPerPage: 50 },
    jobKDRankings: { currentPage: 1, hasMore: false, itemsPerPage: 50 },
    honorRankings: { currentPage: 1, hasMore: false, itemsPerPage: 50 },
    fortressRankings: { currentPage: 1, hasMore: false, itemsPerPage: 50 },
    pvpRankings: { currentPage: 1, hasMore: false, itemsPerPage: 50 },
  });

  // API base URL
  const API_BASE = 'http://localhost:3000/api';

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
      const offset = (page - 1) * (limit || pagination[key]?.itemsPerPage || 50);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(
        `${API_BASE}${endpoint}?page=${page}&limit=${
          limit || pagination[key]?.itemsPerPage || 50
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
          hasMore: data.pagination?.hasMore || results.length === (limit || prev[key]?.itemsPerPage || 50),
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
      item: { endpoint: '/rankings/item-plus', setter: setItemRankings, key: 'itemRankings' },
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
      fetchData(tabData.endpoint, tabData.setter, tabData.key, 1, undefined, searchValue);
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
      case 'item':
        if (itemRankings.length === 0) {
          fetchData('/rankings/item-plus', setItemRankings, 'itemRankings', 1);
        }
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

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Search Input */}
      <div className='relative mb-6'>
        <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
        <Input
          placeholder='Search rankings...'
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className='pl-10 bg-black/20 border-lafftale-gold/30 text-white placeholder-gray-400'
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-3 lg:grid-cols-9'>
          <TabsTrigger value='top-player'>Top Player</TabsTrigger>
          <TabsTrigger value='top-guild'>Top Guild</TabsTrigger>
          <TabsTrigger value='unique'>Unique</TabsTrigger>
          <TabsTrigger value='monthly-unique'>Monthly Unique</TabsTrigger>
          <TabsTrigger value='item'>Item</TabsTrigger>
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
              itemsPerPage={pagination.topPlayers?.itemsPerPage || 50}
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
              itemsPerPage={pagination.topGuilds?.itemsPerPage || 25}
            />
          </TabsContent>

          <TabsContent value='unique' className='mt-0'>
            <UniqueRankingTable
              data={uniqueKills || []}
              loading={loading.uniqueKills || false}
              error={errors.uniqueKills || null}
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value='monthly-unique' className='mt-0'>
            <UniqueRankingTable
              data={monthlyUniqueKills || []}
              loading={loading.monthlyUniqueKills || false}
              error={errors.monthlyUniqueKills || null}
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value='item' className='mt-0'>
            <ItemRankingTable
              data={itemRankings || []}
              loading={loading.itemRankings || false}
              error={errors.itemRankings || null}
              searchTerm={searchTerm}
              rankingType='enhancement'
            />
          </TabsContent>

          <TabsContent value='job-kd' className='mt-0'>
            <JobKDRankingTable
              data={jobKDRankings || []}
              loading={loading.jobKDRankings || false}
              error={errors.jobKDRankings || null}
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value='honor' className='mt-0'>
            <HonorRankingTable
              data={honorRankings || []}
              loading={loading.honorRankings || false}
              error={errors.honorRankings || null}
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value='fortress' className='mt-0'>
            <FortressRankingTable
              data={fortressRankings || []}
              loading={loading.fortressRankings || false}
              error={errors.fortressRankings || null}
              searchTerm={searchTerm}
            />
          </TabsContent>

          <TabsContent value='pvp' className='mt-0'>
            <PvPRankingTable
              data={pvpRankings || []}
              loading={loading.pvpRankings || false}
              error={errors.pvpRankings || null}
              searchTerm={searchTerm}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default RankingTabs;
