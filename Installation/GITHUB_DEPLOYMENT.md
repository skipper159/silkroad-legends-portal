# Deployment Guide - Silkroad Legends Portal

## Overview

This project uses GitHub Actions with a Self-Hosted Runner for automatic deployment.

| Component | URL                         | Directory           |
| --------- | --------------------------- | ------------------- |
| Frontend  | https://your-domain.com     | `/path/to/frontend` |
| Backend   | https://api.your-domain.com | `/path/to/backend`  |

---

## How Deployment Works

1. You push changes to the `main` branch
2. GitHub Actions automatically detects the changes
3. The Self-Hosted Runner on the server performs the build/deploy
4. The website is automatically updated

**Frontend changes** (src/, public/, etc.) → Build + Deploy  
**Backend changes** (lafftale-backend/) → Sync + PM2 Restart

---

## Environment Variables

### Understanding the Difference

| Aspect        | Frontend                        | Backend                    |
| ------------- | ------------------------------- | -------------------------- |
| Variable Type | Build-time (`VITE_` prefix)     | Runtime (`process.env`)    |
| Where stored? | In GitHub Workflow YAML         | On server in `.env` file   |
| On Deploy?    | Rebuilt with hardcoded values   | `.env` remains unchanged   |
| Security      | Values are public in built code | Values stay only on server |

### Frontend Environment

Frontend uses **Vite build-time variables**. These are defined directly in the workflow:

```yaml
# .github/workflows/deploy-frontend.yml
env:
  VITE_API_baseurl: https://backend.lafftale.online
  VITE_API_weburl: https://backend.lafftale.online
  VITE_ASSETS_weburl: https://lafftale.online
```

For **local development**, copy `.env.example` to `.env` and adjust for localhost.

### Backend Environment

Backend uses **runtime environment variables**. The `.env` file lives only on the production server and is **never overwritten** during deployment (protected by `--exclude '.env'` in rsync).

**Initial server setup** (one-time):

```bash
# On the production server
cd /home/lafftale-backend/htdocs/backend.lafftale.online
cp .env.example .env
nano .env  # Fill in production values
```

**When adding new environment variables**:

1. Update `lafftale-backend/.env.example` in the repo (documentation)
2. Manually add the variable to `.env` on the production server
3. Restart PM2: `pm2 restart lafftale-api`

---

## Local Development Setup

### 1. Frontend

```bash
# Copy environment template
cp .env.example .env

# Edit with local values (localhost URLs)
# Start development server
npm run dev
```

### 2. Backend

```bash
cd lafftale-backend

# Copy environment template
cp .env.example .env

# Edit with your local database credentials, JWT secret, etc.
# Start development server
npm run dev
```

---

## Server Setup (One-Time)

### 1. Get GitHub Runner Token

1. Go to: https://github.com/skipper159/silkroad-legends-portal/settings/actions/runners
2. Click **New self-hosted runner**
3. Select **Linux** and **x64**
4. Copy the token from the `./config.sh` command

### 2. Run on Server

```bash
# Connect via SSH
ssh your-username@your-server

# Set permissions
sudo chown -R $(whoami):$(whoami) /runners
sudo chown -R $(whoami):$(whoami) /home/lafftale/htdocs/lafftale.online
sudo chown -R $(whoami):$(whoami) /home/lafftale-backend/htdocs/backend.lafftale.online

# Install runner
cd /runners
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf actions-runner-linux-x64-2.321.0.tar.gz
sudo ./bin/installdependencies.sh

# Configure (replace YOUR_TOKEN!)
./config.sh --url https://github.com/skipper159/silkroad-legends-portal --token YOUR_TOKEN

# Start as service
sudo ./svc.sh install
sudo ./svc.sh start
```

### 3. Node.js & PM2 (if not installed)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### 4. Backend Environment Setup

```bash
cd /home/lafftale-backend/htdocs/backend.lafftale.online

# Create production .env from template
cp .env.example .env

# Edit with production values
nano .env

# Start the backend
pm2 start app.js --name lafftale-api
pm2 save
```

---

## File Reference

| File                            | Purpose                           | Committed to Git?   |
| ------------------------------- | --------------------------------- | ------------------- |
| `.env.example`                  | Template with placeholder values  | ✅ Yes              |
| `.env`                          | Local development config          | ❌ No               |
| `.env.local`                    | Local overrides                   | ❌ No               |
| `.env.production`               | Production values (frontend only) | ❌ No               |
| `lafftale-backend/.env.example` | Backend template                  | ✅ Yes              |
| `lafftale-backend/.env`         | Backend secrets                   | ❌ No (server only) |

---

## Troubleshooting

### Runner is Offline

```bash
sudo ./svc.sh status   # Check status
sudo ./svc.sh restart  # Restart
```

### PM2 Process Not Running

```bash
pm2 status                    # Show all processes
pm2 restart lafftale-api      # Restart
pm2 logs lafftale-api         # Show logs
```

### Build Fails

- Check GitHub Actions logs: https://github.com/skipper159/silkroad-legends-portal/actions

### New Environment Variable Not Working

1. Verify it's in `.env.example` (documentation)
2. For backend: Add to server's `.env` and run `pm2 restart lafftale-api`
3. For frontend: Update the workflow YAML and push
