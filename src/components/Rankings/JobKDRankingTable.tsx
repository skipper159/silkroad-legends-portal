// components/Rankings/JobKDRankingTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import RankingPagination from './RankingPagination';
import { getRankIcon } from './types';

interface JobKDRanking {
  rank: number;
  CharName16: string;
  Level: number;
  JobKills: number;
  JobDeaths: number;
  KDRatio: number;
  TotalJobLevel: number;
  Race: string;
  GuildName?: string;
  GlobalRank?: number;
}

interface JobKDRankingTableProps {
  data: JobKDRanking[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  // Pagination props
  currentPage?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

const getKDRatioColor = (ratio: number) => {
  if (ratio >= 10) return 'text-red-400 animate-pulse';
  if (ratio >= 5) return 'text-orange-400';
  if (ratio >= 2) return 'text-green-400';
  if (ratio >= 1) return 'text-blue-400';
  return 'text-gray-400';
};

const getJobLevelBadge = (level: number) => {
  if (level >= 300) return 'bg-red-500/20 text-red-400 border-red-400';
  if (level >= 200) return 'bg-purple-500/20 text-purple-400 border-purple-400';
  if (level >= 100) return 'bg-blue-500/20 text-blue-400 border-blue-400';
  if (level >= 50) return 'bg-green-500/20 text-green-400 border-green-400';
  return 'bg-gray-500/20 text-gray-400 border-gray-400';
};

export const JobKDRankingTable: React.FC<JobKDRankingTableProps> = ({
  data,
  loading,
  error,
  searchTerm,
  currentPage = 1,
  hasMore = false,
  onPageChange,
  itemsPerPage = 100,
  totalItems,
}) => {
  const { isAuthenticated } = useAuth();

  // Component for rendering clickable player name
  const PlayerNameComponent: React.FC<{ player: JobKDRanking }> = ({ player }) => {
    if (isAuthenticated) {
      return (
        <Link
          to={`/character/${encodeURIComponent(player.CharName16)}`}
          className='text-lafftale-gold hover:text-lafftale-gold/80 transition-colors duration-200 cursor-pointer'
          title={`View ${player.CharName16}'s character details`}
        >
          {player.CharName16}
        </Link>
      );
    }

    return <span>{player.CharName16}</span>;
  };

  // Component for rendering clickable guild name
  const GuildNameComponent: React.FC<{ guildName: string }> = ({ guildName }) => {
    if (isAuthenticated && guildName && guildName !== 'no guild') {
      return (
        <Link
          to={`/guild/${encodeURIComponent(guildName)}`}
          className='text-lafftale-gold hover:text-lafftale-bronze transition-colors cursor-pointer'
          title={`View ${guildName}'s guild details`}
        >
          {guildName}
        </Link>
      );
    }

    return <span>{guildName || '-'}</span>;
  };

  // No client-side filtering needed since search is now handled server-side
  const displayData = data;

  if (loading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  if (error) {
    return <div className='text-center py-8 text-red-400'>Error loading job K/D rankings: {error}</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-lafftale-gold/20'>
            <TableHead className='text-lafftale-gold font-semibold text-center'>Rank</TableHead>
            <TableHead className='text-lafftale-gold font-semibold'>Player</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Level</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Race</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell'>Guild</TableHead>
            <TableHead className='text-lafftale-gold font-semibold text-center'>Job Level</TableHead>
            <TableHead className='text-lafftale-gold font-semibold text-center hidden lg:table-cell'>
              Job Kills
            </TableHead>
            <TableHead className='text-lafftale-gold font-semibold text-center hidden lg:table-cell'>
              Job Deaths
            </TableHead>
            <TableHead className='text-lafftale-gold font-semibold text-center'>K/D Ratio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className='text-center py-8 text-gray-400'>
                {searchTerm ? 'No players found matching your search.' : 'No job K/D data available.'}
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((player, index) => {
              // Always prioritize GlobalRank from backend for accurate ranking
              const actualRank = player.GlobalRank || player.rank || (currentPage - 1) * itemsPerPage + index + 1;

              // Ensure actualRank is a number and handle edge cases
              const displayRank = Number(actualRank) || index + 1;

              return (
                <TableRow
                  key={`${displayRank}-${player.CharName16}`}
                  className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                    displayRank <= 3 ? 'bg-lafftale-gold/10' : ''
                  }`}
                >
                  <TableCell className='font-medium text-center'>
                    {displayRank <= 3 ? (
                      <div className='flex items-center justify-center'>
                        {displayRank === 1 ? (
                          <span
                            className='text-yellow-500 text-2xl'
                            style={{
                              fontFamily: 'Arial, "Segoe UI Emoji", "Apple Color Emoji", sans-serif',
                              fontSize: '24px',
                            }}
                          >
                            🥇
                          </span>
                        ) : displayRank === 2 ? (
                          <span
                            className='text-gray-400 text-2xl'
                            style={{
                              fontFamily: 'Arial, "Segoe UI Emoji", "Apple Color Emoji", sans-serif',
                              fontSize: '24px',
                            }}
                          >
                            🥈
                          </span>
                        ) : (
                          <span
                            className='text-amber-600 text-2xl'
                            style={{
                              fontFamily: 'Arial, "Segoe UI Emoji", "Apple Color Emoji", sans-serif',
                              fontSize: '24px',
                            }}
                          >
                            🥉
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className='text-lg font-medium text-lafftale-gold'>{displayRank}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <PlayerNameComponent player={player} />
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>{player.Level || 'Unknown'}</TableCell>
                  <TableCell className='hidden md:table-cell'>
                    <div className='flex items-center gap-2'>
                      {/* Display race flag based on race info */}
                      <img
                        src={`/assets/race/${player.Race === 'Chinese' ? 'china' : 'europe'}.png`}
                        alt={player.Race === 'Chinese' ? 'Ch' : 'Eu'}
                        className='w-5 h-5 object-contain'
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='hidden lg:table-cell'>
                    <GuildNameComponent guildName={player.GuildName || ''} />
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge variant='outline' className={getJobLevelBadge(player.TotalJobLevel)}>
                      {player.TotalJobLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center hidden lg:table-cell'>
                    <div className='flex items-center justify-center gap-1'>
                      <Target className='h-3 w-3 text-green-400' />
                      <span className='text-green-400 font-bold'>{player.JobKills.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center hidden lg:table-cell'>
                    <div className='flex items-center justify-center gap-1'>
                      <Target className='h-3 w-3 text-red-400' />
                      <span className='text-red-400 font-bold'>{player.JobDeaths.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <span className={`font-bold text-lg ${getKDRatioColor(player.KDRatio)}`}>
                      {player.KDRatio.toFixed(2)}
                    </span>
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

      {/* Statistics Summary - Only show if we have data and it's not too condensed */}
      {displayData.length > 0 && displayData.length >= 5 && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4'>
          <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-400'>
                {Math.max(...displayData.map((p) => p.JobKills)).toLocaleString()}
              </div>
              <div className='text-sm text-gray-400'>Most Job Kills</div>
            </div>
          </div>
          <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-400'>
                {Math.max(...displayData.map((p) => p.KDRatio)).toFixed(2)}
              </div>
              <div className='text-sm text-gray-400'>Highest K/D Ratio</div>
            </div>
          </div>
          <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-400'>
                {Math.max(...displayData.map((p) => p.TotalJobLevel))}
              </div>
              <div className='text-sm text-gray-400'>Highest Job Level</div>
            </div>
          </div>
          <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-400'>
                {displayData.filter((p) => p.KDRatio >= 5).length}
              </div>
              <div className='text-sm text-gray-400'>Elite Fighters (5+ K/D)</div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20 mt-4'>
        <h4 className='text-sm font-semibold text-lafftale-gold mb-2'>Job Combat System:</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300'>
          <div className='flex items-center gap-2'>
            <Target className='h-3 w-3 text-green-400' />
            <span>Job Kills: Killing players of opposing job types</span>
          </div>
          <div className='flex items-center gap-2'>
            <Target className='h-3 w-3 text-red-400' />
            <span>Job Deaths: Being killed by opposing job players</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-red-400'>●</span>
            <span>10+ K/D: Legendary Job Warrior</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-orange-400'>●</span>
            <span>5+ K/D: Elite Job Fighter</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-green-400'>●</span>
            <span>2+ K/D: Skilled Job Combat</span>
          </div>
          <div className='flex items-center gap-2'>
            <img src='/assets/race/china.png' alt='Ch' className='w-5 h-5' />
            <span>Chinese Race</span>
            <img src='/assets/race/europe.png' alt='Eu' className='w-5 h-5 ml-2' />
            <span>European Race</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobKDRankingTable;
