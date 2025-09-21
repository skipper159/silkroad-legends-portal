const express = require('express');
const router = express.Router();
const CronJobService = require('../services/cronJobService');
const adminAuth = require('../middleware/adminAuth');

/**
 * GET /api/admin/cron/jobs
 * Hole alle Cron Job Einstellungen
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobStatus = await CronJobService.getJobStatus();

    res.json({
      success: true,
      data: jobStatus,
    });
  } catch (error) {
    console.error('❌ Cron Jobs API Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Laden der Cron Job Einstellungen',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/cron/jobs/:jobName
 * Aktualisiere Cron Job Einstellung
 */
router.post('/jobs/:jobName', adminAuth, async (req, res) => {
  try {
    const { jobName } = req.params;
    const { cronExpression, enabled } = req.body;

    if (!cronExpression) {
      return res.status(400).json({
        success: false,
        error: 'cronExpression ist erforderlich',
      });
    }

    const result = await CronJobService.updateJobSetting(jobName, cronExpression, enabled);

    res.json({
      success: true,
      message: `Job ${jobName} erfolgreich aktualisiert`,
      data: { jobName, cronExpression, enabled },
    });
  } catch (error) {
    console.error('❌ Cron Job Update Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Aktualisieren des Cron Jobs',
      details: error.message,
    });
  }
});

/**
 * POST /api/admin/cron/jobs/:jobName/trigger
 * Triggere Cron Job manuell
 */
router.post('/jobs/:jobName/trigger', adminAuth, async (req, res) => {
  try {
    const { jobName } = req.params;

    console.log(`🚀 Manueller Trigger für Job: ${jobName}`);

    // Führe Job asynchron aus
    CronJobService.triggerJobManually(jobName)
      .then(() => {
        console.log(`✅ Manueller Job ${jobName} abgeschlossen`);
      })
      .catch((error) => {
        console.error(`❌ Manueller Job ${jobName} fehlgeschlagen:`, error);
      });

    res.json({
      success: true,
      message: `Job ${jobName} wurde manuell gestartet`,
      data: { jobName, triggeredAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error('❌ Manueller Job Trigger Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim manuellen Triggern des Jobs',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/admin/cron/jobs/:jobName
 * Stoppe Cron Job
 */
router.delete('/jobs/:jobName', adminAuth, async (req, res) => {
  try {
    const { jobName } = req.params;

    await CronJobService.updateJobSetting(jobName, '0 2 * * *', false);

    res.json({
      success: true,
      message: `Job ${jobName} wurde gestoppt`,
    });
  } catch (error) {
    console.error('❌ Cron Job Stop Fehler:', error);
    res.status(500).json({
      success: false,
      error: 'Fehler beim Stoppen des Cron Jobs',
      details: error.message,
    });
  }
});

module.exports = router;
