# Referral Anti-Cheat: Umgehungsmöglichkeiten & Gegenmaßnahmen

## 🚨 Problem: Mögliche Umgehungen

### 1. VPN-Nutzung

**Angriff:**

```
Benutzer verwendet VPN und wechselt für jede Registrierung die IP:
- Registrierung 1: IP 1.2.3.4 (VPN Server DE)
- Registrierung 2: IP 5.6.7.8 (VPN Server NL)
- Registrierung 3: IP 9.10.11.12 (VPN Server US)
```

**Problem:** Jede neue IP = neues Referral möglich ❌

**Lösung:** Browser-Fingerprinting (bereits im Schema vorhanden!)

```javascript
// Der Fingerprint bleibt gleich, auch wenn IP wechselt
fingerprint: 'a7f8b9c2d4e5f6g7h8i9'; // Gleicher Wert für alle 3 Registrierungen
```

---

### 2. Browser-Wechsel

**Angriff:**

```
Benutzer verwendet verschiedene Browser auf demselben Gerät:
- Registrierung 1: Chrome → Fingerprint A
- Registrierung 2: Firefox → Fingerprint B
- Registrierung 3: Edge → Fingerprint C
```

**Problem:** Jeder Browser = neuer Fingerprint ❌

**Lösung:** IP-Adresse (bereits im Schema vorhanden!)

```javascript
// Die IP bleibt gleich, auch wenn Browser wechselt
ip_address: '192.168.1.100'; // Gleicher Wert für alle 3 Registrierungen
```

---

### 3. Cache löschen / Browser neu installieren

**Angriff:**

```
Benutzer löscht Browser-Cache oder installiert Browser neu
→ Neuer Fingerprint generiert
```

**Problem:** Fingerprint ändert sich ❌

**Lösung:** IP-Adresse + Account-Tracking

```sql
-- Prüfe ob diese IP bereits einen Account erstellt hat
SELECT COUNT(*) FROM users WHERE registration_ip = '192.168.1.100'
```

---

### 4. Kombination: VPN + Browser-Wechsel + Inkognito-Modus

**Angriff (Worst Case):**

```
- Registrierung 1: Chrome Inkognito + VPN DE → IP A, Fingerprint X
- Registrierung 2: Firefox Private + VPN NL → IP B, Fingerprint Y
- Registrierung 3: Edge InPrivate + VPN US → IP C, Fingerprint Z
```

**Problem:** Sowohl IP als auch Fingerprint ändern sich ❌❌

**Lösung:** Multi-Layer-Prüfung (siehe unten)

---

## ✅ Empfohlene Multi-Layer Anti-Cheat Strategie

### Layer 1: IP + Fingerprint Kombination (OR-Logik)

```javascript
// Blockiere wenn ENTWEDER IP ODER Fingerprint bereits verwendet wurde
if (ipAlreadyUsed || fingerprintAlreadyUsed) {
  return 'BLOCKED';
}
```

### Layer 2: Verdächtigkeitsscore

```javascript
let suspicionScore = 0;

// IP wurde bereits verwendet
if (ipAlreadyUsed) suspicionScore += 50;

// Fingerprint wurde bereits verwendet
if (fingerprintAlreadyUsed) suspicionScore += 50;

// IP ist bekannter VPN-Provider
if (isKnownVPN(ip)) suspicionScore += 30;

// Sehr neuer Account (weniger als 1 Stunde alt)
if (accountAge < 3600) suspicionScore += 20;

// Keine Email-Verifizierung
if (!emailVerified) suspicionScore += 20;

// Account hat noch nie gespielt
if (playtime === 0) suspicionScore += 10;

if (suspicionScore >= 70) {
  markAsReviewRequired(); // Admin muss manuell prüfen
}
```

### Layer 3: Account-Aktivität

```javascript
// Nur Accounts die mindestens Level 20 erreicht haben können Referrals benutzen
if (invitedAccount.characterLevel < 20) {
  return 'BLOCKED - Account must reach level 20 first';
}
```

### Layer 4: Zeitverzögerung

```javascript
// Account muss mindestens 24 Stunden alt sein
const accountAge = Date.now() - accountCreationDate;
if (accountAge < 86400000) {
  // 24 Stunden in ms
  return 'BLOCKED - Account must be at least 24 hours old';
}
```

---

## 🎯 Implementierung: Realistische Anti-Cheat Logik

### Empfohlenes Setup:

