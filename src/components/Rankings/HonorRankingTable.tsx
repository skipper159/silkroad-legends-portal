import React from 'react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankIcon, getPlayerName, HonorRanking } from './types';
import { useAuth } from '@/context/AuthContext';
import RankingPagination from './RankingPagination';

interface HonorRankingProps {
  data: HonorRanking[];
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

const HonorRankingTable: React.FC<HonorRankingProps> = ({
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
  const PlayerNameComponent: React.FC<{ player: HonorRanking }> = ({ player }) => {
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

  // Component for rendering clickable guild name
  const GuildNameComponent: React.FC<{ guildName: string }> = ({ guildName }) => {
    if (!guildName || guildName === 'no guild' || guildName === '' || guildName === 'DummyGuild') {
      return <span className='text-gray-400'>-</span>;
    }

    if (isAuthenticated) {
      return (
        <Link
          to={`/guild/${encodeURIComponent(guildName)}`}
          className='text-lafftale-gold hover:text-lafftale-gold/80 transition-colors duration-200 cursor-pointer'
          title={`View ${guildName} guild details`}
        >
          {guildName}
        </Link>
      );
    }

    return <span>{guildName}</span>;
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
    return <div className='text-center py-8 text-red-400'>Error loading honor rankings: {error}</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-lafftale-gold/20'>
            <TableHead className='text-lafftale-gold font-semibold text-center'>Rank</TableHead>
            <TableHead className='text-lafftale-gold font-semibold'>Player</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Guild</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell text-center'>Level</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell text-center'>Race</TableHead>
            <TableHead className='text-lafftale-gold font-semibold text-center'>Honor Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
                No honor rankings found
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((player, index) => {
              // Calculate actual rank based on pagination
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
                    <div className='flex items-center gap-2'>
                      <PlayerNameComponent player={player} />
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    <GuildNameComponent guildName={player.GuildName || 'no guild'} />
                  </TableCell>
                  <TableCell className='hidden md:table-cell text-center'>{player.Level || 'Unknown'}</TableCell>
                  <TableCell className='hidden lg:table-cell text-center'>
                    <div className='flex items-center justify-center'>
                      {/* Display race flag based on race info */}
                      {player.raceInfo ? (
                        <img
                          src={`/assets/race/${player.raceInfo.flag === 'cn' ? 'china' : 'europe'}.png`}
                          alt={player.raceInfo.flag === 'cn' ? 'Ch' : 'Eu'}
                          className='w-5 h-5 object-contain'
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <img
                          src='/assets/race/china.png'
                          alt='Ch'
                          className='w-5 h-5 object-contain'
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-center font-semibold text-lafftale-gold'>
                    {(player.HonorPoint || 0).toLocaleString()}
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

export default HonorRankingTable;
