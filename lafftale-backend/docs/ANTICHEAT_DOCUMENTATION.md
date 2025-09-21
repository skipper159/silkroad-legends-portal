# Anti-Cheat System für Referral-Programm

## Übersicht

Das Anti-Cheat System basiert auf der bewährten SRO-CMS Implementierung und verhindert Missbrauch des Referral-Systems durch Multi-Account-Erstellung, IP-Spoofing und andere betrügerische Aktivitäten.

## Funktionen

### 1. Browser-Fingerprinting

- **Frontend**: FingerprintJS v3 Integration für eindeutige Browser-Identifikation
- **Fallback**: Eigene Fingerprint-Generierung bei FingerprintJS-Fehlern
- **Erforderlich**: Fingerprint ist Pflichtfeld bei Registrierung

### 2. IP-Adress Tracking

- **Automatisch**: IP-Adresse wird bei jeder Registrierung erfasst
- **Validierung**: Prüfung auf doppelte IPs beim gleichen Referrer
- **Rate Limiting**: Max. 5 Registrierungen pro IP pro Tag

### 3. Anti-Cheat Validierung

- **Doppelte IP**: Blockiert wenn gleiche IP bereits beim Referrer verwendet
- **Doppelter Fingerprint**: Blockiert wenn gleicher Browser bereits beim Referrer verwendet
- **Rate Limits**: Verhindert Spam-Registrierungen
- **Automatische Bewertung**: Verdächtige Referrals werden automatisch markiert

## Technische Implementierung

### Frontend (Register.tsx)

```typescript
// Browser-Fingerprinting Hook
const { fingerprint, isLoading: fingerprintLoading } = useFingerprint();

// Anti-Cheat Status Anzeige
<div className='mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg'>
  <div className='flex items-center space-x-2'>
    {fingerprintLoading ? (
      // Loading-Status
    ) : fingerprint ? (
      // Aktiv-Status
    ) : (
      // Fehler-Status
    )}
  </div>
</div>

// Fingerprint wird an Backend gesendet
const requestBody = {
  username,
  email,
  password,
  fingerprint,
  referralCode
};
```

### Backend (authController.js)

```javascript
// Anti-Cheat Validierung bei Registrierung
const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';

// Fingerprint Pflichtfeld
if (!fingerprint) {
  return res.status(400).send('Anti-cheat fingerprint is required');
}

// Validierungslogik
let isValidReferral = true;
let cheatReason = '';

// IP-Duplikat Prüfung
const ipCheckResult = await pool
  .request()
  .input('referrer_jid', sql.BigInt, referrerJid)
  .input('client_ip', sql.NVarChar, clientIP)
  .query(
    'SELECT COUNT(*) as count FROM referrals WHERE jid = @referrer_jid AND ip_address = @client_ip'
  );

if (ipCheckResult.recordset[0].count > 0) {
  isValidReferral = false;
  cheatReason = 'IP_DUPLICATE';
}

// Fingerprint-Duplikat Prüfung
const fingerprintCheckResult = await pool
  .request()
  .input('referrer_jid', sql.BigInt, referrerJid)
  .input('client_fingerprint', sql.NVarChar, fingerprint)
  .query(
    'SELECT COUNT(*) as count FROM referrals WHERE jid = @referrer_jid AND fingerprint = @client_fingerprint'
  );

if (fingerprintCheckResult.recordset[0].count > 0) {
  isValidReferral = false;
  cheatReason = 'FINGERPRINT_DUPLICATE';
}

// Rate Limiting (5 pro IP pro Tag)
const rateLimitResult = await pool
  .request()
  .input('client_ip', sql.NVarChar, clientIP)
  .input('today', sql.DateTime, new Date(new Date().setHours(0, 0, 0, 0)))
  .query(
    'SELECT COUNT(*) as count FROM referrals WHERE ip_address = @client_ip AND created_at >= @today'
  );

if (rateLimitResult.recordset[0].count >= 5) {
  isValidReferral = false;
  cheatReason = 'RATE_LIMIT_IP';
}
```

### Datenbank Schema

```sql
-- Erweiterte referrals Tabelle
ALTER TABLE referrals ADD ip_address NVARCHAR(45) NULL;
ALTER TABLE referrals ADD fingerprint NVARCHAR(255) NULL;
ALTER TABLE referrals ADD is_valid BIT DEFAULT 1;
ALTER TABLE referrals ADD cheat_reason NVARCHAR(100) NULL;

-- Anti-Cheat Monitoring
CREATE TABLE referral_anticheat_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NULL,
    ip_address NVARCHAR(45) NOT NULL,
    fingerprint NVARCHAR(255) NULL,
    action NVARCHAR(50) NOT NULL,
    referral_code NVARCHAR(50) NULL,
    is_suspicious BIT DEFAULT 0,
    detection_reason NVARCHAR(255) NULL,
    user_agent NVARCHAR(500) NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Performance Indizes
CREATE INDEX IX_referrals_ip_address ON referrals (ip_address);
CREATE INDEX IX_referrals_fingerprint ON referrals (fingerprint);
CREATE INDEX IX_referrals_created_at ON referrals (created_at);
CREATE INDEX IX_referrals_jid_valid ON referrals (jid, is_valid);
```

