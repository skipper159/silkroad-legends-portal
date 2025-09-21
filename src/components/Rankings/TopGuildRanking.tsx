import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankIcon, RankingGuild } from './types';

interface TopGuildRankingProps {
  data: RankingGuild[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const TopGuildRanking: React.FC<TopGuildRankingProps> = ({ data, loading, error, searchTerm }) => {
  const filteredData = data.filter(
    (guild) => guild.Name && guild.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <Table>
      <TableHeader>
        <TableRow className='border-b border-lafftale-gold/20'>
          <TableHead className='text-lafftale-gold font-semibold'>Rank</TableHead>
          <TableHead className='text-lafftale-gold font-semibold'>Guild Name</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Level</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Members</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell'>Alliance</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell'>Notice</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
              No guilds found
            </TableCell>
          </TableRow>
        ) : (
          filteredData.map((guild, index) => (
            <TableRow
              key={guild.ID}
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
              <TableCell className='font-medium text-lafftale-gold'>{guild.Name}</TableCell>
              <TableCell className='hidden md:table-cell'>{guild.Lv || guild.Level || 'Unknown'}</TableCell>
              <TableCell className='hidden md:table-cell'>{guild.MemberCount || 'Unknown'}</TableCell>
              <TableCell className='hidden lg:table-cell'>{guild.Alliance || 'None'}</TableCell>
              <TableCell className='hidden lg:table-cell max-w-xs truncate'>{guild.Notice || 'No notice'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TopGuildRanking;
