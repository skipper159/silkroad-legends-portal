// components/Rankings/ItemRankingTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Star, Gift, Gem } from 'lucide-react';

interface ItemRanking {
  rank: number;
  CharName16: string;
  Level: number;
  Race: string;
  GuildName?: string;
  // For Enhancement Rankings
  HighEnhancements?: number;
  MaxEnhancement?: number;
  TotalEnhancements?: number;
  // For Drop Rankings
  SealOfSunDrops?: number;
  SealOfMoonDrops?: number;
  SealOfStarDrops?: number;
  SealOfNovaDrops?: number;
  TotalRareDrops?: number;
  LastDrop?: string;
}

interface ItemRankingTableProps {
  data: ItemRanking[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  rankingType: 'enhancement' | 'drop';
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

const getEnhancementColor = (level: number) => {
  if (level >= 15) return 'text-red-400 animate-pulse';
  if (level >= 12) return 'text-purple-400';
  if (level >= 9) return 'text-blue-400';
  if (level >= 6) return 'text-green-400';
  return 'text-yellow-400';
};

const getSealIcon = (type: string) => {
  switch (type) {
    case 'sun':
      return '☀️';
    case 'moon':
      return '🌙';
    case 'star':
      return '⭐';
    case 'nova':
      return '💥';
    default:
      return '💎';
  }
};

export const ItemRankingTable: React.FC<ItemRankingTableProps> = ({
  data,
  loading,
  error,
  searchTerm,
  rankingType,
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
        <p>Error loading item rankings: {error}</p>
      </div>
    );
  }

  const filteredData = data.filter((player) => player.CharName16?.toLowerCase().includes(searchTerm.toLowerCase()));

  const isEnhancement = rankingType === 'enhancement';

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-4'>
        {isEnhancement ? (
          <Star className='h-5 w-5 text-lafftale-gold' />
        ) : (
          <Gift className='h-5 w-5 text-lafftale-gold' />
        )}
        <h3 className='text-lg font-semibold text-lafftale-gold'>
          {isEnhancement ? 'Item Enhancement Rankings' : 'Rare Item Drop Rankings'}
        </h3>
        <Badge variant='outline' className='text-lafftale-gold border-lafftale-gold'>
          Last 6 Months
        </Badge>
      </div>

      <div className='rounded-lg overflow-hidden border border-lafftale-gold/30'>
        <Table>
          <TableHeader className='bg-lafftale-darkgray/50'>
            <TableRow>
              <TableHead className='text-lafftale-gold text-center w-16'>Rank</TableHead>
              <TableHead className='text-lafftale-gold'>Character</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Level</TableHead>
              {isEnhancement ? (
                <>
                  <TableHead className='text-lafftale-gold text-center'>Max Enhancement</TableHead>
                  <TableHead className='text-lafftale-gold text-center'>High Enhancements</TableHead>
                  <TableHead className='text-lafftale-gold text-center'>Total Attempts</TableHead>
                </>
              ) : (
                <>
                  <TableHead className='text-lafftale-gold text-center'>☀️ Sun</TableHead>
                  <TableHead className='text-lafftale-gold text-center'>🌙 Moon</TableHead>
                  <TableHead className='text-lafftale-gold text-center'>⭐ Star</TableHead>
                  <TableHead className='text-lafftale-gold text-center'>💥 Nova</TableHead>
                  <TableHead className='text-lafftale-gold text-center'>Total Drops</TableHead>
                </>
              )}
              <TableHead className='text-lafftale-gold text-center'>Guild</TableHead>
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
                  {isEnhancement ? (
                    <>
                      <TableCell className='text-center'>
                        <div className='flex items-center justify-center gap-1'>
                          <Star className='h-3 w-3 text-yellow-400' />
                          <span className={`font-bold ${getEnhancementColor(player.MaxEnhancement || 0)}`}>
                            +{player.MaxEnhancement || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='text-purple-400 font-bold'>
                          {player.HighEnhancements?.toLocaleString() || 0}
                        </span>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='text-blue-400'>{player.TotalEnhancements?.toLocaleString() || 0}</span>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className='text-center'>
                        <span className='text-orange-400 font-bold'>{player.SealOfSunDrops || 0}</span>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='text-blue-400 font-bold'>{player.SealOfMoonDrops || 0}</span>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='text-yellow-400 font-bold'>{player.SealOfStarDrops || 0}</span>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='text-red-400 font-bold'>{player.SealOfNovaDrops || 0}</span>
                      </TableCell>
                      <TableCell className='text-center'>
                        <span className='text-purple-400 font-bold'>
                          {player.TotalRareDrops?.toLocaleString() || 0}
                        </span>
                      </TableCell>
                    </>
                  )}
                  <TableCell className='text-center'>
                    {player.GuildName ? (
                      <Badge variant='secondary' className='bg-lafftale-gold/20 text-lafftale-gold'>
                        {player.GuildName}
                      </Badge>
                    ) : (
                      <span className='text-gray-500'>-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isEnhancement ? 7 : 9} className='text-center text-gray-500 py-8'>
                  {searchTerm ? 'No players found matching your search.' : 'No item data available.'}
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
          {isEnhancement ? (
            <>
              <div className='flex items-center gap-2'>
                <Star className='h-3 w-3 text-yellow-400' />
                <span>Max Enhancement: Highest enhancement level achieved</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-purple-400'>●</span>
                <span>High Enhancements: Items enhanced to +8 or higher</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-blue-400'>●</span>
                <span>Total Attempts: All enhancement attempts</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-red-400'>●</span>
                <span>+15: Legendary Enhancement (Extremely Rare)</span>
              </div>
            </>
          ) : (
            <>
              <div className='flex items-center gap-2'>
                <span>☀️</span>
                <span>Seal of Sun: Highest tier seal drops</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>🌙</span>
                <span>Seal of Moon: High tier seal drops</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>⭐</span>
                <span>Seal of Star: Mid tier seal drops</span>
              </div>
              <div className='flex items-center gap-2'>
                <span>💥</span>
                <span>Seal of Nova: Special set seal drops</span>
              </div>
            </>
          )}
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

export default ItemRankingTable;
