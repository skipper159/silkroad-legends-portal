import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankIcon, RankingGuild } from './types';
import RankingPagination from './RankingPagination';

interface TopGuildRankingProps {
  data: RankingGuild[];
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

const TopGuildRanking: React.FC<TopGuildRankingProps> = ({
  data,
  loading,
  error,
  searchTerm,
  currentPage = 1,
  hasMore = false,
  onPageChange,
  itemsPerPage = 25,
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
    return <div className='text-center py-8 text-red-400'>Error loading guild rankings: {error}</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-lafftale-gold/20'>
            <TableHead className='text-lafftale-gold font-semibold'>Rank</TableHead>
            <TableHead className='text-lafftale-gold font-semibold'>Guild Name</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Level</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Members</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell'>Alliance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='text-center py-8 text-gray-400'>
                No guilds found
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((guild, index) => {
              const actualRank = (currentPage - 1) * itemsPerPage + index + 1;

              return (
                <TableRow
                  key={guild.ID || index}
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
                  <TableCell className='font-medium'>{guild.Name}</TableCell>
                  <TableCell className='hidden md:table-cell'>{guild.Lv || guild.Level || 'Unknown'}</TableCell>
                  <TableCell className='hidden md:table-cell'>{guild.MemberCount || 'Unknown'}</TableCell>
                  <TableCell className='hidden lg:table-cell'>{guild.Alliance || 'no alliance'}</TableCell>
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

export default TopGuildRanking;