```javascript
// routes/referrals.js oder auth.js

async function validateReferralAntiCheat(referralData) {
  const { ip_address, fingerprint, referred_jid } = referralData;
  const pool = await getWebDb();

  // Lade Einstellungen
  const settings = await loadAntiCheatSettings(pool);

  if (settings.anticheat_enabled !== 'true') {
    return { valid: true };
  }

  // === LAYER 1: Strikte Checks ===

  // 1.1: IP bereits verwendet? (Lifetime)
  const ipCheck = await pool.request().input('ip', sql.NVarChar, ip_address).query(`
      SELECT COUNT(*) as count 
      FROM referrals 
      WHERE ip_address = @ip 
      AND invited_jid IS NOT NULL
      AND is_valid = 1
    `);

  const ipUsed = ipCheck.recordset[0].count > 0;

  // 1.2: Fingerprint bereits verwendet? (Lifetime)
  const fpCheck = await pool.request().input('fp', sql.NVarChar, fingerprint).query(`
      SELECT COUNT(*) as count 
      FROM referrals 
      WHERE fingerprint = @fp 
      AND invited_jid IS NOT NULL
      AND is_valid = 1
    `);

  const fpUsed = fpCheck.recordset[0].count > 0;

  // === ENTSCHEIDUNG: Strikte Blockierung ===

  if (settings.block_duplicate_ip_completely === 'true' && ipUsed) {
    await logAntiCheat(pool, {
      ip_address,
      fingerprint,
      action: 'REFERRAL_BLOCKED',
      detection_reason: 'IP_ALREADY_USED_LIFETIME',
      is_suspicious: true,
    });

    return {
      valid: false,
      reason: 'IP_ALREADY_USED',
      message: 'This IP address has already been used for a referral.',
    };
  }

  if (fpUsed) {
    await logAntiCheat(pool, {
      ip_address,
      fingerprint,
      action: 'REFERRAL_BLOCKED',
      detection_reason: 'FINGERPRINT_ALREADY_USED_LIFETIME',
      is_suspicious: true,
    });

    return {
      valid: false,
      reason: 'DEVICE_ALREADY_USED',
      message: 'This device has already been used for a referral.',
    };
  }

  // === LAYER 2: Verdächtigkeits-Scoring ===

  let suspicionScore = 0;
  let reasons = [];

  // Prüfe ob Account sehr neu ist
  const accountCheck = await pool.request().input('jid', sql.Int, referred_jid).query(`
      SELECT 
        DATEDIFF(SECOND, RegDate, GETDATE()) as account_age_seconds,
        (SELECT COUNT(*) FROM SK_Char WHERE UserJID = @jid) as char_count
      FROM TB_User 
      WHERE JID = @jid
    `);

  if (accountCheck.recordset.length > 0) {
    const accountAge = accountCheck.recordset[0].account_age_seconds;
    const charCount = accountCheck.recordset[0].char_count;

    // Account jünger als 1 Stunde
    if (accountAge < 3600) {
      suspicionScore += 30;
      reasons.push('VERY_NEW_ACCOUNT');
    }

    // Keine Charaktere erstellt
    if (charCount === 0) {
      suspicionScore += 20;
      reasons.push('NO_CHARACTERS');
    }
  }

  // Prüfe IP-Reputation (optional: VPN-Datenbank)
  // const isVPN = await checkVPNDatabase(ip_address);
  // if (isVPN) {
  //   suspicionScore += 40;
  //   reasons.push('VPN_DETECTED');
  // }

  // === ENTSCHEIDUNG: Review erforderlich? ===

  if (suspicionScore >= 50 && settings.suspicious_referral_review_required === 'true') {
    await logAntiCheat(pool, {
      ip_address,
      fingerprint,
      action: 'REFERRAL_FLAGGED',
      detection_reason: reasons.join(', '),
      is_suspicious: true,
    });

    return {
      valid: false,
      reason: 'REQUIRES_ADMIN_REVIEW',
      message: 'Your referral requires manual review by an administrator.',
      suspicionScore,
      reasons,
    };
  }

  // === Alles OK ===

  await logAntiCheat(pool, {
    ip_address,
    fingerprint,
    action: 'REFERRAL_ACCEPTED',
    detection_reason: null,
    is_suspicious: false,
  });

  return {
    valid: true,
    suspicionScore,
    reasons,
  };
}

// Helper: Log Anti-Cheat Events
async function logAntiCheat(pool, data) {
  await pool
    .request()
    .input('ip', sql.NVarChar, data.ip_address)
    .input('fp', sql.NVarChar, data.fingerprint || null)
    .input('action', sql.NVarChar, data.action)
    .input('reason', sql.NVarChar, data.detection_reason || null)
    .input('suspicious', sql.Bit, data.is_suspicious).query(`
      INSERT INTO referral_anticheat_logs 
      (ip_address, fingerprint, action, detection_reason, is_suspicious, created_at)
      VALUES (@ip, @fp, @action, @reason, @suspicious, GETDATE())
    `);
}

// Helper: Lade Anti-Cheat Einstellungen
async function loadAntiCheatSettings(pool) {
  const result = await pool.request().query(`
    SELECT setting_key, setting_value 
    FROM referral_settings 
    WHERE setting_key LIKE '%anticheat%' 
       OR setting_key LIKE '%block%'
       OR setting_key LIKE '%max_referrals%'
  `);

  const settings = {};
  result.recordset.forEach((row) => {
    settings[row.setting_key] = row.setting_value;
  });

  return settings;
}
```

---

