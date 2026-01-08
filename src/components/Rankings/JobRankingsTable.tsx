import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRankIcon } from './types';
import RankingPagination from './RankingPagination';

// Job Rankings Interface
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

interface JobRankingTableProps {
  data: JobRanking[];
  statistics: JobStatistics;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  currentPage?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

// Individual Job Table Component
const JobTable: React.FC<JobRankingTableProps & { jobType: string }> = ({
  data,
  statistics,
  loading,
  error,
  searchTerm,
  currentPage = 1,
  hasMore = false,
  onPageChange,
  itemsPerPage = 100,
  totalItems,
  jobType,
}) => {
  const displayData = data;

  // Get Job Icon based on job type
  const getJobIcon = (jobTypeName: string) => {
    switch (jobTypeName.toLowerCase()) {
      case 'hunter':
        return '/assets/job/hunter.png';
      case 'thief':
        return '/assets/job/thief.png';
      case 'trader':
        return '/assets/job/merchant.png';
      default:
        return '/assets/job/hunter.png';
    }
  };

  // Get Job Color
  const getJobColor = (jobTypeName: string) => {
    switch (jobTypeName.toLowerCase()) {
      case 'hunter':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'thief':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'trader':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-theme-text-muted border-gray-500/50';
    }
  };

  // Get Race Image
  const getRaceImage = (race: string) => {
    const raceImages = {
      Chinese: '/assets/race/china.png',
      European: '/assets/race/europe.png',
    };
    return raceImages[race as keyof typeof raceImages] || raceImages.Chinese;
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='w-6 h-6 border-4 border-theme-primary border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8 text-red-400'>
        Error loading {jobType} rankings: {error}
      </div>
    );
  }

