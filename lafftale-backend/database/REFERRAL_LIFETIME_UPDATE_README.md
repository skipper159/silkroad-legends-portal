# Referral Anti-Cheat: Umstellung auf Lifetime IP-Blocking

## Übersicht

Diese Änderungen stellen das Referral-System von **"maximal X Referrals pro IP pro Tag"** auf **"maximal 1 Referral pro IP insgesamt (lifetime)"** um.

## Problem

Das alte System erlaubte mehrere Referrals von derselben IP-Adresse, solange sie an unterschiedlichen Tagen erfolgten. Dies ermöglichte Missbrauch durch:

- Mehrfache Registrierungen von derselben Person über mehrere Tage hinweg
- Umgehung der Daily Limits durch zeitversetztes Erstellen von Accounts

## Lösung

Mit den neuen Einstellungen kann eine IP-Adresse nur **einmal insgesamt** für ein Referral verwendet werden, unabhängig vom Zeitraum.

---

## 🔧 Durchgeführte Änderungen

### 1. Datenbank-Einstellungen (SQL)

#### Datei: `referral_anticheat_lifetime_update.sql`

- **NEU erstellt**: Update-Skript für bestehende Datenbanken
- Benennt `max_referrals_per_ip_per_day` → `max_referrals_per_ip_lifetime` um
- Benennt `max_referrals_per_fingerprint_per_day` → `max_referrals_per_fingerprint_lifetime` um
- Fügt `block_duplicate_ip_completely` hinzu (strikte Lifetime-Blockierung)
- Setzt alle Werte auf `1` (nur einmalige Verwendung)

#### Datei: `referral_anticheat_schema.sql`

- **AKTUALISIERT**: Basis-Schema für Neuinstallationen
- Verwendet jetzt die neuen `_lifetime` Setting-Keys
- Default-Werte auf `1` gesetzt

---

## 📋 Anwendung der Änderungen

### Schritt 1: Datenbank aktualisieren

Führe das Update-Skript in SQL Server Management Studio aus:

```sql
-- Öffne und führe aus:
lafftale-backend/database/referral_anticheat_lifetime_update.sql
```

### Schritt 2: Backend-Code anpassen (TODO)

Die Backend-Validierung muss noch angepasst werden. Hier ist, wo Änderungen erforderlich sind:

#### Datei: `routes/referrals.js` - POST `/register` Endpunkt

**Aktuell**: Prüft Referrals der letzten 24 Stunden

```javascript
// ❌ ALTE Logik (per Day):
const ipCheckQuery = `
  SELECT COUNT(*) as count
  FROM referrals
  WHERE ip_address = @ip_address
  AND created_at >= DATEADD(day, -1, GETDATE())
`;
```

**NEU**: Sollte prüfen auf ALLE Referrals (lifetime)

```javascript
// ✅ NEUE Logik (Lifetime):
const ipCheckQuery = `
  SELECT COUNT(*) as count
  FROM referrals
  WHERE ip_address = @ip_address
`;
```

#### Empfohlene Implementierung:

```javascript
// routes/referrals.js - POST /register Endpunkt

router.post('/register', async (req, res) => {
  try {
    const { referrer_code, referred_jid, ip_address, fingerprint } = req.body;
    const pool = await getWebDb();

    // 1. Lade Anti-Cheat Einstellungen
    const settingsResult = await pool.request().query(`
      SELECT setting_key, setting_value 
      FROM referral_settings 
      WHERE setting_key IN (
        'anticheat_enabled',
        'max_referrals_per_ip_lifetime',
        'max_referrals_per_fingerprint_lifetime',
        'block_duplicate_ip_completely'
      )
    `);

    const settings = {};
    settingsResult.recordset.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    // 2. Prüfe ob Anti-Cheat aktiv
    if (settings.anticheat_enabled === 'true') {
      // 3. IP-Adresse Lifetime-Prüfung
      if (ip_address && settings.block_duplicate_ip_completely === 'true') {
        const ipCheck = await pool.request().input('ip_address', sql.NVarChar, ip_address).query(`
            SELECT COUNT(*) as count
            FROM referrals
            WHERE ip_address = @ip_address
            AND invited_jid IS NOT NULL
          `);

        const ipCount = ipCheck.recordset[0].count;
        const maxIpReferrals = parseInt(settings.max_referrals_per_ip_lifetime) || 1;

        if (ipCount >= maxIpReferrals) {
          return res.status(429).json({
            success: false,
            message:
              'This IP address has already been used for a referral. Each IP can only be used once.',
            error_code: 'IP_ALREADY_USED',
          });
        }
      }

      // 4. Fingerprint Lifetime-Prüfung
      if (fingerprint && settings.max_referrals_per_fingerprint_lifetime) {
        const fingerprintCheck = await pool
          .request()
          .input('fingerprint', sql.NVarChar, fingerprint).query(`
            SELECT COUNT(*) as count
            FROM referrals
            WHERE fingerprint = @fingerprint
            AND invited_jid IS NOT NULL
          `);

        const fingerprintCount = fingerprintCheck.recordset[0].count;
        const maxFingerprintReferrals =
          parseInt(settings.max_referrals_per_fingerprint_lifetime) || 1;

        if (fingerprintCount >= maxFingerprintReferrals) {
          return res.status(429).json({
            success: false,
            message:
              'This device has already been used for a referral. Each device can only be used once.',
            error_code: 'DEVICE_ALREADY_USED',
          });
        }
      }
    }

    // 5. Erstelle Referral (wenn alle Prüfungen bestanden)
    await pool
      .request()
      .input('code', sql.NVarChar, referrer_code)
      .input('invited_jid', sql.Int, referred_jid)
      .input('ip_address', sql.NVarChar, ip_address)
      .input('fingerprint', sql.NVarChar, fingerprint)
      .input('is_valid', sql.Bit, 1).query(`
        INSERT INTO referrals 
        (code, invited_jid, ip_address, fingerprint, is_valid, points, created_at, updated_at)
        VALUES (@code, @invited_jid, @ip_address, @fingerprint, @is_valid, 100, GETDATE(), GETDATE())
      `);

    res.json({
      success: true,
      message: 'Referral registered successfully',
    });
  } catch (error) {
    console.error('Error registering referral:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});
```

