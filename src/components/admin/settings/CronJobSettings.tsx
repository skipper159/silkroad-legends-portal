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
  dayOfWeek?: number; // 0 = Sonntag, 1 = Montag, etc.
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
    { value: 0, label: 'Sonntag' },
    { value: 1, label: 'Montag' },
    { value: 2, label: 'Dienstag' },
    { value: 3, label: 'Mittwoch' },
    { value: 4, label: 'Donnerstag' },
    { value: 5, label: 'Freitag' },
    { value: 6, label: 'Samstag' },
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
        return `Täglich um ${timeStr} Uhr`;
      case 'weekly':
        const weekday = weekdays.find((w) => w.value === config.dayOfWeek);
        return `Wöchentlich ${weekday?.label} um ${timeStr} Uhr`;
      case 'monthly':
        return `Monatlich am ${config.dayOfMonth}. um ${timeStr} Uhr`;
      case 'custom':
        return `Benutzerdefiniert: ${config.customExpression}`;
      default:
        return 'Unbekannt';
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
      console.error('Fehler beim Laden der Cron Jobs:', err);
      setError('Fehler beim Laden der Cron Job Konfiguration');
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
      console.error('Fehler beim Aktualisieren des Jobs:', err);
      setError('Fehler beim Aktualisieren der Job-Konfiguration');
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
      console.error('Fehler beim Triggern des Jobs:', err);
      setError('Fehler beim manuellen Ausführen des Jobs');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie';
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getJobDisplayName = (jobName: string) => {
    switch (jobName) {
      case 'silk_stats_calculation':
        return 'Silk Statistik Berechnung';
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
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lafftale-gold mx-auto'></div>
        <p className='text-sm text-gray-400 mt-2'>Lade Cron Jobs...</p>
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
          <Card key={job.job_name} className='bg-lafftale-darkgray border-gray-700'>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-3'>
                    <h3 className='font-semibold text-white text-lg'>{getJobDisplayName(job.job_name)}</h3>
                    <div className='flex items-center gap-2'>
                      {job.isRunning ? (
                        <span className='inline-flex items-center gap-1 px-3 py-1 bg-green-900/20 text-green-400 rounded-md text-sm'>
                          <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                          Aktiv
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-400 rounded-md text-sm'>
                          <Square className='w-2 h-2' />
                          Inaktiv
                        </span>
                      )}
                    </div>
                  </div>

                  <p className='text-sm text-gray-400 mb-4'>{job.description}</p>

                  {editingJob === job.job_name ? (
                    <div className='space-y-4 bg-gray-800/50 p-4 rounded-lg'>
                      <div>
                        <label className='block text-sm font-medium text-gray-300 mb-2'>Schedule-Typ</label>
                        <Select
                          value={cronConfig.type}
                          onValueChange={(value: 'custom' | 'daily' | 'weekly' | 'monthly') =>
                            setCronConfig({ ...cronConfig, type: value })
                          }
                        >
                          <SelectTrigger className='bg-gray-700 border-gray-600'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='daily'>Täglich</SelectItem>
                            <SelectItem value='weekly'>Wöchentlich</SelectItem>
                            <SelectItem value='monthly'>Monatlich</SelectItem>
                            <SelectItem value='custom'>Benutzerdefiniert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {cronConfig.type !== 'custom' && (
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-300 mb-2'>Stunde (0-23)</label>
                            <Input
                              type='number'
                              min='0'
                              max='23'
                              value={cronConfig.hour}
                              onChange={(e) => setCronConfig({ ...cronConfig, hour: parseInt(e.target.value) || 0 })}
                              className='bg-gray-700 border-gray-600'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-300 mb-2'>Minute (0-59)</label>
                            <Input
                              type='number'
                              min='0'
                              max='59'
                              value={cronConfig.minute}
                              onChange={(e) => setCronConfig({ ...cronConfig, minute: parseInt(e.target.value) || 0 })}
                              className='bg-gray-700 border-gray-600'
                            />
                          </div>
                        </div>
                      )}

                      {cronConfig.type === 'weekly' && (
                        <div>
                          <label className='block text-sm font-medium text-gray-300 mb-2'>Wochentag</label>
                          <Select
                            value={cronConfig.dayOfWeek?.toString() || '0'}
                            onValueChange={(value) => setCronConfig({ ...cronConfig, dayOfWeek: parseInt(value) })}
                          >
                            <SelectTrigger className='bg-gray-700 border-gray-600'>
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
                          <label className='block text-sm font-medium text-gray-300 mb-2'>Tag des Monats (1-31)</label>
                          <Input
                            type='number'
                            min='1'
                            max='31'
                            value={cronConfig.dayOfMonth || 1}
                            onChange={(e) =>
                              setCronConfig({ ...cronConfig, dayOfMonth: parseInt(e.target.value) || 1 })
                            }
                            className='bg-gray-700 border-gray-600'
                          />
                        </div>
                      )}

                      {cronConfig.type === 'custom' && (
                        <div>
                          <label className='block text-sm font-medium text-gray-300 mb-2'>Cron Expression</label>
                          <Input
                            value={cronConfig.customExpression || ''}
                            onChange={(e) => setCronConfig({ ...cronConfig, customExpression: e.target.value })}
                            placeholder='0 2 * * *'
                            className='bg-gray-700 border-gray-600'
                          />
                        </div>
                      )}

                      <div className='pt-2 border-t border-gray-600'>
                        <p className='text-sm text-gray-400 mb-3'>
                          Vorschau: <span className='text-lafftale-gold'>{getScheduleDescription(cronConfig)}</span>
                        </p>
                        <p className='text-xs text-gray-500 mb-3'>
                          Cron Expression:{' '}
                          <code className='bg-gray-700 px-2 py-1 rounded'>{buildCronExpression(cronConfig)}</code>
                        </p>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => updateJob(job.job_name, cronConfig, job.enabled)}
                            className='bg-lafftale-gold text-black hover:bg-yellow-500'
                          >
                            Speichern
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setEditingJob(null)}
                            className='border-gray-600 hover:bg-gray-700'
                          >
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-400'>Schedule:</span>
                        <div className='mt-1'>
                          <p className='text-white'>
                            {getScheduleDescription(parseCronExpression(job.cron_expression))}
                          </p>
                          <code className='text-lafftale-gold text-xs bg-gray-800 px-2 py-1 rounded mt-1 inline-block'>
                            {job.cron_expression}
                          </code>
                        </div>
                      </div>

                      <div>
                        <span className='text-gray-400'>Letzte Ausführung:</span>
                        <p className='text-white mt-1'>{formatDate(job.last_run)}</p>
                        <p className='text-xs text-gray-500'>Ausführungen: {job.run_count}</p>
                      </div>

                      <div>
                        <span className='text-gray-400'>Nächste Ausführung:</span>
                        <p className='text-white mt-1'>
                          {job.enabled && job.nextRunEstimate ? formatDate(job.nextRunEstimate) : 'Deaktiviert'}
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
                    <span className='text-sm text-gray-400'>Aktiv</span>
                  </div>

                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setEditingJob(editingJob === job.job_name ? null : job.job_name)}
                    className='border-gray-600 hover:bg-gray-700'
                  >
                    <Settings className='h-4 w-4' />
                  </Button>

                  <Button
                    size='sm'
                    onClick={() => triggerJob(job.job_name)}
                    className='bg-lafftale-gold text-black hover:bg-yellow-500'
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
        <div className='text-center py-8 text-gray-400'>
          <Clock className='h-12 w-12 mx-auto mb-4 opacity-50' />
          <p>Keine Cron Jobs konfiguriert</p>
        </div>
      )}

      <Card className='bg-blue-900/20 border-blue-500/30'>
        <CardHeader>
          <CardTitle className='text-blue-400 text-sm flex items-center gap-2'>
            <Calendar className='h-4 w-4' />
            Schedule-Hilfe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-xs space-y-2 text-gray-300'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='font-medium text-blue-400 mb-2'>Vordefinierte Schedules:</p>
                <p>
                  <strong>Täglich:</strong> Jeden Tag zur angegebenen Zeit
                </p>
                <p>
                  <strong>Wöchentlich:</strong> Jeden Wochentag zur angegebenen Zeit
                </p>
                <p>
                  <strong>Monatlich:</strong> Jeden Monat am angegebenen Tag
                </p>
              </div>
              <div>
                <p className='font-medium text-blue-400 mb-2'>Beispiele für Custom:</p>
                <p>
                  <code>0 */6 * * *</code> - Alle 6 Stunden
                </p>
                <p>
                  <code>30 1 * * 1-5</code> - Werktags um 01:30
                </p>
                <p>
                  <code>0 0 1 * *</code> - Jeden 1. des Monats
                </p>
              </div>
            </div>
            <p className='text-gray-400 pt-2 border-t border-gray-600'>
              Format: Minute (0-59) Stunde (0-23) Tag (1-31) Monat (1-12) Wochentag (0-6, 0=Sonntag)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CronJobSettings;
