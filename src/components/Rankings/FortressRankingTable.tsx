import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRankIcon, FortressRanking } from './types';
import RankingPagination from './RankingPagination';

interface FortressRankingProps {
  data: FortressRanking[];
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

const FortressRankingTable: React.FC<FortressRankingProps> = ({
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
    return <div className='text-center py-8 text-red-400'>Error loading fortress rankings: {error}</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-lafftale-gold/20'>
            <TableHead className='text-lafftale-gold font-semibold text-center'>Rank</TableHead>
            <TableHead className='text-lafftale-gold font-semibold'>Fortress</TableHead>
            <TableHead className='text-lafftale-gold font-semibold'>Guild</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Tax Ratio</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Defense Level</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell'>Last Conquest</TableHead>
            <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell'>Region</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='text-center py-8 text-gray-400'>
                No fortress rankings found
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((fortress, index) => {
              const actualRank = (currentPage - 1) * itemsPerPage + index + 1;

              return (
                <TableRow
                  key={fortress.GuildID || index}
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
                    <Badge variant='outline' className='text-lafftale-gold border-lafftale-gold/50'>
                      {fortress.FortressName}
                    </Badge>
                  </TableCell>
                  <TableCell className='font-medium text-lafftale-gold'>{fortress.GuildName}</TableCell>
                  <TableCell className='hidden md:table-cell text-center'>{fortress.TaxRatio}%</TableCell>
                  <TableCell className='hidden md:table-cell text-center'>
                    <Badge variant='secondary' className='bg-blue-500/20 text-blue-400'>
                      Lv. {fortress.DefenseLevel || 1}
                    </Badge>
                  </TableCell>
                  <TableCell className='hidden lg:table-cell text-gray-400 text-sm'>
                    {fortress.LastConquest ? new Date(fortress.LastConquest).toLocaleDateString() : 'Unknown'}
                  </TableCell>
                  <TableCell className='hidden lg:table-cell text-gray-400 text-sm'>
                    {fortress.Region || 'Unknown'}
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

export default FortressRankingTable;
