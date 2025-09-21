import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Clock, Play, Square, Settings, AlertCircle } from 'lucide-react';
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

const CronJobManager = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<string | null>(null);
  const [tempCronExpression, setTempCronExpression] = useState('');
  const { token } = useAuth();

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

  const updateJob = async (jobName: string, cronExpression: string, enabled: boolean) => {
    try {
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

      await fetchJobs(); // Reload jobs
      setEditingJob(null);
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

      const result = await response.json();
      console.log('Job getriggert:', result);

      // Optional: Zeige Erfolgs-Notification
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

  const getCronDescription = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length !== 5) return cron;

    const [minute, hour, day, month, weekday] = parts;

    if (cron === '0 2 * * *') return 'Täglich um 02:00 Uhr';
    if (cron === '0 */6 * * *') return 'Alle 6 Stunden';
    if (cron === '0 0 * * 0') return 'Wöchentlich (Sonntag 00:00)';

    return `${minute}:${hour.padStart(2, '0')} Uhr ${day === '*' ? 'täglich' : `am ${day}.`}`;
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Cron Job Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lafftale-gold mx-auto'></div>
            <p className='text-sm text-gray-400 mt-2'>Lade Cron Jobs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5 text-lafftale-gold' />
            Cron Job Management
          </CardTitle>
          <p className='text-sm text-gray-400'>Verwalten Sie automatische Berechnungen und geplante Aufgaben</p>
        </CardHeader>
        <CardContent>
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
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='font-semibold text-white'>
                          {job.job_name === 'silk_stats_calculation' ? 'Silk Statistik Berechnung' : job.job_name}
                        </h3>
                        <div className='flex items-center gap-2'>
                          {job.isRunning ? (
                            <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-900/20 text-green-400 rounded-md text-xs'>
                              <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                              Aktiv
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-400 rounded-md text-xs'>
                              <Square className='w-2 h-2' />
                              Inaktiv
                            </span>
                          )}
                        </div>
                      </div>

                      <p className='text-sm text-gray-400 mb-3'>{job.description}</p>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-400'>Schedule:</span>
                          {editingJob === job.job_name ? (
                            <div className='flex items-center gap-2 mt-1'>
                              <Input
                                value={tempCronExpression}
                                onChange={(e) => setTempCronExpression(e.target.value)}
                                placeholder='0 2 * * *'
                                className='text-xs bg-gray-800 border-gray-600'
                              />
                              <Button
                                size='sm'
                                onClick={() => updateJob(job.job_name, tempCronExpression, job.enabled)}
                                className='bg-lafftale-gold text-black hover:bg-yellow-500'
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <div className='mt-1'>
                              <code className='text-lafftale-gold text-xs bg-gray-800 px-2 py-1 rounded'>
                                {job.cron_expression}
                              </code>
                              <p className='text-xs text-gray-500 mt-1'>{getCronDescription(job.cron_expression)}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <span className='text-gray-400'>Letzte Ausführung:</span>
                          <p className='text-white mt-1'>{formatDate(job.last_run)}</p>
                          <p className='text-xs text-gray-500'>Anzahl: {job.run_count}</p>
                        </div>

                        <div>
                          <span className='text-gray-400'>Nächste Ausführung:</span>
                          <p className='text-white mt-1'>
                            {job.enabled && job.nextRunEstimate ? formatDate(job.nextRunEstimate) : 'Deaktiviert'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2 ml-4'>
                      <div className='flex items-center gap-2'>
                        <Switch
                          checked={job.enabled}
                          onCheckedChange={(enabled) => updateJob(job.job_name, job.cron_expression, enabled)}
                        />
                        <span className='text-sm text-gray-400'>Aktiv</span>
                      </div>

                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setEditingJob(job.job_name);
                          setTempCronExpression(job.cron_expression);
                        }}
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
        </CardContent>
      </Card>

      <Card className='bg-blue-900/20 border-blue-500/30'>
        <CardHeader>
          <CardTitle className='text-blue-400 text-sm'>Cron Expression Hilfe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-xs space-y-2 text-gray-300'>
            <p>
              <code>0 2 * * *</code> - Täglich um 02:00 Uhr
            </p>
            <p>
              <code>0 */6 * * *</code> - Alle 6 Stunden
            </p>
            <p>
              <code>0 0 * * 0</code> - Wöchentlich (Sonntag 00:00)
            </p>
            <p>
              <code>0 1 1 * *</code> - Monatlich (1. Tag um 01:00)
            </p>
            <p className='text-gray-400'>Format: Minute Stunde Tag Monat Wochentag</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CronJobManager;
