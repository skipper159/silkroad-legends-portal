# Backend Migration Tasks - Silkroad Legends Portal

## 🚨 Kritischer Fehler identifiziert

**Problem**: Das Backend wurde nur für die Account-Datenbank (TB_User) entwickelt, aber für ein vollständiges Silkroad-Portal werden mehrere Datenbanken benötigt:

- **GB_JoymaxPortal** (Game Portal Database)
- **SILKROAD_R_ACCOUNT** (Account Database)
- **SILKROAD_R_SHARD** (Character/Game Database)
- **SILKROAD_R_SHARD_LOG** (Log Database)
- **SRO_CMS** (Web Portal Database)

## 📋 Aufgabenliste für Migration

### 1. Datenbank-Konfiguration ✅

- [x] GB_JoymaxPortal als primäre Game-Database in .env hinzugefügt
- [x] Account-Database als sekundäre Database konfiguriert
- [x] MCP-Verbindungen für alle Datenbanken eingerichtet

### 2. Backend-Struktur Anpassungen

#### 2.1 Database Connection Updates 🔧

**Datei**: `lafftale-backend/db.js`

```javascript
// AKTUELL: Nur gamePool für SILKROAD_R_ACCOUNT
// ERFORDERLICH: Separate Pools für alle Datenbanken

const portalPool = new sql.ConnectionPool(portalConfig); // GB_JoymaxPortal
const accountPool = new sql.ConnectionPool(accountConfig); // SILKROAD_R_ACCOUNT
const shardPool = new sql.ConnectionPool(shardConfig); // SILKROAD_R_SHARD
const logPool = new sql.ConnectionPool(logConfig); // SILKROAD_R_SHARD_LOG
```

#### 2.2 User Authentication System 🚨

**Problem**: Benutzer werden nur in SRO_CMS.users angelegt
**Lösung**: Integration mit GB_JoymaxPortal

**Betroffene Dateien**:

- `routes/auth-v2.js` - Login/Register Logic
- `routes/users.js` - User Management
- `middleware/auth.js` - JWT Token Validation

**Änderungen erforderlich**:

```javascript
// Aktuell: Nur SRO_CMS.users
const user = await webDb.request().query('SELECT * FROM users WHERE email = @email');

// Neu: Integration mit MU_User in GB_JoymaxPortal
const portalUser = await portalPool.request().query('SELECT * FROM MU_User WHERE Email = @email');
const webUser = await webPool.request().query('SELECT * FROM users WHERE jid = @jid');
```

#### 2.3 Game Account Management 🔄

**Datei**: `routes/gameaccount.js`
**Problem**: Verwendet falsche Datenbank-Referenzen

**Aktuelle Implementierung**:

```javascript
// Falsch: Sucht in SILKROAD_R_ACCOUNT.TB_User
await gamePool.request().query('SELECT * FROM TB_User WHERE JID = @id');
```

**Korrekte Implementierung**:

```javascript
// Richtig: GB_JoymaxPortal.MU_User für Portal-Daten
await portalPool.request().query('SELECT * FROM MU_User WHERE JID = @id');
// Richtig: SILKROAD_R_ACCOUNT.TB_User für Game-Account-Daten
await accountPool.request().query('SELECT * FROM TB_User WHERE JID = @id');
```

#### 2.4 Character System 🎮

**Datei**: `routes/characters.js`
**Updates erforderlich**:

- Charaktere aus `SILKROAD_R_SHARD._Char` laden
- Guild-Informationen aus `SILKROAD_R_SHARD._Guild`
- Job-Informationen richtig zuordnen

#### 2.5 Silk/Donation System 💰

**Dateien**: `routes/silk.js`, `routes/donation.js`
**Neue Implementierung erforderlich**:

```javascript
// Silk-Balance aus korrekter Quelle
// GB_JoymaxPortal für JCash/Premium Silk
// SILKROAD_R_ACCOUNT.SK_Silk für Game Silk
```

#### 2.6 Ranking System 🏆

**Datei**: `routes/rankings.js`
**Neue Features basierend auf sro-cms**:

- Level Rankings aus `SILKROAD_R_SHARD._Char`
- Job Rankings (Trader/Hunter/Thief)
- Guild Rankings aus `SILKROAD_R_SHARD._Guild`
- Honor Rankings (Training Camp)

### 3. Frontend Anpassungen

#### 3.1 Admin Dashboard Updates 📊

**Datei**: `src/components/admin/GameAccountsList.tsx`

- Update für korrekte Datenbank-Queries
- Integration von Portal-User-Daten
- Silk-Balance-Anzeige korrigieren

#### 3.2 User Account Page 👤

**Datei**: `src/pages/Account.tsx`

- Game Account Integration überarbeiten
- Character Overview mit richtigen Daten
- Silk Mall Integration

#### 3.3 Character Overview 🎯

**Datei**: `src/components/account/CharacterOverview.tsx`

- Charakterdaten aus SHARD-Database
- Equipment/Inventory Integration
- Skill/Level Informationen

### 4. Neue Features Implementation

#### 4.1 Silk Management System 💎

**Basierend auf sro-cms Implementierung**:

- `APH_ChangedSilk` für Silk-Transaktionen
- `MU_VIP_Info` für VIP-Status
- Silk-Types: Premium, Gift, Point

