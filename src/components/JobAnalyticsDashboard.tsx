import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRankingData } from '@/hooks/useRankingData';
import {
  JobStatistics,
  JobLeaderboardEntry,
  JobProgressionData,
  getJobTypeFullName,
  formatStatisticsValue,
  getJobTypeColor,
  calculateJobDistribution,
} from '@/utils/rankingUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const JobAnalyticsDashboard: React.FC = () => {
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('statistics');
  const [selectedJobType, setSelectedJobType] = useState<number | null>(null);

  const { data: statisticsData, loading: statsLoading } = useRankingData('job-statistics');
  const { data: leaderboardData, loading: leaderboardLoading } = useRankingData('job-leaderboard-comparison');
  const { data: progressionData, loading: progressionLoading } = useRankingData('job-progression', {
    jobType: selectedJobType,
  });

  const COLORS = ['#FFD700', '#DC2626', '#10B981']; // Gold, Red, Green for Trader, Thief, Hunter

  const renderStatisticsOverview = () => {
    if (statsLoading) return <div className='text-center py-8'>Loading statistics...</div>;

    const stats = statisticsData as JobStatistics[];
    const distribution = calculateJobDistribution(stats);

    return (
      <div className='space-y-6'>
        {/* Job Distribution Pie Chart */}
        <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
          <CardHeader>
            <CardTitle className='text-lafftale-gold'>Job Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={distribution}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ jobType, percentage }) => `${getJobTypeFullName(jobType)}: ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='percentage'
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.jobType - 1]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {stats.map((stat) => (
            <Card key={stat.JobType} className='bg-lafftale-darkgray border-lafftale-gold/30'>
              <CardHeader>
                <CardTitle className={`${getJobTypeColor(stat.JobType)} text-lg`}>
                  {getJobTypeFullName(stat.JobType)} Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Total Players:</span>
                  <span className='text-lafftale-gold font-semibold'>{formatStatisticsValue(stat.TotalPlayers)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Average Level:</span>
                  <span className='text-lafftale-gold font-semibold'>{formatStatisticsValue(stat.AverageLevel)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Max Level:</span>
                  <span className='text-lafftale-gold font-semibold'>{stat.MaxLevel}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Average Experience:</span>
                  <span className='text-lafftale-gold font-semibold'>
                    {formatStatisticsValue(stat.AverageExperience, 'experience')}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-300'>Total Contribution:</span>
                  <span className='text-lafftale-gold font-semibold'>
                    {formatStatisticsValue(stat.TotalContribution)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Level Distribution Chart */}
        <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
          <CardHeader>
            <CardTitle className='text-lafftale-gold'>Level Distribution by Job Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={400}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey={(data) => getJobTypeFullName(data.JobType)} />
                <YAxis />
                <Tooltip />
                <Bar dataKey='Level1_10' stackId='a' fill='#FFD700' name='Level 1-10' />
                <Bar dataKey='Level11_20' stackId='a' fill='#FFA500' name='Level 11-20' />
                <Bar dataKey='Level21_30' stackId='a' fill='#FF8C00' name='Level 21-30' />
                <Bar dataKey='Level31_40' stackId='a' fill='#FF6347' name='Level 31-40' />
                <Bar dataKey='Level41_50' stackId='a' fill='#DC143C' name='Level 41-50' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLeaderboardComparison = () => {
    if (leaderboardLoading) return <div className='text-center py-8'>Loading leaderboard...</div>;

    const leaderboard = leaderboardData as JobLeaderboardEntry[];
    const groupedByJob = leaderboard.reduce((acc, entry) => {
      if (!acc[entry.JobType]) acc[entry.JobType] = [];
      acc[entry.JobType].push(entry);
      return acc;
    }, {} as Record<number, JobLeaderboardEntry[]>);

    return (
      <div className='space-y-6'>
        {Object.entries(groupedByJob).map(([jobType, entries]) => (
          <Card key={jobType} className='bg-lafftale-darkgray border-lafftale-gold/30'>
            <CardHeader>
              <CardTitle className={`${getJobTypeColor(parseInt(jobType))} text-xl`}>
                Top 10 {getJobTypeFullName(parseInt(jobType))}s
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
                {entries.slice(0, 10).map((entry, index) => (
                  <div key={index} className='bg-lafftale-dark p-4 rounded-lg border border-lafftale-gold/20'>
                    <div className='text-center'>
                      <div className='text-lg font-bold text-lafftale-gold'>#{entry.JobRank}</div>
                      <div className='text-lafftale-gold font-semibold'>{entry.CharName16}</div>
                      <div className='text-sm text-gray-300'>Level {entry.JobLevel}</div>
                      <div className='text-sm text-gray-300'>
                        {formatStatisticsValue(entry.JobExp, 'experience')} EXP
                      </div>
                      <div className='text-xs text-gray-400'>Overall: #{entry.OverallRank}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderProgressionAnalytics = () => {
    if (progressionLoading) return <div className='text-center py-8'>Loading progression data...</div>;

    const progression = progressionData as JobProgressionData[];

    return (
      <div className='space-y-6'>
        <div className='flex gap-4 mb-4'>
          <select
            value={selectedJobType || ''}
            onChange={(e) => setSelectedJobType(e.target.value ? parseInt(e.target.value) : null)}
            className='p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold'
          >
            <option value=''>All Jobs</option>
            <option value='1'>Trader</option>
            <option value='2'>Thief</option>
            <option value='3'>Hunter</option>
          </select>
        </div>

        <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
          <CardHeader>
            <CardTitle className='text-lafftale-gold'>
              Job Progression Analytics {selectedJobType && `- ${getJobTypeFullName(selectedJobType)}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={400}>
              <LineChart data={progression}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='JobLevel' />
                <YAxis yAxisId='left' />
                <YAxis yAxisId='right' orientation='right' />
                <Tooltip />
                <Bar dataKey='PlayerCount' fill='#FFD700' name='Player Count' yAxisId='left' />
                <Line type='monotone' dataKey='AverageExp' stroke='#DC2626' name='Average Experience' yAxisId='right' />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-2xl text-lafftale-gold text-center'>Advanced Job Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeAnalyticsTab} onValueChange={setActiveAnalyticsTab}>
            <TabsList className='grid w-full grid-cols-3 bg-lafftale-dark'>
              <TabsTrigger
                value='statistics'
                className='data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
              >
                Statistics Overview
              </TabsTrigger>
              <TabsTrigger
                value='leaderboard'
                className='data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
              >
                Leaderboard Comparison
              </TabsTrigger>
              <TabsTrigger
                value='progression'
                className='data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark'
              >
                Progression Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value='statistics' className='mt-6'>
              {renderStatisticsOverview()}
            </TabsContent>

            <TabsContent value='leaderboard' className='mt-6'>
              {renderLeaderboardComparison()}
            </TabsContent>

            <TabsContent value='progression' className='mt-6'>
              {renderProgressionAnalytics()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobAnalyticsDashboard;