### Admin Interface (ReferralManager.tsx)

```typescript
// Neuer Anti-Cheat Tab
const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'rewards' | 'anticheat'>(
  'overview'
);

// Anti-Cheat Daten
const [antiCheatStats, setAntiCheatStats] = useState<AntiCheatStats | null>(null);
const [suspiciousReferrals, setSuspiciousReferrals] = useState<SuspiciousReferral[]>([]);

// Verdächtige Referrals manuell validieren
const validateSuspiciousReferral = async (
  referralId: number,
  isValid: boolean,
  adminNotes?: string
) => {
  const response = await fetchWithAuth(
    `${weburl}/api/admin/referrals/anticheat/validate/${referralId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_valid: isValid, admin_notes: adminNotes }),
    }
  );
};
```

## API Endpoints

### Admin Anti-Cheat Endpoints

- `GET /api/admin/referrals/anticheat/suspicious` - Verdächtige Referrals abrufen
- `GET /api/admin/referrals/anticheat/stats` - Anti-Cheat Statistiken
- `POST /api/admin/referrals/anticheat/validate/:id` - Referral manuell validieren

### Erweiterte Referral Endpoints

- `GET /api/admin/referrals?includeAnticheat=true` - Referrals mit Anti-Cheat Daten

## Cheat-Erkennungstypen

1. **IP_DUPLICATE**: Gleiche IP-Adresse bereits beim Referrer verwendet
2. **FINGERPRINT_DUPLICATE**: Gleicher Browser-Fingerprint bereits beim Referrer verwendet
3. **RATE_LIMIT_IP**: Zu viele Registrierungen von einer IP-Adresse
4. **ANTICHEAT_ERROR**: Fehler im Anti-Cheat System

## Monitoring & Statistiken

### Verfügbare Metriken

- Gesamte Referrals vs. blockierte Referrals
- Block-Rate in Prozent
- Top verdächtige IP-Adressen
- Häufigste Cheat-Gründe
- Tägliche Trends

### Views für Analyse

- `v_suspicious_referrals` - Alle verdächtigen Referrals mit Kontext
- `v_ip_referral_stats` - IP-basierte Statistiken
- `v_fingerprint_referral_stats` - Fingerprint-basierte Statistiken
- `v_daily_anticheat_stats` - Tägliche Anti-Cheat Übersicht

## Konfiguration

### Anti-Cheat Einstellungen

```sql
INSERT INTO referral_settings VALUES
('anticheat_enabled', 'true', 'Enable anti-cheat protection'),
('max_referrals_per_ip_per_day', '5', 'Max referrals per IP per day'),
('max_referrals_per_fingerprint_per_day', '3', 'Max referrals per fingerprint per day'),
('block_duplicate_ip_referrals', 'true', 'Block duplicate IP referrals'),
('block_duplicate_fingerprint_referrals', 'true', 'Block duplicate fingerprint referrals'),
('suspicious_referral_review_required', 'true', 'Require manual review for suspicious referrals');
```

## Installation & Setup

1. **Datenbank**: Führe `referral_anticheat_schema.sql` und `referral_anticheat_views.sql` aus
2. **Backend**: Anti-Cheat Logik ist bereits in `authController.js` integriert
3. **Frontend**: FingerprintJS Hook ist in `useFingerprint.ts` verfügbar
4. **Admin**: Anti-Cheat Tab ist im `ReferralManager.tsx` verfügbar

## Sicherheitshinweise

- **Fingerprints sind nicht 100% eindeutig** - Kombination mit IP-Tracking erhöht Genauigkeit
- **Rate Limiting** verhindert Brute-Force-Angriffe
- **Manuelle Validierung** durch Admins als finale Kontrollebene
- **Logging** aller verdächtigen Aktivitäten für forensische Analyse

## Kompatibilität

Basiert auf SRO-CMS Standards und ist kompatibel mit:

- FingerprintJS v3
- SQL Server 2016+
- React 18+
- Express.js 4+

Das System bietet umfassenden Schutz vor den häufigsten Referral-Missbrauchsformen und ermöglicht gleichzeitig legitimen Nutzern eine reibungslose Registrierung.
