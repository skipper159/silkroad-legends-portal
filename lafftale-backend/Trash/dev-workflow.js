#!/usr/bin/env node

/**
 * Development Workflow Optimizer for Lafftale API
 * Überwacht Swagger-Module und Server für Hot-Reload
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

console.log('🚀 Starting Lafftale API Development Workflow...\n');

// Pfade
const SWAGGER_DIR = path.join(__dirname, 'swagger', 'modular');
const SWAGGER_BUILDER = path.join(__dirname, 'swagger', 'swagger_builder.js');
const SERVER_FILE = path.join(__dirname, 'app.js');

let isBuilding = false;
let lastBuildTime = 0;

// Swagger Build-Funktion
async function buildSwagger(reason = 'File changed') {
  if (isBuilding) return;

  const now = Date.now();
  if (now - lastBuildTime < 1000) return; // Debounce 1s

  isBuilding = true;
  lastBuildTime = now;

  console.log(`\n🔨 ${reason} - Rebuilding Swagger documentation...`);

  return new Promise((resolve) => {
    const build = spawn('node', [SWAGGER_BUILDER, 'build'], {
      stdio: 'pipe',
      cwd: __dirname,
    });

    let output = '';
    build.stdout.on('data', (data) => {
      output += data.toString();
    });

    build.stderr.on('data', (data) => {
      console.error('❌ Swagger Build Error:', data.toString());
    });

    build.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Swagger documentation rebuilt successfully!');
        // Notify browser to refresh
        notifyBrowserRefresh();
      } else {
        console.error(`❌ Swagger build failed with code ${code}`);
      }
      isBuilding = false;
      resolve();
    });
  });
}

// Browser-Refresh-Benachrichtigung
function notifyBrowserRefresh() {
  // Simple HTTP request to trigger refresh endpoint
  const http = require('http');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api-docs/refresh',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('🔄 Browser refresh triggered');
    }
  });

  req.on('error', () => {
    // Ignore errors - server might not be running
  });

  req.end();
}

// Watch Swagger-Module
console.log('👀 Watching Swagger modules for changes...');
const swaggerWatcher = chokidar.watch(SWAGGER_DIR, {
  ignored: /node_modules/,
  persistent: true,
  ignoreInitial: true,
});

swaggerWatcher.on('change', (filePath) => {
  const relativePath = path.relative(SWAGGER_DIR, filePath);
  console.log(`📝 Changed: ${relativePath}`);
  buildSwagger(`File changed: ${relativePath}`);
});

swaggerWatcher.on('add', (filePath) => {
  const relativePath = path.relative(SWAGGER_DIR, filePath);
  console.log(`➕ Added: ${relativePath}`);
  buildSwagger(`File added: ${relativePath}`);
});

swaggerWatcher.on('unlink', (filePath) => {
  const relativePath = path.relative(SWAGGER_DIR, filePath);
  console.log(`➖ Removed: ${relativePath}`);
  buildSwagger(`File removed: ${relativePath}`);
});

// Initial build
buildSwagger('Initial build');

// Display help
console.log(`
📋 Development Workflow Commands:
   - Swagger modules are watched for changes
   - Auto-rebuild on file changes
   - Browser refresh notifications
   - Press Ctrl+C to stop
   
🌐 Access points:
   - API Documentation: http://localhost:3000/api-docs
   - API Health Check: http://localhost:3000/api
   - Refresh Documentation: http://localhost:3000/api-docs/refresh
   
⌨️  Keyboard shortcuts in browser:
   - Ctrl+/ : Focus search
   - Ctrl+Shift+R : Refresh documentation
`);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping development workflow...');
  swaggerWatcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating development workflow...');
  swaggerWatcher.close();
  process.exit(0);
});
