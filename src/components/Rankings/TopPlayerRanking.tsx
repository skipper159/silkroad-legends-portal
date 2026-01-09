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

// Helper to get race icon (matching UniqueRankingTable style)
const getRaceIcon = (player: RankingPlayer) => {
  // Use raceInfo if available, otherwise fall back to 'cn' (China)
  // Logic matches UniqueRankingTable fallback
  const flag = player.raceInfo?.flag || 'cn';

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
          className='text-theme-primary hover:text-theme-primary/80 transition-colors duration-200 cursor-pointer'
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
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary'></div>
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
          <TableRow className='border-b border-theme-primary/20'>
            <TableHead className='text-theme-primary font-semibold text-center'>Rank</TableHead>
            <TableHead className='text-theme-primary font-semibold'>Player</TableHead>
            <TableHead className='text-theme-primary font-semibold hidden md:table-cell text-center'>Level</TableHead>
            <TableHead className='text-theme-primary font-semibold hidden lg:table-cell text-center'>Guild</TableHead>
            <TableHead className='text-theme-primary font-semibold text-center'>Item Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='text-center py-8 text-theme-text-muted'>
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
                  className={`border-b border-theme-primary/10 hover:bg-lafftale-gold/5 transition-colors ${
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
                      {getRaceIcon(player)}
                      <PlayerNameComponent player={player} />
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell text-center'>
                    {player.CurLevel || player.Level || 'Unknown'}
                  </TableCell>
                  <TableCell className='hidden lg:table-cell text-center'>
                    {player.GuildName || player.Guild || 'no guild'}
                  </TableCell>
                  <TableCell className='text-center font-semibold text-theme-primary'>
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
