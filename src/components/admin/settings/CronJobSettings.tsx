import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Play, Square, Settings, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import { weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CronJob {
  job_name: string;
  cron_expression: string;
  enabled: boolean;
  description: string;
  last_run: string | null;
  run_count: number;
  isRunning: boolean;
  nextRunEstimate: string | null;
}

interface CronConfig {
  type: 'custom' | 'daily' | 'weekly' | 'monthly';
  hour: number;
  minute: number;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number; // 1-31
  customExpression?: string;
}

const CronJobSettings = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [cronConfig, setCronConfig] = useState<CronConfig>({
    type: 'daily',
    hour: 2,
    minute: 0,
  });
  const { token } = useAuth();

  const weekdays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const buildCronExpression = (config: CronConfig): string => {
    switch (config.type) {
      case 'daily':
        return `${config.minute} ${config.hour} * * *`;
      case 'weekly':
        return `${config.minute} ${config.hour} * * ${config.dayOfWeek || 0}`;
      case 'monthly':
        return `${config.minute} ${config.hour} ${config.dayOfMonth || 1} * *`;
      case 'custom':
        return config.customExpression || '0 2 * * *';
      default:
        return '0 2 * * *';
    }
  };

  const parseCronExpression = (expression: string): CronConfig => {
    const parts = expression.split(' ');
    if (parts.length !== 5) {
      return { type: 'custom', hour: 2, minute: 0, customExpression: expression };
    }

    const [minute, hour, day, month, weekday] = parts;

    if (day === '*' && month === '*' && weekday === '*') {
      return {
        type: 'daily',
        hour: parseInt(hour),
        minute: parseInt(minute),
      };
    }

    if (day === '*' && month === '*' && weekday !== '*') {
      return {
        type: 'weekly',
        hour: parseInt(hour),
        minute: parseInt(minute),
        dayOfWeek: parseInt(weekday),
      };
    }

    if (day !== '*' && month === '*' && weekday === '*') {
      return {
        type: 'monthly',
        hour: parseInt(hour),
        minute: parseInt(minute),
        dayOfMonth: parseInt(day),
      };
    }

    return { type: 'custom', hour: 2, minute: 0, customExpression: expression };
  };

  const getScheduleDescription = (config: CronConfig): string => {
    const timeStr = `${config.hour.toString().padStart(2, '0')}:${config.minute.toString().padStart(2, '0')}`;

    switch (config.type) {
      case 'daily':
        return `Daily at ${timeStr}`;
      case 'weekly':
        const weekday = weekdays.find((w) => w.value === config.dayOfWeek);
        return `Weekly on ${weekday?.label} at ${timeStr}`;
      case 'monthly':
        return `Monthly on ${config.dayOfMonth} at ${timeStr}`;
      case 'custom':
        return `Custom: ${config.customExpression}`;
      default:
        return 'Unknown';
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${weburl}/api/admin/cron/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setJobs(result.data);
      setError(null);
    } catch (err) {
      console.error('Error loading cron jobs:', err);
      setError('Error loading cron job configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateJob = async (jobName: string, config: CronConfig, enabled: boolean) => {
    try {
      const cronExpression = buildCronExpression(config);

      const response = await fetch(`${weburl}/api/admin/cron/jobs/${jobName}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cronExpression, enabled }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchJobs();
      setEditingJob(null);
      setError(null);
    } catch (err) {
      console.error('Error updating job:', err);
      setError('Error updating job configuration');
    }
  };

  const triggerJob = async (jobName: string) => {
    try {
      const response = await fetch(`${weburl}/api/admin/cron/jobs/${jobName}/trigger`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setError(null);
    } catch (err) {
      console.error('Error triggering job:', err);
      setError('Error executing job manually');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US');
  };

  const getJobDisplayName = (jobName: string) => {
    switch (jobName) {
      case 'silk_stats_calculation':
        return 'Silk Stats Calculation';
      default:
        return jobName;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (editingJob) {
      const job = jobs.find((j) => j.job_name === editingJob);
      if (job) {
        setCronConfig(parseCronExpression(job.cron_expression));
      }
    }
  }, [editingJob, jobs]);

  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto'></div>
        <p className='text-sm text-theme-text-muted mt-2'>Loading cron jobs...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {error && (
        <div className='mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md'>
          <div className='flex items-center gap-2 text-red-400'>
            <AlertCircle className='h-4 w-4' />
            {error}
          </div>
        </div>
      )}

      <div className='space-y-4'>
        {jobs.map((job) => (
          <Card key={job.job_name} className='bg-theme-surface border-theme-border'>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-3'>
                    <h3 className='font-semibold text-theme-text text-lg'>{getJobDisplayName(job.job_name)}</h3>
                    <div className='flex items-center gap-2'>
                      {job.enabled ? (
                        <span className='inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-500 rounded-md text-sm'>
                          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                          Active
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 px-3 py-1 bg-theme-surface/50 text-theme-text-muted rounded-md text-sm'>
                          <Square className='w-2 h-2' />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <p className='text-sm text-theme-text-muted mb-4'>{job.description}</p>

                  {editingJob === job.job_name ? (
                    <div className='space-y-4 bg-theme-background/50 p-4 rounded-lg'>
                      <div>
                        <label className='block text-sm font-medium text-theme-text-muted mb-2'>Schedule-Typ</label>
                        <Select
                          value={cronConfig.type}
                          onValueChange={(value: 'custom' | 'daily' | 'weekly' | 'monthly') =>
                            setCronConfig({ ...cronConfig, type: value })
                          }
                        >
                          <SelectTrigger className='bg-theme-background border-theme-border'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='daily'>Daily</SelectItem>
                            <SelectItem value='weekly'>Weekly</SelectItem>
                            <SelectItem value='monthly'>Monthly</SelectItem>
                            <SelectItem value='custom'>Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {cronConfig.type !== 'custom' && (
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-sm font-medium text-theme-text-muted mb-2'>
                              Stunde (0-23)
                            </label>
                            <Input
                              type='number'
                              min='0'
                              max='23'
                              value={cronConfig.hour}
                              onChange={(e) => setCronConfig({ ...cronConfig, hour: parseInt(e.target.value) || 0 })}
                              className='bg-theme-background border-theme-border'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-theme-text-muted mb-2'>
                              Minute (0-59)
                            </label>
                            <Input
                              type='number'
                              min='0'
                              max='59'
                              value={cronConfig.minute}
                              onChange={(e) => setCronConfig({ ...cronConfig, minute: parseInt(e.target.value) || 0 })}
                              className='bg-theme-background border-theme-border'
                            />
                          </div>
                        </div>
                      )}

                      {cronConfig.type === 'weekly' && (
                        <div>
                          <label className='block text-sm font-medium text-theme-text-muted mb-2'>Wochentag</label>
                          <Select
                            value={cronConfig.dayOfWeek?.toString() || '0'}
                            onValueChange={(value) => setCronConfig({ ...cronConfig, dayOfWeek: parseInt(value) })}
                          >
                            <SelectTrigger className='bg-theme-background border-theme-border'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {weekdays.map((day) => (
                                <SelectItem key={day.value} value={day.value.toString()}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {cronConfig.type === 'monthly' && (
                        <div>
                          <label className='block text-sm font-medium text-theme-text-muted mb-2'>
                            Tag des Monats (1-31)
                          </label>
                          <Input
                            type='number'
                            min='1'
                            max='31'
                            value={cronConfig.dayOfMonth || 1}
                            onChange={(e) =>
                              setCronConfig({ ...cronConfig, dayOfMonth: parseInt(e.target.value) || 1 })
                            }
                            className='bg-theme-background border-theme-border'
                          />
                        </div>
                      )}

                      {cronConfig.type === 'custom' && (
                        <div>
                          <label className='block text-sm font-medium text-theme-text-muted mb-2'>
                            Cron Expression
                          </label>
                          <Input
                            value={cronConfig.customExpression || ''}
                            onChange={(e) => setCronConfig({ ...cronConfig, customExpression: e.target.value })}
                            placeholder='0 2 * * *'
                            className='bg-theme-background border-theme-border'
                          />
                        </div>
                      )}

                      <div className='pt-2 border-t border-gray-600'>
                        <p className='text-sm text-theme-text-muted mb-3'>
                          Preview: <span className='text-theme-primary'>{getScheduleDescription(cronConfig)}</span>
                        </p>
                        <p className='text-xs text-theme-text-muted/70 mb-3'>
                          Cron Expression:{' '}
                          <code className='bg-theme-surface px-2 py-1 rounded'>{buildCronExpression(cronConfig)}</code>
                        </p>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => updateJob(job.job_name, cronConfig, job.enabled)}
                            className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
                          >
                            Save
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setEditingJob(null)}
                            className='border-theme-border hover:bg-theme-surface/80'
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm'>
                      <div>
                        <span className='text-theme-text-muted'>Schedule:</span>
                        <div className='mt-1'>
                          <p className='text-theme-text'>
                            {getScheduleDescription(parseCronExpression(job.cron_expression))}
                          </p>
                          <code className='text-theme-primary text-xs bg-theme-background px-2 py-1 rounded mt-1 inline-block'>
                            {job.cron_expression}
                          </code>
                        </div>
                      </div>

                      <div>
                        <span className='text-theme-text-muted'>Last run:</span>
                        <p className='text-theme-text mt-1'>{formatDate(job.last_run)}</p>
                        <p className='text-xs text-theme-text-muted'>Runs: {job.run_count}</p>
                      </div>

                      <div>
                        <span className='text-theme-text-muted'>Next run:</span>
                        <p className='text-theme-text mt-1'>
                          {job.enabled && job.nextRunEstimate ? formatDate(job.nextRunEstimate) : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex items-center gap-2 ml-6'>
                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={job.enabled}
                      onCheckedChange={(enabled) => {
                        const config = parseCronExpression(job.cron_expression);
                        updateJob(job.job_name, config, enabled);
                      }}
                    />
                    <span className='text-sm text-theme-text-muted'>Enabled</span>
                  </div>

                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setEditingJob(editingJob === job.job_name ? null : job.job_name)}
                    className='border-theme-border hover:bg-theme-surface/80 text-theme-text-muted'
                  >
                    <Settings className='h-4 w-4' />
                  </Button>

                  <Button
                    size='sm'
                    onClick={() => triggerJob(job.job_name)}
                    className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
                  >
                    <Play className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobs.length === 0 && !loading && (
        <div className='text-center py-8 text-theme-text-muted'>
          <Clock className='h-12 w-12 mx-auto mb-4 opacity-50' />
          <p>No cron jobs configured</p>
        </div>
      )}

      <Card className='bg-theme-surface/50 border-theme-border/50'>
        <CardHeader>
          <CardTitle className='text-theme-primary text-sm flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            Schedule Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-xs space-y-2 text-theme-text-muted/80'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='font-medium text-theme-primary mb-2'>Predefined schedules:</p>
                <p>
                  <strong>Daily:</strong> Every day at the configured time
                </p>
                <p>
                  <strong>Weekly:</strong> On the configured weekday at the configured time
                </p>
                <p>
                  <strong>Monthly:</strong> On the configured day of month at the configured time
                </p>
              </div>
              <div>
                <p className='font-medium text-theme-primary mb-2'>Examples for custom expressions:</p>
                <p>
                  <code>0 */6 * * *</code> - Every 6 hours
                </p>
                <p>
                  <code>30 1 * * 1-5</code> - Weekdays at 01:30
                </p>
                <p>
                  <code>0 0 1 * *</code> - On the 1st of each month
                </p>
              </div>
            </div>
            <p className='text-theme-text-muted pt-2 border-t border-theme-border'>
              Format: Minute (0-59) Hour (0-23) Day (1-31) Month (1-12) Weekday (0-6, 0=Sunday)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CronJobSettings;