  return (
    <div>
      {/* Job Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-theme-surface/50 p-4 rounded-lg border border-theme-primary/20'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-theme-primary'>
              {statistics?.totalHunters || statistics?.totalThieves || statistics?.totalTraders || 0}
            </div>
            <div className='text-sm text-theme-text-muted'>Total {jobType}s</div>
          </div>
        </div>

        <div className='bg-theme-surface/50 p-4 rounded-lg border border-theme-primary/20'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-400'>{Math.round(statistics?.averageLevel || 0)}</div>
            <div className='text-sm text-theme-text-muted'>Average Level</div>
          </div>
        </div>

        <div className='bg-theme-surface/50 p-4 rounded-lg border border-theme-primary/20'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-400'>{statistics?.maxLevel || 0}</div>
            <div className='text-sm text-theme-text-muted'>Max Level</div>
          </div>
        </div>

        <div className='bg-theme-surface/50 p-4 rounded-lg border border-theme-primary/20'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-400'>{(statistics?.totalKills || 0).toLocaleString()}</div>
            <div className='text-sm text-theme-text-muted'>Total Kills</div>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className='border-b border-theme-primary/20'>
            <TableHead className='text-theme-primary font-semibold text-center'>Rank</TableHead>
            <TableHead className='text-theme-primary font-semibold'>Name</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>Job Level</TableHead>
            <TableHead className='text-theme-primary font-semibold hidden md:table-cell text-center'>Job Exp</TableHead>
            <TableHead className='text-theme-primary font-semibold hidden md:table-cell text-center'>Kills</TableHead>
            <TableHead className='text-theme-primary font-semibold hidden md:table-cell text-center'>
              Reputation
            </TableHead>
            <TableHead className='text-theme-primary font-semibold hidden lg:table-cell'>Guild</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='text-center py-8 text-theme-text-muted'>
                No {jobType} rankings found
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((player, index) => {
              const actualRank = (currentPage - 1) * itemsPerPage + index + 1;

              return (
                <TableRow
                  key={player.CharID || index}
                  className={`border-b border-theme-primary/10 hover:bg-lafftale-gold/5 ${
                    actualRank <= 3 ? 'bg-lafftale-gold/10' : ''
                  }`}
                >
                  <TableCell className='font-medium text-center'>
                    {actualRank <= 3 ? (
                      <span
                        className={`text-lg ${
                          actualRank === 1
                            ? 'text-yellow-500'
                            : actualRank === 2
                            ? 'text-theme-text-muted'
                            : 'text-amber-600'
                        }`}
                      >
                        {getRankIcon(actualRank)}
                      </span>
                    ) : (
                      actualRank
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <img src={getRaceImage(player.Race)} alt={player.Race} className='w-4 h-4' />
                      <img src={getJobIcon(player.JobTypeName)} alt={player.JobTypeName} className='w-5 h-5' />
                      <span className='font-medium text-theme-primary'>{player.NickName16 || player.CharName16}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge variant='secondary' className={getJobColor(player.JobTypeName)}>
                      Lv. {player.JobLevel || 1}
                    </Badge>
                  </TableCell>
                  <TableCell className='hidden md:table-cell text-center text-blue-400'>
                    {player.JobExp?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className='hidden md:table-cell text-center text-red-400'>
                    {player.KillCount || 0}
                  </TableCell>
                  <TableCell className='hidden md:table-cell text-center text-green-400'>
                    {player.ReputationPoint?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className='hidden lg:table-cell text-theme-text-muted text-sm'>
                    {player.GuildName === 'DummyGuild' || !player.GuildName ? '-' : player.GuildName}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {onPageChange && (
        <RankingPagination
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}
    </div>
  );
};

// Main Job Rankings Component with Sub-Tabs
interface JobRankingsProps {
  hunterData: JobRanking[];
  thiefData: JobRanking[];
  traderData: JobRanking[];
  hunterStats: JobStatistics;
  thiefStats: JobStatistics;
  traderStats: JobStatistics;
  loading: { hunter: boolean; thief: boolean; trader: boolean };
  error: { hunter: string | null; thief: string | null; trader: string | null };
  searchTerm: string;
  pagination: {
    hunter: { currentPage: number; hasMore: boolean; itemsPerPage: number };
    thief: { currentPage: number; hasMore: boolean; itemsPerPage: number };
    trader: { currentPage: number; hasMore: boolean; itemsPerPage: number };
  };
  onPageChange: {
    hunter: (page: number) => void;
    thief: (page: number) => void;
    trader: (page: number) => void;
  };
}

const JobRankingsTable: React.FC<JobRankingsProps> = ({
  hunterData,
  thiefData,
  traderData,
  hunterStats,
  thiefStats,
  traderStats,
  loading,
  error,
  searchTerm,
  pagination,
  onPageChange,
}) => {
  const [activeJobTab, setActiveJobTab] = useState('hunter');

  return (
    <div className='space-y-4'>
      {/* Job Type Overview - Diese Karten dienen nun auch als Navigation */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div
          className={`bg-theme-surface/50 p-4 rounded-lg border ${
            activeJobTab === 'hunter' ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-blue-500/20'
          } cursor-pointer hover:bg-theme-surface/50 transition-all duration-200`}
          onClick={() => setActiveJobTab('hunter')}
        >
          <div className='flex items-center gap-2 mb-2'>
            <img src='/assets/job/hunter.png' alt='Hunter' className='w-6 h-6' />
            <h3 className='text-blue-400 font-semibold'>Hunters</h3>
          </div>
          <p className='text-theme-text-muted text-sm'>Anti-Thief Specialists</p>
          <p className='text-xs text-theme-text-muted mt-1'>{hunterData.length} active hunters</p>
        </div>

        <div
          className={`bg-theme-surface/50 p-4 rounded-lg border ${
            activeJobTab === 'thief' ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-red-500/20'
          } cursor-pointer hover:bg-theme-surface/50 transition-all duration-200`}
          onClick={() => setActiveJobTab('thief')}
        >
          <div className='flex items-center gap-2 mb-2'>
            <img src='/assets/job/thief.png' alt='Thief' className='w-6 h-6' />
            <h3 className='text-red-400 font-semibold'>Thieves</h3>
          </div>
          <p className='text-theme-text-muted text-sm'>Trade Route Raiders</p>
          <p className='text-xs text-theme-text-muted mt-1'>{thiefData.length} active thieves</p>
        </div>

        <div
          className={`bg-theme-surface/50 p-4 rounded-lg border ${
            activeJobTab === 'trader' ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-green-500/20'
          } cursor-pointer hover:bg-theme-surface/50 transition-all duration-200`}
          onClick={() => setActiveJobTab('trader')}
        >
          <div className='flex items-center gap-2 mb-2'>
            <img src='/assets/job/merchant.png' alt='Trader' className='w-6 h-6' />
            <h3 className='text-green-400 font-semibold'>Traders</h3>
          </div>
          <p className='text-theme-text-muted text-sm'>Commerce Masters</p>
          <p className='text-xs text-theme-text-muted mt-1'>{traderData.length} active traders</p>
        </div>
      </div>

      {/* Dynamische Anzeige der Tabelle je nach aktivem Tab */}
      <div className='mt-6'>
        {activeJobTab === 'hunter' && (
          <JobTable
            data={hunterData}
            statistics={hunterStats}
            loading={loading.hunter}
            error={error.hunter}
            searchTerm={searchTerm}
            currentPage={pagination.hunter.currentPage}
            hasMore={pagination.hunter.hasMore}
            onPageChange={onPageChange.hunter}
            itemsPerPage={pagination.hunter.itemsPerPage}
            jobType='Hunter'
          />
        )}

        {activeJobTab === 'thief' && (
          <JobTable
            data={thiefData}
            statistics={thiefStats}
            loading={loading.thief}
            error={error.thief}
            searchTerm={searchTerm}
            currentPage={pagination.thief.currentPage}
            hasMore={pagination.thief.hasMore}
            onPageChange={onPageChange.thief}
            itemsPerPage={pagination.thief.itemsPerPage}
            jobType='Thief'
          />
        )}

        {activeJobTab === 'trader' && (
          <JobTable
            data={traderData}
            statistics={traderStats}
            loading={loading.trader}
            error={error.trader}
            searchTerm={searchTerm}
            currentPage={pagination.trader.currentPage}
            hasMore={pagination.trader.hasMore}
            onPageChange={onPageChange.trader}
            itemsPerPage={pagination.trader.itemsPerPage}
            jobType='Trader'
          />
        )}
      </div>
    </div>
  );
};

export default JobRankingsTable;
