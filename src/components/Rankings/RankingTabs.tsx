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

  // API base URL
  const API_BASE = 'http://localhost:3000/api';

  // Fetch data function
  const fetchData = async (endpoint: string, setter: Function, key: string) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: null }));

    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setter(data.data || []);
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      setErrors((prev) => ({ ...prev, [key]: error instanceof Error ? error.message : 'Unknown error' }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'top-player':
        if (topPlayers.length === 0) {
          fetchData('/rankings/top-player', setTopPlayers, 'topPlayers');
        }
        break;
      case 'top-guild':
        if (topGuilds.length === 0) {
          fetchData('/rankings/guild', setTopGuilds, 'topGuilds');
        }
        break;
      case 'unique':
        if (uniqueKills.length === 0) {
          fetchData('/rankings/unique', setUniqueKills, 'uniqueKills');
        }
        break;
      case 'monthly-unique':
        if (monthlyUniqueKills.length === 0) {
          fetchData('/rankings/unique-monthly', setMonthlyUniqueKills, 'monthlyUniqueKills');
        }
        break;
      case 'item':
        if (itemRankings.length === 0) {
          fetchData('/rankings/item-plus', setItemRankings, 'itemRankings');
        }
        break;
      case 'job-kd':
        if (jobKDRankings.length === 0) {
          fetchData('/rankings/job-kd', setJobKDRankings, 'jobKDRankings');
        }
        break;
      case 'honor':
        if (honorRankings.length === 0) {
          fetchData('/rankings/honor', setHonorRankings, 'honorRankings');
        }
        break;
      case 'fortress':
        if (fortressRankings.length === 0) {
          fetchData('/rankings/fortress-guild', setFortressRankings, 'fortressRankings');
        }
        break;
      case 'pvp':
        if (pvpRankings.length === 0) {
          fetchData('/rankings/pvp', setPvpRankings, 'pvpRankings');
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
          onChange={(e) => setSearchTerm(e.target.value)}
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
            />
          </TabsContent>

          <TabsContent value='top-guild' className='mt-0'>
            <TopGuildRanking
              data={topGuilds || []}
              loading={loading.topGuilds || false}
              error={errors.topGuilds || null}
              searchTerm={searchTerm}
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
