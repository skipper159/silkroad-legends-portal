# Deployment Guide - Silkroad Legends Portal

## Übersicht

Dieses Projekt verwendet GitHub Actions mit einem Self-Hosted Runner für automatisches Deployment.

| Komponente | URL                             | Verzeichnis                                             |
| ---------- | ------------------------------- | ------------------------------------------------------- |
| Frontend   | https://lafftale.online         | `/home/lafftale/htdocs/lafftale.online`                 |
| Backend    | https://backend.lafftale.online | `/home/backend-lafftale/htdocs/backend.lafftale.online` |

---

## Wie funktioniert das Deployment?

1. Du pushst Änderungen auf den `main` Branch
2. GitHub Actions erkennt die Änderungen automatisch
3. Der Self-Hosted Runner auf dem Server führt den Build/Deploy aus
4. Die Website wird automatisch aktualisiert

**Frontend-Änderungen** (src/, public/, etc.) → Build + Deploy  
**Backend-Änderungen** (lafftale-backend/) → Sync + PM2 Restart

---

## Server-Setup (Einmalig)

### 1. GitHub Runner Token holen

1. Gehe zu: https://github.com/skipper159/silkroad-legends-portal/settings/actions/runners
2. Klicke **New self-hosted runner**
3. Wähle **Linux** und **x64**
4. Kopiere den Token aus dem `./config.sh` Befehl

### 2. Auf dem Server ausführen

```bash
# Verbinde dich via SSH
ssh dein-username@dein-server

# Berechtigungen setzen
sudo chown -R $(whoami):$(whoami) /runners
sudo chown -R $(whoami):$(whoami) /home/lafftale/htdocs/lafftale.online
sudo chown -R $(whoami):$(whoami) /home/backend-lafftale/htdocs/backend.lafftale.online

# Runner installieren
cd /runners
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf actions-runner-linux-x64-2.321.0.tar.gz
sudo ./bin/installdependencies.sh

# Konfigurieren (DEIN_TOKEN ersetzen!)
./config.sh --url https://github.com/skipper159/silkroad-legends-portal --token DEIN_TOKEN

# Als Dienst starten
sudo ./svc.sh install
sudo ./svc.sh start
```

### 3. Node.js & PM2 (falls nicht installiert)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

---

## Troubleshooting

### Runner ist offline

```bash
sudo ./svc.sh status   # Status prüfen
sudo ./svc.sh restart  # Neu starten
```

### PM2 Prozess läuft nicht

```bash
pm2 status                    # Alle Prozesse anzeigen
pm2 restart lafftale-api      # Neu starten
pm2 logs lafftale-api         # Logs anzeigen
```

### Build schlägt fehl

- Prüfe die GitHub Actions Logs unter: https://github.com/skipper159/silkroad-legends-portal/actions
