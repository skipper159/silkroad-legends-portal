import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRankIcon, getPlayerName, PvPRanking } from './types';
import { useAuth } from '@/context/AuthContext';
import RankingPagination from './RankingPagination';

interface PvPRankingProps {
  data: PvPRanking[];
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

const PvPRankingTable: React.FC<PvPRankingProps> = ({
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
  const PlayerNameComponent: React.FC<{ player: PvPRanking }> = ({ player }) => {
    const playerName = getPlayerName(player);

    if (isAuthenticated) {
      return (
        <Link
          to={`/character/${encodeURIComponent(playerName)}`}
          className='text-theme-primary hover:text-theme-primary/80 transition-colors duration-200 cursor-pointer'
          title={`View ${playerName}'s character details`}
        >
          {playerName}
        </Link>
      );
    }

    return <span className='font-medium text-white'>{playerName}</span>;
  };

  // No client-side filtering needed since search is now handled server-side
  const displayData = data;

  if (loading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='w-6 h-6 border-4 border-theme-primary border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  if (error) {
    return <div className='text-center py-8 text-red-400'>Error loading PvP rankings: {error}</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-theme-primary/20'>
            <TableHead className='text-theme-primary font-semibold text-center'>Rank</TableHead>
            <TableHead className='text-theme-primary font-semibold'>Player</TableHead>
            <TableHead className='text-theme-primary font-semibold hidden md:table-cell'>Level</TableHead>
            <TableHead className='text-theme-primary font-semibold hidden md:table-cell'>Race</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>Kills</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>Deaths</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>K/D Ratio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='text-center py-8 text-theme-text-muted'>
                No PvP rankings found
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((player, index) => {
              // Always prioritize actual rank for accurate ranking
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
                      <PlayerNameComponent player={player} />
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    <Badge variant='outline' className='text-theme-primary border-theme-primary/50'>
                      {player.Level || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    <div className='flex items-center gap-2'>
                      {player.raceInfo ? (
                        <>
                          <img
                            src={`/assets/race/${player.raceInfo.flag === 'cn' ? 'china' : 'europe'}.png`}
                            alt={player.raceInfo.flag === 'cn' ? 'Ch' : 'Eu'}
                            className='w-5 h-5 object-contain'
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className='text-sm'>{player.raceInfo.flag === 'cn' ? 'Ch' : 'Eu'}</span>
                        </>
                      ) : (
                        <>
                          <img
                            src='/assets/race/china.png'
                            alt='Ch'
                            className='w-5 h-5 object-contain'
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-center text-green-400 font-medium'>{player.PK_Count || 0}</TableCell>
                  <TableCell className='text-center text-red-400 font-medium'>{player.PD_Count || 0}</TableCell>
                  <TableCell className='text-center font-semibold text-theme-primary'>
                    {(player.KDRatio || 0).toFixed(2)}
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

export default PvPRankingTable;
