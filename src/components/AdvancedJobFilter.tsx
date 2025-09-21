import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  JobRanking,
  getJobTypeIcon,
  getJobTypeName,
  getJobTypeColor,
  formatJobExperience,
  getJobLevelRange,
  getExperienceRange,
  getJobPerformanceRating,
} from '@/utils/rankingUtils';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

interface AdvancedJobFilterProps {
  data: JobRanking[];
  loading: boolean;
  error: string | null;
}

const AdvancedJobFilter: React.FC<AdvancedJobFilterProps> = ({ data, loading, error }) => {
  const [filters, setFilters] = useState({
    jobType: 'all',
    levelRange: 'all',
    experienceRange: 'all',
    performanceRating: 'all',
    contributionMin: 0,
    searchTerm: '',
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof JobRanking | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Filter data based on current filter settings
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter((player) => {
      // Job Type Filter
      if (filters.jobType !== 'all' && player.JobType !== parseInt(filters.jobType)) {
        return false;
      }

      // Level Range Filter
      if (filters.levelRange !== 'all') {
        const [min, max] = filters.levelRange.split('-').map(Number);
        if (player.JobLevel < min || player.JobLevel > max) {
          return false;
        }
      }

      // Experience Range Filter
      if (filters.experienceRange !== 'all') {
        const exp = player.JobExp;
        switch (filters.experienceRange) {
          case '0-1M':
            if (exp > 1000000) return false;
            break;
          case '1M-5M':
            if (exp <= 1000000 || exp > 5000000) return false;
            break;
          case '5M-10M':
            if (exp <= 5000000 || exp > 10000000) return false;
            break;
          case '10M+':
            if (exp <= 10000000) return false;
            break;
        }
      }

      // Performance Rating Filter
      if (filters.performanceRating !== 'all') {
        const rating = getJobPerformanceRating(player.JobLevel, player.JobExp, player.Contribution || 0);
        if (rating !== filters.performanceRating) {
          return false;
        }
      }

      // Contribution Minimum Filter
      if ((player.Contribution || 0) < filters.contributionMin) {
        return false;
      }

      // Search Term Filter
      if (filters.searchTerm && !player.CharName16.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof JobRanking) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const resetFilters = () => {
    setFilters({
      jobType: 'all',
      levelRange: 'all',
      experienceRange: 'all',
      performanceRating: 'all',
      contributionMin: 0,
      searchTerm: '',
    });
    setSortConfig({ key: null, direction: 'asc' });
  };

  const getSortIcon = (column: keyof JobRanking) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin mx-auto'></div>
        <div className='mt-2 text-lafftale-gold'>Loading advanced filters...</div>
      </div>
    );
  }

  if (error) {
    return <div className='text-center py-8 text-red-400'>Error loading job data: {error}</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Advanced Filter Controls */}
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-lafftale-gold flex items-center gap-2'>
            <Filter size={20} />
            Advanced Job Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Job Type Filter */}
            <div>
              <label className='block text-sm font-medium text-lafftale-gold mb-2'>Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters((prev) => ({ ...prev, jobType: e.target.value }))}
                className='w-full p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold'
              >
                <option value='all'>All Jobs</option>
                <option value='1'>Trader</option>
                <option value='2'>Thief</option>
                <option value='3'>Hunter</option>
              </select>
            </div>

            {/* Level Range Filter */}
            <div>
              <label className='block text-sm font-medium text-lafftale-gold mb-2'>Level Range</label>
              <select
                value={filters.levelRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, levelRange: e.target.value }))}
                className='w-full p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold'
              >
                <option value='all'>All Levels</option>
                <option value='1-10'>Beginner (1-10)</option>
                <option value='11-20'>Novice (11-20)</option>
                <option value='21-30'>Intermediate (21-30)</option>
                <option value='31-40'>Advanced (31-40)</option>
                <option value='41-50'>Expert (41-50)</option>
              </select>
            </div>

            {/* Experience Range Filter */}
            <div>
              <label className='block text-sm font-medium text-lafftale-gold mb-2'>Experience Range</label>
              <select
                value={filters.experienceRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, experienceRange: e.target.value }))}
                className='w-full p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold'
              >
                <option value='all'>All Experience</option>
                <option value='0-1M'>Starter (0-1M)</option>
                <option value='1M-5M'>Developing (1M-5M)</option>
                <option value='5M-10M'>Experienced (5M-10M)</option>
                <option value='10M+'>Elite (10M+)</option>
              </select>
            </div>

            {/* Performance Rating Filter */}
            <div>
              <label className='block text-sm font-medium text-lafftale-gold mb-2'>Performance Rating</label>
              <select
                value={filters.performanceRating}
                onChange={(e) => setFilters((prev) => ({ ...prev, performanceRating: e.target.value }))}
                className='w-full p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold'
              >
                <option value='all'>All Ratings</option>
                <option value='Elite'>Elite</option>
                <option value='High'>High</option>
                <option value='Medium'>Medium</option>
                <option value='Low'>Low</option>
              </select>
            </div>

            {/* Contribution Minimum */}
            <div>
              <label className='block text-sm font-medium text-lafftale-gold mb-2'>Min Contribution</label>
              <input
                type='number'
                value={filters.contributionMin}
                onChange={(e) => setFilters((prev) => ({ ...prev, contributionMin: parseInt(e.target.value) || 0 }))}
                className='w-full p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold'
                min='0'
              />
            </div>

            {/* Search Term */}
            <div>
              <label className='block text-sm font-medium text-lafftale-gold mb-2'>Search Player</label>
              <input
                type='text'
                value={filters.searchTerm}
                onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                placeholder='Player name...'
                className='w-full p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold'
              />
            </div>

            {/* Reset Button */}
            <div className='flex items-end'>
              <Button
                onClick={resetFilters}
                variant='outline'
                className='w-full text-lafftale-gold border-lafftale-gold/50 hover:bg-lafftale-gold/10'
              >
                Reset Filters
              </Button>
            </div>

            {/* Results Count */}
            <div className='flex items-end'>
              <div className='text-sm text-lafftale-gold'>
                Showing {sortedData.length} of {data.length} players
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtered Results Table */}
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-lafftale-gold'>Filtered Job Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Advanced filtered job rankings with sorting</TableCaption>
            <TableHeader>
              <TableRow className='border-b border-lafftale-gold/30'>
                <TableHead
                  className='text-lafftale-gold w-16 text-center cursor-pointer hover:bg-lafftale-gold/10'
                  onClick={() => handleSort('rank')}
                >
                  <div className='flex items-center justify-center gap-1'># {getSortIcon('rank')}</div>
                </TableHead>
                <TableHead
                  className='text-lafftale-gold cursor-pointer hover:bg-lafftale-gold/10'
                  onClick={() => handleSort('CharName16')}
                >
                  <div className='flex items-center gap-1'>Name {getSortIcon('CharName16')}</div>
                </TableHead>
                <TableHead
                  className='text-lafftale-gold hidden md:table-cell cursor-pointer hover:bg-lafftale-gold/10'
                  onClick={() => handleSort('CurLevel')}
                >
                  <div className='flex items-center gap-1'>Level {getSortIcon('CurLevel')}</div>
                </TableHead>
                <TableHead
                  className='text-lafftale-gold hidden md:table-cell cursor-pointer hover:bg-lafftale-gold/10'
                  onClick={() => handleSort('JobLevel')}
                >
                  <div className='flex items-center gap-1'>Job Level {getSortIcon('JobLevel')}</div>
                </TableHead>
                <TableHead
                  className='text-lafftale-gold hidden lg:table-cell cursor-pointer hover:bg-lafftale-gold/10'
                  onClick={() => handleSort('JobExp')}
                >
                  <div className='flex items-center gap-1'>Experience {getSortIcon('JobExp')}</div>
                </TableHead>
                <TableHead
                  className='text-lafftale-gold text-right cursor-pointer hover:bg-lafftale-gold/10'
                  onClick={() => handleSort('Contribution')}
                >
                  <div className='flex items-center justify-end gap-1'>Contribution {getSortIcon('Contribution')}</div>
                </TableHead>
                <TableHead className='text-lafftale-gold hidden xl:table-cell'>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center py-8 text-gray-400'>
                    No players match the current filters
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((player, index) => (
                  <TableRow
                    key={`${player.rank}-${index}`}
                    className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${
                      player.rank <= 3 ? 'bg-lafftale-gold/10' : ''
                    }`}
                  >
                    <TableCell className='font-medium text-center'>
                      <span className='text-lafftale-gold'>{player.rank}</span>
                    </TableCell>
                    <TableCell className='font-semibold text-lafftale-gold'>
                      <div className='flex items-center gap-2'>
                        <img
                          src={getJobTypeIcon(player.JobType)}
                          alt={getJobTypeName(player.JobType)}
                          className='w-5 h-5'
                        />
                        {player.CharName16}
                      </div>
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>{player.CurLevel}</TableCell>
                    <TableCell className='hidden md:table-cell'>
                      <span className={`font-bold ${getJobTypeColor(player.JobType)}`}>{player.JobLevel}</span>
                    </TableCell>
                    <TableCell className='hidden lg:table-cell'>{formatJobExperience(player.JobExp)}</TableCell>
                    <TableCell className='text-right font-semibold text-lafftale-gold'>
                      {player.Contribution?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className='hidden xl:table-cell'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          getJobPerformanceRating(player.JobLevel, player.JobExp, player.Contribution || 0) === 'Elite'
                            ? 'bg-purple-600 text-white'
                            : getJobPerformanceRating(player.JobLevel, player.JobExp, player.Contribution || 0) ===
                              'High'
                            ? 'bg-green-600 text-white'
                            : getJobPerformanceRating(player.JobLevel, player.JobExp, player.Contribution || 0) ===
                              'Medium'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {getJobPerformanceRating(player.JobLevel, player.JobExp, player.Contribution || 0)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedJobFilter;
