import { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Gem,
  Sword,
  CoinsIcon,
  Crosshair,
  Shield,
  Swords,
  Gamepad2,
  Skull,
  Flag,
  Crown,
  Castle,
  Target,
  BarChart3,
  Calendar,
  Star,
  Gift,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRankingData } from '@/hooks/useRankingData';
import {
  useUniqueRankingData,
  useJobKDRankingData,
  useItemRankingData,
  useFortressGuildRankingData,
} from '@/hooks/useAdvancedRankingData';
import JobAnalyticsDashboard from '@/components/JobAnalyticsDashboard';
import AdvancedJobFilter from '@/components/AdvancedJobFilter';
import UniqueRankingTable from '@/components/Rankings/UniqueRankingTable';
import ItemRankingTable from '@/components/Rankings/ItemRankingTable';
import JobKDRankingTable from '@/components/Rankings/JobKDRankingTable';
import {
  RankingPlayer,
  JobRanking,
  getRaceIcon,
  getHonorLevelIcon,
  getRankIcon,
  formatKDRatio,
  getJobTypeIcon,
  getJobTypeName,
  getJobTypeColor,
  formatJobExperience,
} from '@/utils/rankingUtils';

const Rankings = () => {
  const [activeTab, setActiveTab] = useState('players');
  const [activeRankingType, setActiveRankingType] = useState('player');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Top Player');

  // Get ranking data based on active tab
  const getRankingType = () => {
    switch (activeTab) {
      case 'honor':
        return 'honor';
      case 'fortress-player':
        return 'fortress-player';
      case 'fortress-guild':
        return 'fortress-guild';
      case 'pvp-kd':
        return 'pvp-kd';
      case 'job-kd':
        return 'job-kd';
      case 'unique':
        return 'unique';
      case 'unique-monthly':
        return 'unique-monthly';
      case 'item-plus':
        return 'item-plus';
      case 'item-drop':
        return 'item-drop';
      case 'guilds':
        return 'top-guild';
      case 'thief':
        return 'job-thief';
      case 'trader':
        return 'job-trader';
      case 'hunter':
        return 'job-hunter';
      case 'job-advanced':
        return 'job-all';
      default:
        return 'top-player';
    }
  };

  // Use specialized hooks for advanced ranking types
  const { data: uniqueData, loading: uniqueLoading, error: uniqueError } = useUniqueRankingData({ monthly: false });
  const {
    data: uniqueMonthlyData,
    loading: uniqueMonthlyLoading,
    error: uniqueMonthlyError,
  } = useUniqueRankingData({ monthly: true });
  const { data: jobKDData, loading: jobKDLoading, error: jobKDError } = useJobKDRankingData();
  const { data: itemPlusData, loading: itemPlusLoading, error: itemPlusError } = useItemRankingData('plus');
  const { data: itemDropData, loading: itemDropLoading, error: itemDropError } = useItemRankingData('drop');
  const {
    data: fortressGuildData,
    loading: fortressGuildLoading,
    error: fortressGuildError,
  } = useFortressGuildRankingData();

  // Use regular hook for standard rankings
  const { data: rankingData, loading, error } = useRankingData(getRankingType());

  // Get data and state based on current tab
  const getCurrentRankingData = () => {
    switch (activeTab) {
      case 'unique':
        return { data: uniqueData, loading: uniqueLoading, error: uniqueError };
      case 'unique-monthly':
        return { data: uniqueMonthlyData, loading: uniqueMonthlyLoading, error: uniqueMonthlyError };
      case 'job-kd':
        return { data: jobKDData, loading: jobKDLoading, error: jobKDError };
      case 'item-plus':
        return { data: itemPlusData, loading: itemPlusLoading, error: itemPlusError };
      case 'item-drop':
        return { data: itemDropData, loading: itemDropLoading, error: itemDropError };
      case 'fortress-guild':
        return { data: fortressGuildData, loading: fortressGuildLoading, error: fortressGuildError };
      default:
        return { data: rankingData, loading, error };
    }
  };

  const currentRanking = getCurrentRankingData();

  // Helper function to get player name from either CharName or CharName16
  const getPlayerName = (player: any): string => {
    return player.CharName16 || player.CharName || '';
  };

  // Handle Enhanced API response format and ensure we have an array
  const getDataArray = (data: any): RankingPlayer[] => {
    if (!data) return [];

    // Debug output
    console.log('Rankings data received:', data);
    console.log('Data type:', typeof data);
    console.log('Is Array:', Array.isArray(data));

    // If data has Enhanced API format with .data property
    if (data.data && Array.isArray(data.data)) {
      console.log('Using Enhanced API format (.data property)');
      return data.data;
    }

    // If data is already an array
    if (Array.isArray(data)) {
      console.log('Using direct array format');
      return data;
    }

    // If data is an object with recordset (legacy format)
    if (data.recordset && Array.isArray(data.recordset)) {
      console.log('Using legacy recordset format');
      return data.recordset;
    }

    console.warn('Unexpected ranking data format:', data);
    return [];
  };

  // Handle Enhanced API response format for Job Rankings
  const getJobDataArray = (data: any): JobRanking[] => {
    if (!data) return [];

    // If data has Enhanced API format with .data property
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    // If data is already an array
    if (Array.isArray(data)) {
      return data;
    }

    // If data is an object with recordset (legacy format)
    if (data.recordset && Array.isArray(data.recordset)) {
      return data.recordset;
    }

    console.warn('Unexpected job ranking data format:', data);
    return [];
  };

  const dropdownOptions =
    activeRankingType === 'player'
      ? [
          'Top Player',
          'Top Guild',
          'Unique',
          'Honor',
          'Fortress Player',
          'Fortress Guild',
          'PvP K/D',
          'Thief',
          'Trader',
          'Hunter',
        ]
      : ['Last Man Standing', 'PVP', 'Battle Arena', 'Survival Arena', 'Capture the Flag'];

  // Filter data based on search term
  const dataArray = getDataArray(rankingData);
  const filteredData = dataArray.filter((player: RankingPlayer) => {
    const playerName = getPlayerName(player);
    return playerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />

      <main className='flex-grow'>
        <div className='py-20 bg-header2-bg bg-cover bg-top'>
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
              Ranking <span className='text-lafftale-bronze font-cinzel text-4xl font-bold'>Lafftale</span>
            </h1>
          </div>
        </div>
        <hr></hr>
        <div className='container mx-auto py-10'>
          <Card className='bg-lafftale-darkgray border-lafftale-gold/30 shadow-lg'>
            <CardHeader className='border-b border-lafftale-gold/20 pb-4 flex flex-col sm:flex-row items-center justify-between'>
              <div className='flex gap-2 mb-2 sm:mb-0'>
                <Button
                  variant={activeRankingType === 'player' ? 'default' : 'outline'}
                  className={`${
                    activeRankingType === 'player'
                      ? 'bg-lafftale-gold text-lafftale-dark'
                      : 'text-lafftale-gold border-lafftale-gold/50 hover:bg-lafftale-gold/10'
                  }`}
                  onClick={() => setActiveRankingType('player')}
                >
                  Player Ranking
                </Button>
                <Button
                  variant={activeRankingType === 'analytics' ? 'default' : 'outline'}
                  className={`${
                    activeRankingType === 'analytics'
                      ? 'bg-lafftale-gold text-lafftale-dark'
                      : 'text-lafftale-gold border-lafftale-gold/50 hover:bg-lafftale-gold/10'
                  }`}
                  onClick={() => setActiveRankingType('analytics')}
                >
                  <BarChart3 size={16} className='mr-2' />
                  Job Analytics
                </Button>
              </div>

              <CardTitle className='text-2xl text-center'>Lafftale Champions</CardTitle>

              <Button
                variant={activeRankingType === 'event' ? 'default' : 'outline'}
                className={`mt-2 sm:mt-0 ${
                  activeRankingType === 'event'
                    ? 'bg-lafftale-gold text-lafftale-dark'
                    : 'text-lafftale-gold border-lafftale-gold/50 hover:bg-lafftale-gold/10'
                }`}
                onClick={() => setActiveRankingType('event')}
              >
                Event Ranking
              </Button>
            </CardHeader>

            <CardContent className='p-6'>
              <div className='mb-4 flex items-center justify-center gap-4'>
                <input
                  type='text'
                  placeholder='Search...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-1/3 p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold focus:ring-2 focus:ring-lafftale-gold focus:outline-none'
                />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className='w-1/3 p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold focus:ring-2 focus:ring-lafftale-gold focus:outline-none'
                >
                  {dropdownOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {activeRankingType === 'player' ? (
                <Tabs defaultValue='players' value={activeTab} onValueChange={setActiveTab} className='mb-6'>
                  <TabsList className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-2 w-full bg-lafftale-dark p-2 rounded-lg border border-lafftale-gold/20'>
                    <TabsTrigger
                      value='players'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Trophy size={16} /> Top Player
                    </TabsTrigger>
                    <TabsTrigger
                      value='guilds'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Users size={16} /> Top Guild
                    </TabsTrigger>
                    <TabsTrigger
                      value='unique'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Gem size={16} /> Unique
                    </TabsTrigger>
                    <TabsTrigger
                      value='unique-monthly'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Calendar size={16} /> Monthly Unique
                    </TabsTrigger>
                    <TabsTrigger
                      value='thief'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <img src='/images/jobs/thief.svg' alt='Thief' className='w-4 h-4' /> Thief
                    </TabsTrigger>
                    <TabsTrigger
                      value='trader'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <img src='/images/jobs/trader.svg' alt='Trader' className='w-4 h-4' /> Trader
                    </TabsTrigger>
                    <TabsTrigger
                      value='hunter'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <img src='/images/jobs/hunter.svg' alt='Hunter' className='w-4 h-4' /> Hunter
                    </TabsTrigger>
                    <TabsTrigger
                      value='honor'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Crown size={16} /> Honor
                    </TabsTrigger>
                    <TabsTrigger
                      value='fortress-player'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Castle size={16} /> Fortress
                    </TabsTrigger>
                    <TabsTrigger
                      value='fortress-guild'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Shield size={16} /> Guild Wars
                    </TabsTrigger>
                    <TabsTrigger
                      value='pvp-kd'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Target size={16} /> PvP K/D
                    </TabsTrigger>
                    <TabsTrigger
                      value='job-kd'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Swords size={16} /> Job K/D
                    </TabsTrigger>
                    <TabsTrigger
                      value='item-plus'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Star size={16} /> Enhanced Items
                    </TabsTrigger>
                    <TabsTrigger
                      value='item-drop'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Gift size={16} /> Rare Drops
                    </TabsTrigger>
                    <TabsTrigger
                      value='job-advanced'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <BarChart3 size={16} /> Advanced Jobs
                    </TabsTrigger>
                  </TabsList>

                  {/* Players TabContent */}
                  <TabsContent value='players'>
                    <Table>
                      <TableCaption>Top Players by item points and level</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Job</TableHead>
                          <TableHead className='text-lafftale-gold hidden lg:table-cell'>Guild</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Item Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8'>
                              <div className='flex justify-center'>
                                <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8 text-red-400'>
                              Error loading player rankings: {error}
                            </TableCell>
                          </TableRow>
                        ) : (
                          getDataArray(rankingData)
                            .filter((player) => {
                              const playerName = getPlayerName(player);
                              return playerName.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((player) => (
                              <TableRow
                                key={player.rank}
                                className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                                  player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                                }`}
                              >
                                <TableCell className='font-medium text-center'>
                                  {player.rank <= 3 ? (
                                    <img
                                      src={getRankIcon(player.rank)}
                                      alt={`Rank ${player.rank}`}
                                      className='w-6 h-6 mx-auto'
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling!.textContent = player.rank.toString();
                                      }}
                                    />
                                  ) : (
                                    player.rank
                                  )}
                                  <span className='hidden'>{player.rank}</span>
                                </TableCell>
                                <TableCell className='font-medium text-lafftale-gold'>
                                  <div className='flex items-center gap-2'>
                                    {player.RefObjID && (
                                      <img
                                        src={getRaceIcon(player.RefObjID)}
                                        alt={player.Race || 'Race'}
                                        className='w-4 h-4'
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    {getPlayerName(player)}
                                  </div>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>{player.Level || 'Unknown'}</TableCell>
                                <TableCell className='hidden md:table-cell'>Unknown</TableCell>
                                <TableCell className='hidden lg:table-cell'>{player.Guild || 'None'}</TableCell>
                                <TableCell className='text-right'>0</TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Honor TabContent */}
                  <TabsContent value='honor'>
                    <Table>
                      <TableCaption>Honor Rankings - Players with highest Honor points and Hwan levels</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Race</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Honor Title</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Honor Points</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Hwan Level</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8'>
                              <div className='flex justify-center'>
                                <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8 text-red-400'>
                              Error loading honor rankings: {error}
                            </TableCell>
                          </TableRow>
                        ) : (
                          getDataArray(rankingData)
                            .filter((player) => {
                              const playerName = getPlayerName(player);
                              return playerName.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((player) => (
                              <TableRow
                                key={player.rank}
                                className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                                  player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                                }`}
                              >
                                <TableCell className='font-medium text-center'>
                                  {player.rank <= 3 ? (
                                    <img
                                      src={getRankIcon(player.rank)}
                                      alt={`Rank ${player.rank}`}
                                      className='w-6 h-6 mx-auto'
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling!.textContent = player.rank.toString();
                                      }}
                                    />
                                  ) : (
                                    player.rank
                                  )}
                                  <span className='hidden'>{player.rank}</span>
                                </TableCell>
                                <TableCell className='font-medium text-lafftale-gold'>
                                  <div className='flex items-center gap-2'>
                                    {player.RefObjID && (
                                      <img
                                        src={getRaceIcon(player.RefObjID)}
                                        alt={player.Race || 'Race'}
                                        className='w-4 h-4'
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    {getPlayerName(player)}
                                  </div>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>{player.Race || 'Unknown'}</TableCell>
                                <TableCell className='hidden md:table-cell'>
                                  <div className='flex items-center gap-2'>
                                    {player.HwanLevel && player.HwanLevel > 0 && (
                                      <img
                                        src={getHonorLevelIcon(player.HwanLevel)}
                                        alt={`Honor Level ${player.HwanLevel}`}
                                        className='w-5 h-5'
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <span className='text-yellow-400'>{player.HwanTitle || 'None'}</span>
                                  </div>
                                </TableCell>
                                <TableCell className='text-right'>{player.Honor || 0}</TableCell>
                                <TableCell className='text-right'>{player.HwanLevel || 0}</TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Fortress Player TabContent */}
                  <TabsContent value='fortress-player'>
                    <Table>
                      <TableCaption>Fortress War Player Rankings - Players with most fortress kills</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Guild</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Fortress Kills</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className='text-center py-8'>
                              <div className='flex justify-center'>
                                <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={5} className='text-center py-8 text-red-400'>
                              Error loading fortress rankings: {error}
                            </TableCell>
                          </TableRow>
                        ) : (
                          getDataArray(rankingData)
                            .filter((player) => {
                              const playerName = getPlayerName(player);
                              return playerName.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((player) => (
                              <TableRow
                                key={player.rank}
                                className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                                  player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                                }`}
                              >
                                <TableCell className='font-medium text-center'>
                                  {player.rank <= 3 ? (
                                    <img
                                      src={getRankIcon(player.rank)}
                                      alt={`Rank ${player.rank}`}
                                      className='w-6 h-6 mx-auto'
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling!.textContent = player.rank.toString();
                                      }}
                                    />
                                  ) : (
                                    player.rank
                                  )}
                                  <span className='hidden'>{player.rank}</span>
                                </TableCell>
                                <TableCell className='font-medium text-lafftale-gold'>
                                  <div className='flex items-center gap-2'>
                                    {player.RefObjID && (
                                      <img
                                        src={getRaceIcon(player.RefObjID)}
                                        alt={player.Race || 'Race'}
                                        className='w-4 h-4'
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    {getPlayerName(player)}
                                  </div>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>{player.Level || 'Unknown'}</TableCell>
                                <TableCell className='hidden md:table-cell'>{player.Guild || 'None'}</TableCell>
                                <TableCell className='text-right text-red-400 font-bold'>
                                  {player.FortressKills || 0}
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* PvP K/D TabContent */}
                  <TabsContent value='pvp-kd'>
                    <Table>
                      <TableCaption>PvP Kill/Death Rankings - Players with highest K/D ratios</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Guild</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Kills</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Deaths</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>K/D Ratio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className='text-center py-8'>
                              <div className='flex justify-center'>
                                <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={7} className='text-center py-8 text-red-400'>
                              Error loading PvP rankings: {error}
                            </TableCell>
                          </TableRow>
                        ) : (
                          getDataArray(rankingData)
                            .filter((player) => {
                              const playerName = getPlayerName(player);
                              return playerName.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((player) => (
                              <TableRow
                                key={player.rank}
                                className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                                  player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                                }`}
                              >
                                <TableCell className='font-medium text-center'>
                                  {player.rank <= 3 ? (
                                    <img
                                      src={getRankIcon(player.rank)}
                                      alt={`Rank ${player.rank}`}
                                      className='w-6 h-6 mx-auto'
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling!.textContent = player.rank.toString();
                                      }}
                                    />
                                  ) : (
                                    player.rank
                                  )}
                                  <span className='hidden'>{player.rank}</span>
                                </TableCell>
                                <TableCell className='font-medium text-lafftale-gold'>
                                  <div className='flex items-center gap-2'>
                                    {player.RefObjID && (
                                      <img
                                        src={getRaceIcon(player.RefObjID)}
                                        alt={player.Race || 'Race'}
                                        className='w-4 h-4'
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    {getPlayerName(player)}
                                  </div>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>{player.Level || 'Unknown'}</TableCell>
                                <TableCell className='hidden md:table-cell'>{player.Guild || 'None'}</TableCell>
                                <TableCell className='text-right text-green-400'>{player.PKCount || 0}</TableCell>
                                <TableCell className='text-right text-red-400'>{player.DiedCount || 0}</TableCell>
                                <TableCell className='text-right font-bold text-yellow-400'>
                                  {player.KDRatio ? formatKDRatio(player.KDRatio) : '0.00'}
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Add other existing tabs content here (guilds, unique, etc.) */}
                  <TabsContent value='guilds'>
                    <Table>
                      <TableCaption>Top Guilds by level and skill points</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Guild Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Members</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Guild Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={5} className='text-center py-8'>
                              <div className='flex justify-center'>
                                <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={5} className='text-center py-8 text-red-400'>
                              Error loading guild rankings: {error}
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className='text-center py-8 text-gray-400'>
                              Guild Rankings - Coming Soon
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Add placeholder content for other tabs */}
                  <TabsContent value='unique'>
                    <UniqueRankingTable
                      data={uniqueData}
                      loading={uniqueLoading}
                      error={uniqueError}
                      searchTerm={searchTerm}
                      isMonthly={false}
                    />
                  </TabsContent>

                  {/* Monthly Unique Rankings */}
                  <TabsContent value='unique-monthly'>
                    <UniqueRankingTable
                      data={uniqueMonthlyData}
                      loading={uniqueMonthlyLoading}
                      error={uniqueMonthlyError}
                      searchTerm={searchTerm}
                      isMonthly={true}
                    />
                  </TabsContent>

                  {/* Fortress Guild Rankings */}
                  <TabsContent value='fortress-guild'>
                    <div className='text-center p-8 text-gray-400'>Fortress Guild War Rankings - Coming Soon</div>
                  </TabsContent>

                  {/* Job K/D Rankings */}
                  <TabsContent value='job-kd'>
                    <JobKDRankingTable
                      data={jobKDData}
                      loading={jobKDLoading}
                      error={jobKDError}
                      searchTerm={searchTerm}
                    />
                  </TabsContent>

                  {/* Item Enhancement Rankings */}
                  <TabsContent value='item-plus'>
                    <ItemRankingTable
                      data={itemPlusData}
                      loading={itemPlusLoading}
                      error={itemPlusError}
                      searchTerm={searchTerm}
                      rankingType='enhancement'
                    />
                  </TabsContent>

                  {/* Item Drop Rankings */}
                  <TabsContent value='item-drop'>
                    <ItemRankingTable
                      data={itemDropData}
                      loading={itemDropLoading}
                      error={itemDropError}
                      searchTerm={searchTerm}
                      rankingType='drop'
                    />
                  </TabsContent>

                  {/* Thief Rankings */}
                  <TabsContent value='thief'>
                    <Table>
                      <TableCaption>Top Thieves by Experience and Contribution</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Job Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden lg:table-cell'>Experience</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Contribution</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8'>
                              <div className='flex justify-center'>
                                <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8 text-red-400'>
                              Error loading thief rankings: {error}
                            </TableCell>
                          </TableRow>
                        ) : (
                          getJobDataArray(rankingData)
                            .filter((player) => {
                              const playerName = getPlayerName(player);
                              return playerName.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((player) => (
                              <TableRow
                                key={player.rank}
                                className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                                  player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                                }`}
                              >
                                <TableCell className='font-medium text-center'>
                                  {player.rank <= 3 ? (
                                    <img
                                      src={getRankIcon(player.rank)}
                                      alt={`Rank ${player.rank}`}
                                      className='w-6 h-6 mx-auto'
                                    />
                                  ) : (
                                    <span className='text-lafftale-gold'>{player.rank}</span>
                                  )}
                                </TableCell>
                                <TableCell className='font-semibold text-lafftale-gold'>
                                  <div className='flex items-center gap-2'>
                                    <img
                                      src={getJobTypeIcon(player.JobType)}
                                      alt={getJobTypeName(player.JobType)}
                                      className='w-5 h-5'
                                    />
                                    {getPlayerName(player)}
                                  </div>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>{player.CurLevel}</TableCell>
                                <TableCell className='hidden md:table-cell'>
                                  <span className={`font-bold ${getJobTypeColor(player.JobType)}`}>
                                    {player.JobLevel}
                                  </span>
                                </TableCell>
                                <TableCell className='hidden lg:table-cell'>
                                  {formatJobExperience(player.JobExp)}
                                </TableCell>
                                <TableCell className='text-right font-semibold text-lafftale-gold'>
                                  {player.Contribution?.toLocaleString() || 0}
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Trader Rankings */}
                  <TabsContent value='trader'>
                    <Table>
                      <TableCaption>Top Traders by Experience and Contribution</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Job Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden lg:table-cell'>Experience</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Contribution</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8'>
                              <div className='flex justify-center'>
                                <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8 text-red-400'>
                              Error loading trader rankings: {error}
                            </TableCell>
                          </TableRow>
                        ) : (
                          getJobDataArray(rankingData)
                            .filter((player) => {
                              const playerName = getPlayerName(player);
                              return playerName.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((player) => (
                              <TableRow
                                key={player.rank}
                                className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                                  player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                                }`}
                              >
                                <TableCell className='font-medium text-center'>
                                  {player.rank <= 3 ? (
                                    <img
                                      src={getRankIcon(player.rank)}
                                      alt={`Rank ${player.rank}`}
                                      className='w-6 h-6 mx-auto'
                                    />
                                  ) : (
                                    <span className='text-lafftale-gold'>{player.rank}</span>
                                  )}
                                </TableCell>
                                <TableCell className='font-semibold text-lafftale-gold'>
                                  <div className='flex items-center gap-2'>
                                    <img
                                      src={getJobTypeIcon(player.JobType)}
                                      alt={getJobTypeName(player.JobType)}
                                      className='w-5 h-5'
                                    />
                                    {getPlayerName(player)}
                                  </div>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>{player.CurLevel}</TableCell>
                                <TableCell className='hidden md:table-cell'>
                                  <span className={`font-bold ${getJobTypeColor(player.JobType)}`}>
                                    {player.JobLevel}
                                  </span>
                                </TableCell>
                                <TableCell className='hidden lg:table-cell'>
                                  {formatJobExperience(player.JobExp)}
                                </TableCell>
                                <TableCell className='text-right font-semibold text-lafftale-gold'>
                                  {player.Contribution?.toLocaleString() || 0}
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Hunter Rankings */}
                  <TabsContent value='hunter'>
                    <Table>
                      <TableCaption>Top Hunters by Experience and Contribution</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Job Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden lg:table-cell'>Experience</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Contribution</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8'>
                              <div className='flex justify-center'>
                                <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : error ? (
                          <TableRow>
                            <TableCell colSpan={6} className='text-center py-8 text-red-400'>
                              Error loading hunter rankings: {error}
                            </TableCell>
                          </TableRow>
                        ) : (
                          getJobDataArray(rankingData)
                            .filter((player) => {
                              const playerName = getPlayerName(player);
                              return playerName.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((player) => (
                              <TableRow
                                key={player.rank}
                                className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                                  player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                                }`}
                              >
                                <TableCell className='font-medium text-center'>
                                  {player.rank <= 3 ? (
                                    <img
                                      src={getRankIcon(player.rank)}
                                      alt={`Rank ${player.rank}`}
                                      className='w-6 h-6 mx-auto'
                                    />
                                  ) : (
                                    <span className='text-lafftale-gold'>{player.rank}</span>
                                  )}
                                </TableCell>
                                <TableCell className='font-semibold text-lafftale-gold'>
                                  <div className='flex items-center gap-2'>
                                    <img
                                      src={getJobTypeIcon(player.JobType)}
                                      alt={getJobTypeName(player.JobType)}
                                      className='w-5 h-5'
                                    />
                                    {getPlayerName(player)}
                                  </div>
                                </TableCell>
                                <TableCell className='hidden md:table-cell'>{player.CurLevel}</TableCell>
                                <TableCell className='hidden md:table-cell'>
                                  <span className={`font-bold ${getJobTypeColor(player.JobType)}`}>
                                    {player.JobLevel}
                                  </span>
                                </TableCell>
                                <TableCell className='hidden lg:table-cell'>
                                  {formatJobExperience(player.JobExp)}
                                </TableCell>
                                <TableCell className='text-right font-semibold text-lafftale-gold'>
                                  {player.Contribution?.toLocaleString() || 0}
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Advanced Job Filter */}
                  <TabsContent value='job-advanced'>
                    <AdvancedJobFilter data={getJobDataArray(rankingData)} loading={loading} error={error} />
                  </TabsContent>
                </Tabs>
              ) : activeRankingType === 'analytics' ? (
                <JobAnalyticsDashboard />
              ) : (
                <Tabs defaultValue='lastman' className='mb-6'>
                  <TabsList className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full bg-lafftale-dark p-2 rounded-lg border border-lafftale-gold/20'>
                    <TabsTrigger
                      value='lastman'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Skull size={16} /> Last Man Standing
                    </TabsTrigger>
                    <TabsTrigger
                      value='pvp'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Swords size={16} /> PVP
                    </TabsTrigger>
                    <TabsTrigger
                      value='battlearena'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Shield size={16} /> Battle Arena
                    </TabsTrigger>
                    <TabsTrigger
                      value='survival'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Gamepad2 size={16} /> Survival Arena
                    </TabsTrigger>
                    <TabsTrigger
                      value='captureflag'
                      className='flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
                    >
                      <Flag size={16} /> Capture the Flag
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value='lastman'>
                    <Table>
                      <TableCaption>Showing results 1-25 of 100</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Class</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Wins</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
                            Last Man Standing rankings coming soon...
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value='pvp'>
                    <Table>
                      <TableCaption>Showing results 1-25 of 100</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Class</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Wins</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
                            PvP event rankings coming soon...
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value='battlearena'>
                    <Table>
                      <TableCaption>Showing results 1-25 of 100</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Class</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Wins</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
                            Battle Arena rankings coming soon...
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value='survival'>
                    <Table>
                      <TableCaption>Showing results 1-25 of 100</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Class</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Wins</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
                            Survival Arena rankings coming soon...
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value='captureflag'>
                    <Table>
                      <TableCaption>Showing results 1-25 of 100</TableCaption>
                      <TableHeader>
                        <TableRow className='border-b border-lafftale-gold/30'>
                          <TableHead className='text-lafftale-gold w-16 text-center'>#</TableHead>
                          <TableHead className='text-lafftale-gold'>Name</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Level</TableHead>
                          <TableHead className='text-lafftale-gold hidden md:table-cell'>Class</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Wins</TableHead>
                          <TableHead className='text-lafftale-gold text-right'>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
                            Capture the Flag rankings coming soon...
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              )}

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href='#'
                      className='text-lafftale-gold hover:text-lafftale-bronze hover:bg-lafftale-gold/10'
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href='#' isActive className='bg-lafftale-gold text-lafftale-dark'>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href='#'
                      className='text-lafftale-gold hover:text-lafftale-bronze hover:bg-lafftale-gold/10'
                    >
                      2
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href='#'
                      className='text-lafftale-gold hover:text-lafftale-bronze hover:bg-lafftale-gold/10'
                    >
                      3
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis className='text-lafftale-gold' />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      className='text-lafftale-gold hover:text-lafftale-bronze hover:bg-lafftale-gold/10'
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Rankings;
