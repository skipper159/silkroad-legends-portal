# Ranking System Refactoring

## Neue modulare Struktur

Die ursprüngliche `rankings.js` (1063 Zeilen) wurde in eine saubere modulare Struktur aufgeteilt:

### Verzeichnisstruktur

```
lafftale-backend/routes/
├── rankings.js (Original - 1063 Zeilen)
├── rankings-new.js (Neue kompakte Version)
└── ranking/ (Neues modulares System)
    ├── index.js (Haupt-Router, 280 Zeilen)
    ├── playerRankings.js (Basis-Player-Rankings)
    ├── jobRankings.js (Job-spezifische Rankings)
    ├── honorRankings.js (Honor-System)
    ├── pvpRankings.js (PvP-System)
    ├── fortressRankings.js (Fortress-System)
    ├── jobAnalytics.js (Phase 3 Analytics)
    └── guildRankings.js (Guild-System)
```

### Module-Details

#### 1. **playerRankings.js**

- `getPlayerRanking()` - Top Player nach Level/Exp
- `getUniqueRanking()` - Unique Monster Kills
- `getUniqueMonthlyRanking()` - Monatliche Unique Kills

#### 2. **jobRankings.js**

- `getTraderRanking()` - Trader Level Rankings
- `getThiefRanking()` - Thief Level Rankings
- `getHunterRanking()` - Hunter Level Rankings

#### 3. **honorRankings.js**

- `getHonorRanking()` - Honor-System mit erweiterten Filtern
- Parameter: race, minHonor, minKills

#### 4. **pvpRankings.js**

- `getPvPRanking()` - PvP-Rankings mit K/D-Ratio
- Parameter: race, minKills, maxDeaths

#### 5. **fortressRankings.js**

- `getFortressPlayerRanking()` - Fortress-Player-Rankings
- Parameter: race, minLevel, guild

#### 6. **jobAnalytics.js** (Phase 3)

- `getJobStatistics()` - Umfassende Job-Statistiken
- `getJobLeaderboardComparison()` - Job-Leaderboard-Vergleich
- `getJobProgressionAnalytics()` - Job-Progression-Analytics

#### 7. **guildRankings.js**

- `getGuildRanking()` - Guild-Rankings nach Member-Count

#### 8. **index.js** (Haupt-Router)

- Vereint alle Module
- Definiert alle API-Endpunkte
- Behandelt Fehlerbehandlung
- Backward-Kompatibilität mit `:type` Parameter

### API-Endpunkte

#### Phase 3 (Neu)

- `/api/rankings/job-statistics`
- `/api/rankings/job-leaderboard-comparison`
- `/api/rankings/job-progression`

#### Phase 1 (Erweitert)

- `/api/rankings/trader`
- `/api/rankings/honor` (mit Filtern)
- `/api/rankings/fortress-players` (mit Filtern)
- `/api/rankings/pvp` (mit Filtern)

#### Generisch (Backward-Kompatibilität)

- `/api/rankings/:type` (top-player, unique, unique-monthly, thief, hunter, guild)

### Vorteile der neuen Struktur

1. **Modularität**: Jedes Modul hat eine klare Verantwortung
2. **Wartbarkeit**: Kleinere, übersichtliche Dateien
3. **Testbarkeit**: Module können einzeln getestet werden
4. **Skalierbarkeit**: Neue Rankings einfach hinzufügbar
5. **Code-Wiederverwendung**: Funktionen in separaten Modulen
6. **Backward-Kompatibilität**: Alte API-Calls funktionieren weiterhin

### Integration

Um das neue modulare System zu verwenden:

```javascript
// In app.js oder main server file
const rankingRoutes = require('./routes/ranking');
app.use('/api/rankings', rankingRoutes);
```

Oder für graduelle Migration:

```javascript
// Neue modulare Version parallel verwenden
const newRankingRoutes = require('./routes/rankings-new');
app.use('/api/rankings-v2', newRankingRoutes);
```

### Testing

Das System wurde getestet mit:

- ✅ Route-Loading (8 Endpunkte erkannt)
- ✅ Module-Imports (alle Module laden korrekt)
- ✅ Express-Router-Integration
- ✅ Backward-Kompatibilität erhalten

### Nächste Schritte

1. **Graduelle Migration**: Neue Route parallel einführen
2. **Testing**: Alle Endpunkte mit echten Datenbankverbindungen testen
3. **Documentation**: Swagger-Dokumentation anpassen
4. **Performance**: Query-Optimierung in einzelnen Modulen
5. **Monitoring**: Logging und Error-Tracking hinzufügen
