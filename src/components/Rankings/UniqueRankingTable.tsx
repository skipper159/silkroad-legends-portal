// components/Rankings/UniqueRankingTable.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Gem } from 'lucide-react';
import { getRankIcon } from './types';
import { useAuth } from '@/context/AuthContext';
import RankingPagination from './RankingPagination';

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
  raceInfo?: {
    name: string;
    flag: string;
  };
}

interface UniqueRankingTableProps {
  data: UniqueRanking[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  isMonthly?: boolean;
  // Pagination props
  currentPage?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

const getRaceIcon = (player: UniqueRanking) => {
  // Use raceInfo if available, otherwise fall back to Race string
  let flag = '';
  if (player.raceInfo) {
    flag = player.raceInfo.flag;
  } else {
    // Fallback: assume Chinese if Race contains 'Chinese', otherwise European
    flag = player.Race === 'Chinese' ? 'cn' : 'eu';
  }

  return (
    <img
      src={`/assets/race/${flag === 'cn' ? 'china' : 'europe'}.png`}
      alt={flag === 'cn' ? 'Ch' : 'Eu'}
      className='w-5 h-5 object-contain'
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

const getPointsColor = (points: number) => {
  if (points >= 100) return 'text-red-400';
  if (points >= 50) return 'text-orange-400';
  if (points >= 20) return 'text-blue-400';
  if (points >= 10) return 'text-green-400';
  return 'text-theme-text-muted';
};

export const UniqueRankingTable: React.FC<UniqueRankingTableProps> = ({
  data,
  loading,
  error,
  searchTerm,
  isMonthly = false,
  currentPage = 1,
  hasMore = false,
  onPageChange,
  itemsPerPage = 100,
  totalItems,
}) => {
  const { isAuthenticated } = useAuth();

  // Component for rendering clickable player name
  const PlayerNameComponent: React.FC<{ player: UniqueRanking }> = ({ player }) => {
    if (isAuthenticated) {
      return (
        <Link
          to={`/character/${encodeURIComponent(player.CharName16)}`}
          className='text-theme-primary hover:text-theme-primary/80 transition-colors duration-200 cursor-pointer'
          title={`View ${player.CharName16}'s character details`}
        >
          {player.CharName16}
        </Link>
      );
    }

    return <span className='font-medium text-white'>{player.CharName16}</span>;
  };

  // Component for rendering clickable guild name
  const GuildNameComponent: React.FC<{ guildName: string }> = ({ guildName }) => {
    // Prüfen ob es DummyGuild ist und entsprechend '-' anzeigen
    if (guildName === 'DummyGuild') {
      return <span>-</span>;
    }

    if (isAuthenticated && guildName && guildName !== 'no guild') {
      return (
        <Link
          to={`/guild/${encodeURIComponent(guildName)}`}
          className='text-theme-primary hover:text-theme-accent transition-colors cursor-pointer'
          title={`View ${guildName}'s guild details`}
        >
          {guildName}
        </Link>
      );
    }

    return <span>{guildName || '-'}</span>;
  };
  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-400 p-8'>
        <p>Error loading unique rankings: {error}</p>
      </div>
    );
  }

  const filteredData = data.filter((player) => player.CharName16?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-theme-primary/20'>
            <TableHead className='text-theme-primary font-semibold text-center'>Rank</TableHead>
            <TableHead className='text-theme-primary font-semibold'>Character</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>Guild</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>Level</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>Total Kills</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map((player) => (
              <TableRow
                key={`${player.rank}-${player.CharName16}`}
                className={`border-b border-theme-primary/10 hover:bg-lafftale-gold/5 transition-colors ${
                  player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                }`}
              >
                <TableCell className='text-center font-medium'>
                  <div className='flex items-center justify-center'>
                    {player.rank <= 3 ? (
                      <span
                        className={`text-lg ${
                          player.rank === 1
                            ? 'text-yellow-500'
                            : player.rank === 2
                            ? 'text-theme-text-muted'
                            : 'text-amber-600'
                        }`}
                      >
                        {getRankIcon(player.rank)}
                      </span>
                    ) : (
                      <span className='text-lg'>{getRankIcon(player.rank)}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    {getRaceIcon(player)}
                    <PlayerNameComponent player={player} />
                  </div>
                </TableCell>
                <TableCell className='text-center'>
                  <GuildNameComponent guildName={player.GuildName || ''} />
                </TableCell>
                <TableCell className='text-center'>
                  <span className='text-theme-primary'>{player.Level}</span>
                </TableCell>
                <TableCell className='text-center'>
                  <span className='text-blue-400 font-bold'>{player.TotalKills.toLocaleString()}</span>
                </TableCell>
                <TableCell className='text-center'>
                  <span className={`font-bold ${getPointsColor(player.TotalPoints)}`}>
                    {player.TotalPoints.toLocaleString()}
                  </span>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className='text-center text-theme-text-muted py-8'>
                {searchTerm ? 'No players found matching your search.' : 'No unique kill data available.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {onPageChange && (
        <div className='mt-4'>
          <RankingPagination
            currentPage={currentPage}
            hasMore={hasMore}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      )}

      {/* Legend */}
      <div className='mt-4 bg-theme-surface/30 rounded-lg p-4 border border-theme-primary/20'>
        <h4 className='text-sm font-semibold text-theme-primary mb-2'>Legend:</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-theme-text-muted'>
          <div className='flex items-center gap-2'>
            <span className='text-blue-400'>●</span>
            <span>Total Kills: Total number of unique monster kills</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-red-400'>●</span>
            <span>Points: Weighted score based on monster difficulty</span>
          </div>
          <div className='flex items-center gap-2'>
            <img src='/assets/race/china.png' alt='Ch' className='w-4 h-4 object-contain' />
            <span>Chinese Race</span>
            <img src='/assets/race/europe.png' alt='Eu' className='w-4 h-4 object-contain' />
            <span>European Race</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueRankingTable;
