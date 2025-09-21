import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankIcon, getPlayerName, HonorRanking } from './types';

interface HonorRankingProps {
  data: HonorRanking[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const HonorRankingTable: React.FC<HonorRankingProps> = ({ data, loading, error, searchTerm }) => {
  const filteredData = data.filter((player) => {
    const playerName = getPlayerName(player);
    return playerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
    <Table>
      <TableHeader>
        <TableRow className='border-b border-lafftale-gold/20'>
          <TableHead className='text-lafftale-gold font-semibold'>Rank</TableHead>
          <TableHead className='text-lafftale-gold font-semibold'>Player</TableHead>
          <TableHead className='text-lafftale-gold font-semibold'>Honor Points</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Level</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell'>Last HK Time</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className='text-center py-8 text-gray-400'>
              No honor rankings found
            </TableCell>
          </TableRow>
        ) : (
          filteredData.map((player, index) => (
            <TableRow
              key={player.CharID}
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
              <TableCell>
                <div className='flex items-center gap-2'>
                  {player.raceInfo && (
                    <img
                      src={`/images/flags/${player.raceInfo.flag}.png`}
                      alt={player.raceInfo.name}
                      className='w-4 h-4'
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {getPlayerName(player)}
                </div>
              </TableCell>
              <TableCell className='font-semibold text-lafftale-gold'>
                {(player.HonorPoint || 0).toLocaleString()}
              </TableCell>
              <TableCell className='hidden md:table-cell'>{player.Level || 'Unknown'}</TableCell>
              <TableCell className='hidden lg:table-cell'>
                {player.LatestHKTime ? new Date(player.LatestHKTime).toLocaleDateString() : 'Never'}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default HonorRankingTable;