#### 4.2 Vote System 🗳️

**Neue Route**: `routes/votes.js`

- Vote-Links Management
- Reward System
- Cooldown Logic

#### 4.3 Referral System 👥

**Neue Route**: `routes/referrals.js`

- Referral Code Generation
- Reward Tracking
- Anti-Abuse Measures

#### 4.4 Ranking System 🏅

**Erweiterte Rankings**:

- Level Ranking
- Job Ranking (Trader/Hunter/Thief)
- Guild Ranking
- Honor Ranking
- Unique Kill Ranking

#### 4.5 News & Pages System 📰

**CMS Integration**:

- News Management aus SRO_CMS
- Dynamic Pages
- Download Management

### 5. Database Schema Integration

#### 5.1 Portal Database (GB_JoymaxPortal)

**Wichtige Tabellen**:

- `MU_User` - Portal User Accounts
- `MU_VIP_Info` - VIP Status
- `APH_ChangedSilk` - Silk Transactions
- `Account` - Basic Account Info

#### 5.2 Account Database (SILKROAD_R_ACCOUNT)

**Wichtige Tabellen**:

- `TB_User` - Game Account Data
- `SK_Silk` - Silk Balance
- `_BlockedUser` - Ban Management

#### 5.3 Shard Database (SILKROAD_R_SHARD)

**Wichtige Tabellen**:

- `_Char` - Character Data
- `_User` - Character-User Mapping
- `_Guild` - Guild Information
- `_Inventory` - Character Inventory
- `_CharTrijob` - Job Information

#### 5.4 Web Database (SRO_CMS)

**Wichtige Tabellen**:

- `users` - Web Portal Users
- `news` - News Management
- `downloads` - Download Files
- `votes` - Vote System
- `referrals` - Referral System

### 6. Security & Authentication

#### 6.1 Multi-Database Authentication

- Portal Login (GB_JoymaxPortal.MU_User)
- Web Login (SRO_CMS.users)
- Game Account Linking

#### 6.2 Permission System

- Admin Rights Management
- User Role System
- Feature Access Control

### 7. API Endpoints Restructuring

#### 7.1 Neue Endpoints

```
/api/portal/user/:jid - Portal User Info
/api/silk/balance/:jid - Silk Balance
/api/characters/list/:jid - Character List
/api/rankings/level - Level Rankings
/api/rankings/job/:type - Job Rankings
/api/votes/platforms - Vote Platforms
/api/referrals/generate - Generate Referral Code
```

#### 7.2 Updated Endpoints

```
/api/gameaccount/* - Korrigierte Datenbankzugriffe
/api/admin/users - Multi-Database User Management
/api/auth/* - Multi-Database Authentication
```

### 8. Testing & Validation

#### 8.1 Database Connection Tests

- [ ] Alle 5 Datenbanken erfolgreich verbunden
- [ ] Query Performance optimiert
- [ ] Connection Pooling implementiert

#### 8.2 Feature Tests

- [ ] User Registration/Login funktional
- [ ] Game Account Creation/Management
- [ ] Character Data Loading
- [ ] Silk Balance/Transactions
- [ ] Ranking System
- [ ] Admin Panel Features

### 9. Performance Optimizations

#### 9.1 Database Optimization

- Connection Pooling für alle DBs
- Query Caching implementieren
- Index Optimization

#### 9.2 API Optimization

- Response Caching
- Pagination für Rankings
- Lazy Loading für Character Data

### 10. Documentation Updates

#### 10.1 API Documentation

- Swagger Integration
- Endpoint Documentation
- Database Schema Documentation

#### 10.2 Development Documentation

- Setup Instructions Update
- Database Configuration Guide
- Feature Implementation Guide

---

## 🎯 Prioritäten

### **Phase 1: Critical Fixes (Sofort)**

1. Database Connection Restructuring
2. User Authentication System Fix
3. Game Account Management Fix

### **Phase 2: Core Features (Woche 1)**

1. Character System Implementation
2. Silk Management System
3. Basic Rankings

### **Phase 3: Advanced Features (Woche 2)**

1. Vote System
2. Referral System
3. Admin Panel Enhancements

### **Phase 4: Polish & Optimization (Woche 3)**

1. Performance Optimization
2. Security Enhancements
3. Documentation Completion

---

## 📁 Betroffene Dateien

### Backend Files

- `db.js` - Database connections
- `routes/auth-v2.js` - Authentication
- `routes/users.js` - User management
- `routes/gameaccount.js` - Game accounts
- `routes/characters.js` - Character system
- `routes/silk.js` - Silk management
- `routes/rankings.js` - Ranking system
- `routes/admin.js` - Admin panel

### Frontend Files

- `src/pages/Account.tsx` - User account page
- `src/components/admin/GameAccountsList.tsx` - Admin game accounts
- `src/components/account/CharacterOverview.tsx` - Character display
- `src/components/account/DonateSilkMall.tsx` - Silk mall

### Configuration Files

- `.env` - Database configuration
- `package.json` - Dependencies
- Database migration scripts

---

**Status**: Migration Plan Created ✅
**Next Steps**: Begin Phase 1 Implementation
**Estimated Time**: 3-4 Wochen für vollständige Migration
