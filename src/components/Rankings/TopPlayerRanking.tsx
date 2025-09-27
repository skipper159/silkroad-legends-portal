import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankIcon, getPlayerName, RankingPlayer } from './types';
import { useAuth } from '@/context/AuthContext';
import RankingPagination from './RankingPagination';

interface TopPlayerRankingProps {
  data: RankingPlayer[];
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

const TopPlayerRanking: React.FC<TopPlayerRankingProps> = ({
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
  const PlayerNameComponent: React.FC<{ player: RankingPlayer }> = ({ player }) => {
    const playerName = getPlayerName(player);

    if (isAuthenticated) {
      return (
        <Link
          to={`/character/${encodeURIComponent(playerName)}`}
          className='text-lafftale-gold hover:text-lafftale-gold/80 transition-colors duration-200 cursor-pointer'
          title={`View ${playerName}'s character details`}
        >
          {playerName}
        </Link>
      );
    }

    return <span>{playerName}</span>;
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
    return <div className='text-center py-8 text-red-400'>Error loading player rankings: {error}</div>;
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
            <TableHead className='text-lafftale-gold font-semibold text-right'>Item Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
                No players found
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((player, index) => {
              // Always prioritize GlobalRank from backend for accurate ranking
              // This ensures search results show the actual global rank, not just position in search results
              const actualRank = player.GlobalRank || (currentPage - 1) * itemsPerPage + index + 1;

              return (
                <TableRow
                  key={player.CharID || index}
                  className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                    actualRank <= 3 ? 'bg-lafftale-gold/10' : ''
                  }`}
                >
                  <TableCell className='font-medium text-center'>
                    {actualRank <= 3 ? (
                      <span
                        className={`text-lg ${
                          actualRank === 1 ? 'text-yellow-500' : actualRank === 2 ? 'text-gray-400' : 'text-amber-600'
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
                  <TableCell className='hidden md:table-cell'>{player.CurLevel || player.Level || 'Unknown'}</TableCell>
                  <TableCell className='hidden md:table-cell'>
                    <div className='flex items-center gap-2'>
                      {/* Display race flag based on race info */}
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
                            className='w-6 h-6 object-contain'
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className='text-sm'>Ch</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='hidden lg:table-cell'>
                    {player.GuildName || player.Guild || 'no guild'}
                  </TableCell>
                  <TableCell className='text-right font-semibold text-lafftale-gold'>
                    {player.ItemPoints || '0'}
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

export default TopPlayerRanking;
