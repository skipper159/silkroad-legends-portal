// components/Rankings/UniqueRankingTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Gem } from 'lucide-react';

interface UniqueRanking {
  rank: number;
  CharName16: string;
  Level: number;
  UniqueCount: number;
  TotalKills: number;
  TotalPoints: number;
  LastKill?: string;
  Race: string;
  GuildName?: string;
}

interface UniqueRankingTableProps {
  data: UniqueRanking[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  isMonthly?: boolean;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className='h-4 w-4 text-yellow-400' />;
    case 2:
      return <Crown className='h-4 w-4 text-gray-300' />;
    case 3:
      return <Crown className='h-4 w-4 text-amber-600' />;
    default:
      return <span className='text-lafftale-gold font-bold'>#{rank}</span>;
  }
};

const getRaceFlag = (race: string) => {
  return race === 'Chinese' ? '🇨🇳' : '🇪🇺';
};

const getPointsColor = (points: number) => {
  if (points >= 100) return 'text-red-400';
  if (points >= 50) return 'text-orange-400';
  if (points >= 20) return 'text-blue-400';
  if (points >= 10) return 'text-green-400';
  return 'text-gray-400';
};

export const UniqueRankingTable: React.FC<UniqueRankingTableProps> = ({
  data,
  loading,
  error,
  searchTerm,
  isMonthly = false,
}) => {
  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lafftale-gold'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-400 p-8'>
        <p>Error loading unique rankings: {error}</p>
      </div>
    );
  }

  const filteredData = data.filter((player) => player.CharName16?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-4'>
        <Gem className='h-5 w-5 text-lafftale-gold' />
        <h3 className='text-lg font-semibold text-lafftale-gold'>
          {isMonthly ? 'Monthly Unique Monster Rankings' : 'All-Time Unique Monster Rankings'}
        </h3>
        {isMonthly && (
          <Badge variant='outline' className='text-lafftale-gold border-lafftale-gold'>
            Last 30 Days
          </Badge>
        )}
      </div>

      <div className='rounded-lg overflow-hidden border border-lafftale-gold/30'>
        <Table>
          <TableHeader className='bg-lafftale-darkgray/50'>
            <TableRow>
              <TableHead className='text-lafftale-gold text-center w-16'>Rank</TableHead>
              <TableHead className='text-lafftale-gold'>Character</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Level</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Unique Types</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Total Kills</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Points</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Guild</TableHead>
              {isMonthly && <TableHead className='text-lafftale-gold text-center'>Last Kill</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((player) => (
                <TableRow
                  key={`${player.rank}-${player.CharName16}`}
                  className='border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 transition-colors'
                >
                  <TableCell className='text-center font-medium'>{getRankIcon(player.rank)}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <span className='text-xl'>{getRaceFlag(player.Race)}</span>
                      <span className='font-medium text-white'>{player.CharName16}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <Badge variant='outline' className='text-lafftale-gold border-lafftale-gold/50'>
                      {player.Level}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <Gem className='h-3 w-3 text-purple-400' />
                      <span className='text-purple-400 font-bold'>{player.UniqueCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <span className='text-blue-400 font-bold'>{player.TotalKills.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className='text-center'>
                    <span className={`font-bold ${getPointsColor(player.TotalPoints)}`}>
                      {player.TotalPoints.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className='text-center'>
                    {player.GuildName ? (
                      <Badge variant='secondary' className='bg-lafftale-gold/20 text-lafftale-gold'>
                        {player.GuildName}
                      </Badge>
                    ) : (
                      <span className='text-gray-500'>-</span>
                    )}
                  </TableCell>
                  {isMonthly && (
                    <TableCell className='text-center text-gray-400 text-sm'>
                      {player.LastKill ? new Date(player.LastKill).toLocaleDateString() : '-'}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isMonthly ? 8 : 7} className='text-center text-gray-500 py-8'>
                  {searchTerm ? 'No players found matching your search.' : 'No unique kill data available.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
        <h4 className='text-sm font-semibold text-lafftale-gold mb-2'>Legend:</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300'>
          <div className='flex items-center gap-2'>
            <Gem className='h-3 w-3 text-purple-400' />
            <span>Unique Types: Different unique monsters killed</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-blue-400'>●</span>
            <span>Total Kills: Total number of unique monster kills</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-red-400'>●</span>
            <span>Points: Weighted score based on monster difficulty</span>
          </div>
          <div className='flex items-center gap-2'>
            <span>🇨🇳</span>
            <span>Chinese Race</span>
            <span>🇪🇺</span>
            <span>European Race</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueRankingTable;
