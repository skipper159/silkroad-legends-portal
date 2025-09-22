import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankIcon, FortressRanking } from './types';

interface FortressRankingProps {
  data: FortressRanking[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const FortressRankingTable: React.FC<FortressRankingProps> = ({ data, loading, error, searchTerm }) => {
  const filteredData = data.filter(
    (fortress) =>
      (fortress.GuildName && fortress.GuildName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (fortress.FortressName && fortress.FortressName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        {filteredData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className='text-center py-8 text-gray-400'>
              No fortress rankings found
            </TableCell>
          </TableRow>
        ) : (
          filteredData.map((fortress, index) => (
            <TableRow
              key={fortress.GuildID}
              className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                index < 3 ? 'bg-lafftale-gold/10' : ''
              }`}
            >
              <TableCell className='font-medium text-center'>
                {index < 3 ? (
                  <span
                    className={`text-lg ${
                      index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'
                    }`}
                  >
                    {getRankIcon(index + 1)}
                  </span>
                ) : (
                  index + 1
                )}
              </TableCell>
              <TableCell className='font-medium text-lafftale-gold'>{fortress.FortressName}</TableCell>
              <TableCell className='font-medium'>{fortress.GuildName}</TableCell>
              <TableCell className='hidden md:table-cell'>{fortress.TaxRatio}%</TableCell>
              <TableCell className='hidden md:table-cell'>{fortress.DefenseLevel}</TableCell>
              <TableCell className='hidden lg:table-cell'>
                {fortress.LastConquest ? new Date(fortress.LastConquest).toLocaleDateString() : 'Unknown'}
              </TableCell>
              <TableCell className='hidden lg:table-cell'>{fortress.Region || 'Unknown'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default FortressRankingTable;