## 🔐 Zusätzliche Sicherheitsmaßnahmen

### 1. VPN-Datenbank Integration

```javascript
// Optional: IPHub, IPQualityScore, oder IP2Location API
async function checkVPNDatabase(ip) {
  try {
    const response = await fetch(`https://v2.api.iphub.info/ip/${ip}`, {
      headers: { 'X-Key': process.env.IPHUB_API_KEY },
    });
    const data = await response.json();
    return data.block === 1; // 1 = VPN/Proxy detected
  } catch (error) {
    console.error('VPN check failed:', error);
    return false; // Bei Fehler nicht blockieren
  }
}
```

### 2. Email-Verifizierung erforderlich

```javascript
// Referral wird erst aktiv nach Email-Bestätigung
if (!invitedAccount.email_verified) {
  return { valid: false, reason: 'EMAIL_VERIFICATION_REQUIRED' };
}
```

### 3. Mindest-Spielzeit erforderlich

```javascript
// Account muss mindestens 2 Stunden gespielt haben
const playtimeQuery = await pool.request().input('jid', sql.Int, referred_jid).query(`
    SELECT SUM(DATEDIFF(MINUTE, StartTime, EndTime)) as total_minutes
    FROM user_sessions
    WHERE user_jid = @jid
  `);

const playtime = playtimeQuery.recordset[0]?.total_minutes || 0;

if (playtime < 120) {
  // 2 Stunden
  return { valid: false, reason: 'INSUFFICIENT_PLAYTIME' };
}
```

### 4. Character-Level erforderlich

```javascript
// Mindestens ein Char mit Level 20+
const charQuery = await pool.request().input('jid', sql.Int, referred_jid).query(`
    SELECT MAX(CurLevel) as max_level
    FROM SK_Char
    WHERE UserJID = @jid
  `);

const maxLevel = charQuery.recordset[0]?.max_level || 0;

if (maxLevel < 20) {
  return { valid: false, reason: 'CHARACTER_LEVEL_TOO_LOW' };
}
```

---

## 📊 Effektivität der Maßnahmen

| Umgehungsversuch       | IP-Check | FP-Check | Verdacht-Score | Email | Spielzeit | Char-Level |
| ---------------------- | -------- | -------- | -------------- | ----- | --------- | ---------- |
| **VPN**                | ❌       | ✅       | ✅             | ✅    | ✅        | ✅         |
| **Browser-Wechsel**    | ✅       | ❌       | ✅             | ✅    | ✅        | ✅         |
| **Cache löschen**      | ✅       | ❌       | ✅             | ✅    | ✅        | ✅         |
| **VPN + Browser**      | ❌       | ❌       | ✅             | ✅    | ✅        | ✅         |
| **Multi-Account Farm** | ⚠️       | ⚠️       | ⚠️             | ❌    | ✅        | ✅         |

**Legende:**

- ✅ = Effektiv blockiert
- ⚠️ = Teilweise effektiv
- ❌ = Kann umgangen werden

---

## 🎯 Empfohlene Konfiguration

### Für **maximale Sicherheit** (strikt):

```javascript
{
  anticheat_enabled: true,
  max_referrals_per_ip_lifetime: 1,
  max_referrals_per_fingerprint_lifetime: 1,
  block_duplicate_ip_completely: true,
  block_duplicate_fingerprint_referrals: true,
  suspicious_referral_review_required: true,

  // Zusätzlich:
  require_email_verification: true,
  minimum_playtime_minutes: 120,  // 2 Stunden
  minimum_character_level: 20
}
```

### Für **Balance** (empfohlen):

```javascript
{
  anticheat_enabled: true,
  max_referrals_per_ip_lifetime: 2,  // Erlaubt 2 Personen im gleichen Haushalt
  max_referrals_per_fingerprint_lifetime: 1,
  block_duplicate_ip_completely: false,  // Nur warnen, nicht blockieren
  suspicious_referral_review_required: true,

  // Zusätzlich:
  require_email_verification: true,
  minimum_playtime_minutes: 60,  // 1 Stunde
  minimum_character_level: 10
}
```

### Für **Benutzerfreundlichkeit** (locker):

```javascript
{
  anticheat_enabled: true,
  max_referrals_per_ip_lifetime: 5,
  max_referrals_per_fingerprint_lifetime: 3,
  block_duplicate_ip_completely: false,
  suspicious_referral_review_required: false,

  // Nur Basis-Checks
  require_email_verification: true
}
```

---

## 🚀 Nächste Schritte

1. **Implementiere die Validierungsfunktion** (siehe Code oben)
2. **Teste verschiedene Szenarien** (VPN, Browser-Wechsel, etc.)
3. **Überwache `referral_anticheat_logs`** Tabelle für verdächtige Aktivitäten
4. **Passe Einstellungen an** basierend auf echten Daten

**Fazit:** Die Kombination aus IP + Fingerprint + Account-Aktivität (Spielzeit, Level) ist der beste Schutz gegen Missbrauch!
