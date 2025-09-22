import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankIcon, getPlayerName, RankingPlayer } from './types';
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
  itemsPerPage = 50,
  totalItems,
}) => {
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
            <TableHead className='text-lafftale-gold font-semibold'>Rank</TableHead>
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
              // Calculate actual rank based on current page
              const actualRank = (currentPage - 1) * itemsPerPage + index + 1;

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
                    <div className='flex items-center gap-2'>{getPlayerName(player)}</div>
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