---

## 🎯 Neue Anti-Cheat Einstellungen

| Setting Key                              | Default | Beschreibung                                                         |
| ---------------------------------------- | ------- | -------------------------------------------------------------------- |
| `max_referrals_per_ip_lifetime`          | `1`     | Maximal 1 Referral pro IP-Adresse **insgesamt** (lifetime)           |
| `max_referrals_per_fingerprint_lifetime` | `1`     | Maximal 1 Referral pro Browser-Fingerprint **insgesamt**             |
| `block_duplicate_ip_completely`          | `true`  | Blockiert jede IP die bereits für irgendein Referral verwendet wurde |

---

## 📊 Verhalten

### Vorher (Per Day):

- IP `192.168.1.1` erstellt Referral am **01.01.2025** → ✅ Erlaubt
- IP `192.168.1.1` erstellt Referral am **02.01.2025** → ✅ Erlaubt (neuer Tag!)
- IP `192.168.1.1` erstellt Referral am **03.01.2025** → ✅ Erlaubt (neuer Tag!)

### Nachher (Lifetime):

- IP `192.168.1.1` erstellt Referral am **01.01.2025** → ✅ Erlaubt
- IP `192.168.1.1` erstellt Referral am **02.01.2025** → ❌ **BLOCKIERT** (IP bereits verwendet!)
- IP `192.168.1.1` erstellt Referral am **03.01.2025** → ❌ **BLOCKIERT** (IP bereits verwendet!)

---

## ⚠️ Wichtige Hinweise

### 1. Bestehende Referrals

Die Änderungen beeinflussen nur **neue** Referral-Registrierungen. Bestehende Einträge bleiben unverändert.

### 2. Strikte Kontrolle

Mit `max_referrals_per_ip_lifetime = 1` ist es unmöglich, von derselben IP aus mehrere Referrals zu erstellen, auch wenn sie für verschiedene Accounts sind.

### 3. Legitime Benutzer in geteilten Netzwerken

**Problem**: Mehrere echte Benutzer in einem Haushalt/Büro/Uni teilen sich oft dieselbe öffentliche IP.

**Lösung**:

- Der Fingerprint-Check hilft, verschiedene Geräte zu unterscheiden
- Bei Bedarf: Manuelles Admin-Review über `/api/admin/referrals/anticheat/validate/:id`
- Oder: Wert erhöhen auf `2-3` für `max_referrals_per_ip_lifetime`

### 4. VPN/Proxy Benutzer

Benutzer, die VPNs verwenden, werden bei jedem VPN-Wechsel als "neue IP" erkannt. Der Fingerprint-Check fängt dies ab.

---

## 🧪 Testing

Nach der Implementierung teste folgende Szenarien:

1. **Erstes Referral von IP X** → Sollte funktionieren ✅
2. **Zweites Referral von derselben IP X** → Sollte blockiert werden ❌
3. **Referral von neuer IP Y** → Sollte funktionieren ✅
4. **Admin-Panel**: Prüfe `/api/admin/referrals/anticheat/ip-stats` für Statistiken

---

## 📝 Nächste Schritte

- [ ] SQL Update-Skript ausführen (`referral_anticheat_lifetime_update.sql`)
- [ ] Backend-Code in `routes/referrals.js` anpassen
- [ ] Frontend-Fehlermeldungen aktualisieren (falls vorhanden)
- [ ] Admin-Panel testen
- [ ] User-Registrierung testen

---

## 🔄 Rollback (falls nötig)

Falls du zur alten "Per Day" Logik zurückkehren möchtest:

```sql
UPDATE referral_settings
SET
    setting_key = 'max_referrals_per_ip_per_day',
    setting_value = '5',
    description = 'Maximum referrals allowed per IP address per day'
WHERE setting_key = 'max_referrals_per_ip_lifetime';

UPDATE referral_settings
SET
    setting_key = 'max_referrals_per_fingerprint_per_day',
    setting_value = '3',
    description = 'Maximum referrals allowed per browser fingerprint per day'
WHERE setting_key = 'max_referrals_per_fingerprint_lifetime';
```

Und Backend-Code entsprechend mit `DATEADD(day, -1, GETDATE())` anpassen.
