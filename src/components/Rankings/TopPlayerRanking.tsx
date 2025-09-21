import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRankIcon, getPlayerName, RankingPlayer } from './types';

interface TopPlayerRankingProps {
  data: RankingPlayer[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
}

const TopPlayerRanking: React.FC<TopPlayerRankingProps> = ({ data, loading, error, searchTerm }) => {
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
    return <div className='text-center py-8 text-red-400'>Error loading player rankings: {error}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className='border-b border-lafftale-gold/20'>
          <TableHead className='text-lafftale-gold font-semibold'>Rank</TableHead>
          <TableHead className='text-lafftale-gold font-semibold'>Player</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Level</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden md:table-cell'>Race</TableHead>
          <TableHead className='text-lafftale-gold font-semibold hidden lg:table-cell'>Guild</TableHead>
          <TableHead className='text-lafftale-gold font-semibold text-right'>Gold</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className='text-center py-8 text-gray-400'>
              No players found
            </TableCell>
          </TableRow>
        ) : (
          filteredData.map((player, index) => (
            <TableRow
              key={player.CharID || index}
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
              <TableCell className='hidden md:table-cell'>{player.CurLevel || player.Level || 'Unknown'}</TableCell>
              <TableCell className='hidden md:table-cell'>{player.raceInfo?.name || 'Unknown'}</TableCell>
              <TableCell className='hidden lg:table-cell'>{player.GuildName || player.Guild || 'None'}</TableCell>
              <TableCell className='text-right'>{player.formattedGold || player.RemainGold || '0'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TopPlayerRanking;
