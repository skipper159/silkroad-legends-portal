const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

// Load the compiled modular swagger documentation
const swaggerPath = path.join(__dirname, 'swagger', 'swagger_compiled.json');
let swaggerDocument;

try {
  swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  console.log('✅ Loaded compiled swagger documentation');
} catch (error) {
  console.warn('⚠️  Compiled swagger not found, falling back to unified version');
  swaggerDocument = JSON.parse(fs.readFileSync('./swagger/swagger_unified.json', 'utf8'));
}

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files for Swagger UI customizations
app.use(express.static('public'));

// Enhanced Swagger-UI with custom options
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  customSiteTitle: 'Lafftale API Documentation',
  customfavIcon: '/favicon.ico',
  customJs: '/swagger-custom.js',
  customCssUrl: '/swagger-custom.css',
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// API Documentation refresh endpoint (for development)
app.get('/api-docs/refresh', (req, res) => {
  try {
    swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    res.json({
      success: true,
      message: 'Swagger documentation refreshed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh documentation',
      error: error.message,
    });
  }
});

// Basic API health check
app.get('/api', (req, res) => {
  res.json({
    message: 'Lafftale API is running',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Deine API-Routen
app.use('/api/auth', require('./routes/auth-v2'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin_tickets', require('./routes/admin_tickets'));
app.use('/api/user_tickets', require('./routes/user_tickets'));
app.use('/api/donation', require('./routes/donation'));
app.use('/api/rankings', require('./routes/ranking')); // Main ranking system
app.use('/api/metrics', require('./routes/metrics'));

// Enhanced Rankings API v2 - DISABLED (buggy schema compatibility)
// app.use('/api/enhanced', require('./routes/ranking/enhancedRankings'));

app.use('/api/characters', require('./routes/characters'));
app.use('/api/character', require('./routes/character/publicCharacter'));
app.use('/api/unique-kills', require('./routes/uniqueKills'));
app.use('/api/modals', require('./routes/siteModals'));
app.use('/api/guild', require('./routes/guild/guildOverview'));
app.use('/api/characterdetails', require('./routes/characterdetails'));
app.use('/api/silk', require('./routes/silk'));
app.use('/api/gameaccount', require('./routes/gameaccount'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/news', require('./routes/news'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/downloads', require('./routes/downloads'));
app.use('/api/footer-links', require('./routes/footer_links'));
app.use('/api/footer-sections', require('./routes/footer_sections'));
app.use('/api/footer-hardcoded-links', require('./routes/footer_hardcoded_links'));
app.use('/api/admin', require('./routes/admin_footer_links'));
app.use('/api/admin', require('./routes/admin_footer_sections'));
app.use('/api/admin', require('./routes/admin_footer_hardcoded_links'));
app.use('/api/vouchers', require('./routes/vouchers'));
app.use('/api/admin/vouchers', require('./routes/admin_vouchers'));
app.use('/api/vote', require('./routes/votes'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/admin/referrals', require('./routes/admin_referrals'));
app.use('/api/admin/silk', require('./routes/adminSilk'));
app.use('/api/admin/cron', require('./routes/adminCron'));
app.use('/api/user-roles', require('./routes/user-roles'));
app.use('/api/2fa', require('./routes/twoFactor'));

// TEMPORARY: Migration endpoints (remove after migration complete)
const migrationController = require('./controllers/migrationController');
app.post('/api/migration/run', migrationController.runCompleteMigration);
app.get('/api/migration/verify', migrationController.verifyMigration);
app.get('/api/migration/info', migrationController.getMigrationInfo);

//app.use("/api/Payment", require("./routes/Payment/payment"));

// Initialisiere Cron Jobs
const CronJobService = require('./services/cronJobService');
CronJobService.initializeJobs().catch(console.error);

// Initialize Delayed Reward System
const referralCronJobs = require('./services/referralCronJobs');
referralCronJobs.startDelayedRewardProcessing().catch((error) => {
  console.error('Failed to start delayed reward processing:', error);
});

// Ensure players_online_collector job is registered with a sensible default (every minute)
// This will create/update the job setting and start the scheduled task according to the service logic
CronJobService.updateJobSetting('players_online_collector', '*/1 * * * *', true).catch((err) => {
  console.warn(
    'Could not register players_online_collector job at startup:',
    err && err.message ? err.message : err
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Lafftale backend running on port ${PORT}`));
