// components/Rankings/JobKDRankingTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Crown, Swords, Target } from 'lucide-react';

interface JobKDRanking {
  rank: number;
  CharName16: string;
  Level: number;
  JobKills: number;
  JobDeaths: number;
  KDRatio: number;
  TotalJobLevel: number;
  Race: string;
  GuildName?: string;
}

interface JobKDRankingTableProps {
  data: JobKDRanking[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
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

const getKDRatioColor = (ratio: number) => {
  if (ratio >= 10) return 'text-red-400 animate-pulse';
  if (ratio >= 5) return 'text-orange-400';
  if (ratio >= 2) return 'text-green-400';
  if (ratio >= 1) return 'text-blue-400';
  return 'text-gray-400';
};

const getJobLevelBadge = (level: number) => {
  if (level >= 300) return 'bg-red-500/20 text-red-400 border-red-400';
  if (level >= 200) return 'bg-purple-500/20 text-purple-400 border-purple-400';
  if (level >= 100) return 'bg-blue-500/20 text-blue-400 border-blue-400';
  if (level >= 50) return 'bg-green-500/20 text-green-400 border-green-400';
  return 'bg-gray-500/20 text-gray-400 border-gray-400';
};

export const JobKDRankingTable: React.FC<JobKDRankingTableProps> = ({ data, loading, error, searchTerm }) => {
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
        <p>Error loading job K/D rankings: {error}</p>
      </div>
    );
  }

  const filteredData = data.filter((player) => player.CharName16?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2 mb-4'>
        <Swords className='h-5 w-5 text-lafftale-gold' />
        <h3 className='text-lg font-semibold text-lafftale-gold'>Job Kill/Death Rankings</h3>
        <Badge variant='outline' className='text-lafftale-gold border-lafftale-gold'>
          PvP Job Combat
        </Badge>
      </div>

      <div className='rounded-lg overflow-hidden border border-lafftale-gold/30'>
        <Table>
          <TableHeader className='bg-lafftale-darkgray/50'>
            <TableRow>
              <TableHead className='text-lafftale-gold text-center w-16'>Rank</TableHead>
              <TableHead className='text-lafftale-gold'>Character</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Level</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Job Level</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Job Kills</TableHead>
              <TableHead className='text-lafftale-gold text-center'>Job Deaths</TableHead>
              <TableHead className='text-lafftale-gold text-center'>K/D Ratio</TableHead>
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
                  <TableCell className='text-center'>
                    <Badge variant='outline' className={getJobLevelBadge(player.TotalJobLevel)}>
                      {player.TotalJobLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <Target className='h-3 w-3 text-green-400' />
                      <span className='text-green-400 font-bold'>{player.JobKills.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <Target className='h-3 w-3 text-red-400' />
                      <span className='text-red-400 font-bold'>{player.JobDeaths.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-center'>
                    <span className={`font-bold text-lg ${getKDRatioColor(player.KDRatio)}`}>
                      {player.KDRatio.toFixed(2)}
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className='text-center text-gray-500 py-8'>
                  {searchTerm ? 'No players found matching your search.' : 'No job K/D data available.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Statistics Summary */}
      {filteredData.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-400'>
                {Math.max(...filteredData.map((p) => p.JobKills)).toLocaleString()}
              </div>
              <div className='text-sm text-gray-400'>Most Job Kills</div>
            </div>
          </div>
          <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-400'>
                {Math.max(...filteredData.map((p) => p.KDRatio)).toFixed(2)}
              </div>
              <div className='text-sm text-gray-400'>Highest K/D Ratio</div>
            </div>
          </div>
          <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-400'>
                {Math.max(...filteredData.map((p) => p.TotalJobLevel))}
              </div>
              <div className='text-sm text-gray-400'>Highest Job Level</div>
            </div>
          </div>
          <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-400'>
                {filteredData.filter((p) => p.KDRatio >= 5).length}
              </div>
              <div className='text-sm text-gray-400'>Elite Fighters (5+ K/D)</div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className='bg-lafftale-darkgray/30 rounded-lg p-4 border border-lafftale-gold/20'>
        <h4 className='text-sm font-semibold text-lafftale-gold mb-2'>Job Combat System:</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300'>
          <div className='flex items-center gap-2'>
            <Target className='h-3 w-3 text-green-400' />
            <span>Job Kills: Killing players of opposing job types</span>
          </div>
          <div className='flex items-center gap-2'>
            <Target className='h-3 w-3 text-red-400' />
            <span>Job Deaths: Being killed by opposing job players</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-red-400'>●</span>
            <span>10+ K/D: Legendary Job Warrior</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-orange-400'>●</span>
            <span>5+ K/D: Elite Job Fighter</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-green-400'>●</span>
            <span>2+ K/D: Skilled Job Combat</span>
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

export default JobKDRankingTable;
