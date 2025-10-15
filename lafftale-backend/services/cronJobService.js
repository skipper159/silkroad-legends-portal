const { pool, poolConnect, accountPool, accountPoolConnect, sql } = require('../db');
const cron = require('node-cron');
const SilkStatsService = require('./silkStatsService');
const MetricsService = require('./metricsService');

class CronJobService {
  constructor() {
    this.jobs = new Map();
    this.defaultSchedule = '0 2 * * *'; // 02:00 täglich
    this.isEnabled = false;
  }

  async ensureConnection() {
    await poolConnect;
  }

  /**
   * Erstelle Cron Job Einstellungstabelle falls sie nicht existiert
   */
  async ensureJobSettingsTable() {
    await this.ensureConnection();

    try {
      const tableCheck = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM [SRO_CMS].INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo' 
        AND TABLE_NAME = 'cron_job_settings'
      `);

      if (tableCheck.recordset[0].count === 0) {
        console.log('🔧 Erstelle cron_job_settings Tabelle...');

        await pool.request().query(`
          CREATE TABLE [SRO_CMS].[dbo].[cron_job_settings] (
              [id] [int] IDENTITY(1,1) NOT NULL,
              [job_name] [nvarchar](100) NOT NULL,
              [cron_expression] [nvarchar](50) NOT NULL,
              [enabled] [bit] NOT NULL DEFAULT 0,
              [description] [nvarchar](255) NULL,
              [last_run] [datetime2](7) NULL,
              [next_run] [datetime2](7) NULL,
              [run_count] [int] NOT NULL DEFAULT 0,
              [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
              [updated_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
              CONSTRAINT [PK_cron_job_settings] PRIMARY KEY CLUSTERED ([id] ASC),
              CONSTRAINT [UK_cron_job_name] UNIQUE NONCLUSTERED ([job_name] ASC)
          )
        `);

        // Füge Standard-Job für Silk-Statistiken hinzu
        await pool.request().query(`
          INSERT INTO [SRO_CMS].[dbo].[cron_job_settings] 
          (job_name, cron_expression, enabled, description)
          VALUES 
          ('silk_stats_calculation', '0 2 * * *', 0, 'Berechnet täglich um 02:00 Uhr die Server Silk-Statistiken')
        `);

        console.log('✅ Cron Job Settings Tabelle erstellt');
      }
    } catch (error) {
      console.error('❌ Fehler beim Erstellen der Cron Job Tabelle:', error.message);
      throw error;
    }
  }

  /**
   * Lade Job-Einstellungen aus der Datenbank
   */
  async loadJobSettings() {
    await this.ensureJobSettingsTable();

    try {
      const result = await pool.request().query(`
        SELECT job_name, cron_expression, enabled, description, last_run, run_count
        FROM [SRO_CMS].[dbo].[cron_job_settings]
        ORDER BY job_name
      `);

      return result.recordset;
    } catch (error) {
      console.error('❌ Fehler beim Laden der Job-Einstellungen:', error.message);
      return [];
    }
  }

  /**
   * Aktualisiere Job-Einstellung
   */
  async updateJobSetting(jobName, cronExpression, enabled) {
    await this.ensureConnection();

    try {
      // Validiere Cron Expression
      if (!cron.validate(cronExpression)) {
        throw new Error(`Ungültige Cron Expression: ${cronExpression}`);
      }

      await pool
        .request()
        .input('jobName', sql.NVarChar, jobName)
        .input('cronExpression', sql.NVarChar, cronExpression)
        .input('enabled', sql.Bit, enabled).query(`
          UPDATE [SRO_CMS].[dbo].[cron_job_settings]
          SET cron_expression = @cronExpression,
              enabled = @enabled,
              updated_at = GETDATE()
          WHERE job_name = @jobName
        `);

      // Neustart des Jobs wenn aktiv
      if (enabled) {
        await this.restartJob(jobName, cronExpression);
      } else {
        this.stopJob(jobName);
      }

      console.log(
        `✅ Job ${jobName} aktualisiert: ${cronExpression} (${enabled ? 'aktiv' : 'inaktiv'})`
      );
      return true;
    } catch (error) {
      console.error(`❌ Fehler beim Aktualisieren von Job ${jobName}:`, error.message);
      throw error;
    }
  }

  /**
   * Starte Job mit gegebener Cron Expression
   */
  async restartJob(jobName, cronExpression) {
    // Stoppe existierenden Job
    this.stopJob(jobName);

    try {
      let task;

      switch (jobName) {
        case 'silk_stats_calculation':
          task = cron.schedule(
            cronExpression,
            async () => {
              await this.runSilkStatsCalculation();
            },
            {
              scheduled: false,
              timezone: 'Europe/Berlin',
            }
          );
          break;

        case 'players_online_collector':
          {
            // Collect players-online metric periodically. Default schedule example: every minute
            const MetricsService = require('./metricsService');
            const { getAccountDb } = require('../db');

            task = cron.schedule(
              cronExpression,
              async () => {
                try {
                  // Query _ShardCurrentUser table from Account database for real-time player count
                  const accountDb = await getAccountDb();
                  const result = await accountDb.request().query(`
                    SELECT 
                        SUM(nUserCount) as TotalOnlinePlayers,
                        MAX(dLogDate) as LastUpdate,
                        DATEDIFF(minute, MAX(dLogDate), GETDATE()) as MinutesAgo
                    FROM _ShardCurrentUser 
                    WHERE dLogDate = (SELECT MAX(dLogDate) FROM _ShardCurrentUser)
                  `);

                  const playerData = result.recordset[0];
                  const onlineCount = playerData?.TotalOnlinePlayers || 0;
                  const minutesAgo = playerData?.MinutesAgo || 0;

                  console.log(
                    `Players online collector: ${onlineCount} players found (data from ${minutesAgo}min ago)`
                  );

                  // Log warning if data is too old (more than 10 minutes)
                  if (minutesAgo > 10) {
                    console.warn(
                      `Players online collector: Warning - Data is ${minutesAgo} minutes old`
                    );
                  }

                  await MetricsService.setPlayersOnline(onlineCount, 120);
                } catch (err) {
                  console.error('players_online_collector job failed:', err);
                  // Set fallback value to prevent UI from showing stale data
                  await MetricsService.setPlayersOnline(0, 120);
                }
              },
              {
                scheduled: false,
                timezone: 'Europe/Berlin',
              }
            );
          }
          break;

        default:
          throw new Error(`Unbekannter Job: ${jobName}`);
      }

      // Starte den Task
      task.start();
      this.jobs.set(jobName, task);

      console.log(`🚀 Cron Job '${jobName}' gestartet mit Schedule: ${cronExpression}`);
      return true;
    } catch (error) {
      console.error(`❌ Fehler beim Starten von Job ${jobName}:`, error.message);
      throw error;
    }
  }

  /**
   * Stoppe Job
   */
  stopJob(jobName) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      job.destroy();
      this.jobs.delete(jobName);
      console.log(`⏹️ Cron Job '${jobName}' gestoppt`);
    }
  }

  /**
   * Führe Silk Statistik Berechnung aus
   */
  async runSilkStatsCalculation() {
    try {
      console.log('🔄 Cron Job: Starte Silk Statistik Berechnung...');

      // Aktualisiere Last Run Time
      await pool.request().query(`
        UPDATE [SRO_CMS].[dbo].[cron_job_settings]
        SET last_run = GETDATE(),
            run_count = run_count + 1
        WHERE job_name = 'silk_stats_calculation'
      `);

      // Führe Berechnung aus
      const stats = await SilkStatsService.calculateFreshStats();

      console.log('✅ Cron Job: Silk Statistik Berechnung abgeschlossen', {
        totalSilkValue: stats.totalSilkValue,
        totalAccounts: stats.totalAccounts,
        calculationDuration: stats.calculationDuration,
      });
    } catch (error) {
      console.error('❌ Cron Job: Fehler bei Silk Statistik Berechnung:', error.message);
    }
  }

  /**
   * Initialisiere alle aktiven Jobs beim Server-Start
   */
  async initializeJobs() {
    console.log('🔧 Initialisiere Cron Jobs...');

    try {
      const jobSettings = await this.loadJobSettings();

      for (const job of jobSettings) {
        if (job.enabled) {
          await this.restartJob(job.job_name, job.cron_expression);
        }
      }

      console.log(`✅ ${jobSettings.filter((j) => j.enabled).length} Cron Jobs gestartet`);
    } catch (error) {
      console.error('❌ Fehler beim Initialisieren der Cron Jobs:', error.message);
    }
  }

  /**
   * Hole Job Status für API
   */
  async getJobStatus() {
    const jobSettings = await this.loadJobSettings();

    return jobSettings.map((job) => ({
      ...job,
      isRunning: this.jobs.has(job.job_name),
      nextRunEstimate:
        job.enabled && this.jobs.has(job.job_name)
          ? this.getNextRunTime(job.cron_expression)
          : null,
    }));
  }

  /**
   * Berechne nächste Ausführungszeit
   */
  getNextRunTime(cronExpression) {
    try {
      const task = cron.schedule(cronExpression, () => {}, { scheduled: false });
      const nextDate = task.getNextScheduleDate();
      task.destroy();
      return nextDate;
    } catch (error) {
      return null;
    }
  }

  /**
   * Manueller Trigger für Job
   */
  async triggerJobManually(jobName) {
    switch (jobName) {
      case 'silk_stats_calculation':
        return await this.runSilkStatsCalculation();

      default:
        throw new Error(`Unbekannter Job: ${jobName}`);
    }
  }
}

module.exports = new CronJobService();
