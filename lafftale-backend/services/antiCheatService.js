const { pool, sql } = require('../db');

/**
 * Umfassende Anti-Cheat Validierung für Referral-System (alle 8 Layer)
 * @param {string} referralCode - Der zu validierenden Referral-Code
 * @param {string} clientIP - Die echte Client-IP (bereits durch ipHelper verarbeitet)
 * @param {string} fingerprint - Browser-Fingerprint
 * @param {object} additionalData - Zusätzliche Daten (mouseMovements, scrollEvents, etc.)
 * @returns {object} Validierungsergebnis
 */
async function validateReferralAntiCheat(referralCode, clientIP, fingerprint, additionalData = {}) {
  try {
    console.log(`🛡️ Anti-Cheat Validierung für Referral-Code: ${referralCode}`);

    // Referrer finden
    const referrerResult = await pool
      .request()
      .input('code', sql.NVarChar, referralCode)
      .query('SELECT jid FROM referrals WHERE code = @code');

    if (referrerResult.recordset.length === 0) {
      return {
        valid: false,
        reason: 'INVALID_REFERRAL_CODE',
        userMessage: 'Der eingegebene Referral-Code ist ungültig.',
        referrerJid: null,
        suspicionReasons: ['Referral code does not exist'],
      };
    }

    const referrerJid = referrerResult.recordset[0].jid;

    // Anti-Cheat Einstellungen laden
    const settingsResult = await pool.request().query(`
      SELECT setting_key, setting_value 
      FROM referral_settings 
      WHERE setting_key IN (
        'anticheat_enabled',
        'max_referrals_per_ip_lifetime',
        'max_referrals_per_fingerprint_lifetime',
        'block_duplicate_ip_completely',
        'block_duplicate_fingerprint_referrals',
        'pattern_detection_enabled',
        'max_registrations_per_hour',
        'min_form_fill_time_seconds',
        'rapid_fire_window_minutes',
        'honeypot_traps_enabled',
        'honeypot_field_names',
        'behavioral_analysis_enabled',
        'behavioral_similarity_threshold',
        'mouse_movement_required',
        'behavioral_min_events',
        'network_analysis_enabled',
        'block_vpn_registrations',
        'block_hosting_ips',
        'timezone_mismatch_suspicious',
        'vpn_confidence_threshold'
      )
    `);

    const settings = {};
    settingsResult.recordset.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    const antiCheatEnabled = settings.anticheat_enabled === 'true';

    if (!antiCheatEnabled) {
      console.log('ℹ️ Anti-Cheat deaktiviert - Referral wird ohne Prüfung akzeptiert');
      return {
        valid: true,
        reason: null,
        userMessage: null,
        referrerJid: referrerJid,
        suspicionReasons: [],
      };
    }

    console.log('🛡️ Anti-Cheat aktiviert - Führe ALLE 8 Layer durch...');

    let isValid = true;
    let cheatReason = '';
    let suspicionReasons = [];
    let userMessage = null;

    // ===================================================================
    // LAYER 1: STRIKTE IP-PRÜFUNG (LIFETIME - GLOBAL)
    // ===================================================================
    const maxIpLifetime = parseInt(settings.max_referrals_per_ip_lifetime) || 1;
    const blockIpCompletely = settings.block_duplicate_ip_completely === 'true';

    if (blockIpCompletely) {
      const ipLifetimeCheck = await pool.request().input('client_ip', sql.NVarChar, clientIP)
        .query(`
          SELECT COUNT(*) as count 
          FROM referrals 
          WHERE ip_address = @client_ip 
          AND invited_jid IS NOT NULL
          AND is_valid = 1
        `);

      const ipUsageCount = ipLifetimeCheck.recordset[0].count;

      if (ipUsageCount >= maxIpLifetime) {
        isValid = false;
        cheatReason = 'IP_ALREADY_USED_LIFETIME';
        userMessage =
          'Von dieser IP-Adresse wurde bereits ein Account mit einem Referral-Code erstellt.';
        suspicionReasons.push(`IP has been used ${ipUsageCount} time(s) (max: ${maxIpLifetime})`);
        console.log(
          `❌ Layer 1: IP ${clientIP} bereits ${ipUsageCount}x verwendet (Limit: ${maxIpLifetime})`
        );
      }
    }

    // ===================================================================
    // LAYER 2: STRIKTE FINGERPRINT-PRÜFUNG (LIFETIME - GLOBAL)
    // ===================================================================
    if (isValid) {
      const maxFingerprintLifetime = parseInt(settings.max_referrals_per_fingerprint_lifetime) || 1;
      const blockFingerprintDuplicates = settings.block_duplicate_fingerprint_referrals === 'true';

      if (blockFingerprintDuplicates && fingerprint) {
        const fingerprintLifetimeCheck = await pool
          .request()
          .input('client_fingerprint', sql.NVarChar, fingerprint).query(`
            SELECT COUNT(*) as count 
            FROM referrals 
            WHERE fingerprint = @client_fingerprint 
            AND invited_jid IS NOT NULL
            AND is_valid = 1
          `);

        const fingerprintUsageCount = fingerprintLifetimeCheck.recordset[0].count;

        if (fingerprintUsageCount >= maxFingerprintLifetime) {
          isValid = false;
          cheatReason = 'FINGERPRINT_ALREADY_USED_LIFETIME';
          userMessage =
            'Von diesem Browser wurde bereits ein Account mit einem Referral-Code erstellt.';
          suspicionReasons.push(
            `Fingerprint has been used ${fingerprintUsageCount} time(s) (max: ${maxFingerprintLifetime})`
          );
          console.log(
            `❌ Layer 2: Fingerprint bereits ${fingerprintUsageCount}x verwendet (Limit: ${maxFingerprintLifetime})`
          );
        }
      }
    }

    // ===================================================================
    // LAYER 3: GLEICHER REFERRER MEHRFACH-PRÜFUNG
    // ===================================================================
    if (isValid) {
      const sameReferrerCheck = await pool
        .request()
        .input('referrer_jid', sql.BigInt, referrerJid)
        .input('client_ip', sql.NVarChar, clientIP)
        .input('client_fingerprint', sql.NVarChar, fingerprint).query(`
          SELECT COUNT(*) as count 
          FROM referrals 
          WHERE jid = @referrer_jid 
          AND (ip_address = @client_ip OR fingerprint = @client_fingerprint)
        `);

      if (sameReferrerCheck.recordset[0].count > 0) {
        isValid = false;
        cheatReason = 'SAME_USER_MULTIPLE_ACCOUNTS';
        userMessage = 'Sie haben bereits einen Account mit diesem Referral-Code erstellt.';
        suspicionReasons.push('Same IP or Fingerprint used by same referrer before');
        console.log(
          '❌ Layer 3: Gleicher Benutzer versucht mehrere Referrals beim selben Referrer'
        );
      }
    }

    // ===================================================================
    // LAYER 4: PATTERN DETECTION (Rapid-Fire & Timing)
    // ===================================================================
    if (isValid && settings.pattern_detection_enabled === 'true') {
      const maxPerHour = parseInt(settings.max_registrations_per_hour) || 3;
      const rapidFireWindow = parseInt(settings.rapid_fire_window_minutes) || 5;

      const rapidFireCheck = await pool
        .request()
        .input('client_ip', sql.NVarChar, clientIP)
        .input('window_minutes', sql.Int, rapidFireWindow).query(`
          SELECT COUNT(*) as count 
          FROM referral_anticheat_logs 
          WHERE ip_address = @client_ip 
          AND created_at >= DATEADD(minute, -@window_minutes, GETDATE())
        `);

      if (rapidFireCheck.recordset[0].count >= maxPerHour) {
        isValid = false;
        cheatReason = 'RAPID_FIRE_REGISTRATION';
        userMessage =
          'Zu viele Registrierungsversuche in kurzer Zeit. Bitte warten Sie einige Minuten.';
        suspicionReasons.push(
          `${rapidFireCheck.recordset[0].count} registrations in ${rapidFireWindow} minutes`
        );
        console.log(
          `❌ Layer 4: Rapid-fire detection - ${rapidFireCheck.recordset[0].count} attempts in ${rapidFireWindow}min`
        );
      }

      // Check form fill time if provided
      const formFillTime = additionalData.formFillTime;
      const minFillTime = parseInt(settings.min_form_fill_time_seconds) || 3;

      if (formFillTime && formFillTime < minFillTime * 1000) {
        isValid = false;
        cheatReason = 'FORM_FILLED_TOO_FAST';
        userMessage = 'Das Formular wurde zu schnell ausgefüllt. Bitte nehmen Sie sich mehr Zeit.';
        suspicionReasons.push(`Form filled in ${formFillTime}ms (min: ${minFillTime * 1000}ms)`);
        console.log(`❌ Layer 4: Form filled too fast - ${formFillTime}ms`);
      }
    }

    // ===================================================================
    // LAYER 5: HONEYPOT TRAPS (Bot Detection)
    // ===================================================================
    if (isValid && settings.honeypot_traps_enabled === 'true') {
      const honeypotFields = (
        settings.honeypot_field_names || 'phone,address,website,company'
      ).split(',');

      for (const field of honeypotFields) {
        if (additionalData[field.trim()]) {
          isValid = false;
          cheatReason = 'HONEYPOT_FIELD_FILLED';
          userMessage = 'Ungültige Registrierung erkannt. Bitte versuchen Sie es erneut.';
          suspicionReasons.push(`Honeypot field '${field.trim()}' was filled`);
          console.log(`❌ Layer 5: Honeypot triggered - field '${field.trim()}' filled`);
          break;
        }
      }
    }

    // ===================================================================
    // LAYER 6: BEHAVIORAL ANALYSIS (Mouse & Scroll Patterns)
    // ===================================================================
    if (isValid && settings.behavioral_analysis_enabled === 'true') {
      const mouseMovements = additionalData.mouseMovements;
      const scrollEvents = additionalData.scrollEvents;
      const minEvents = parseInt(settings.behavioral_min_events) || 5;

      if (settings.mouse_movement_required === 'true' && (!mouseMovements || !scrollEvents)) {
        isValid = false;
        cheatReason = 'MISSING_BEHAVIORAL_DATA';
        userMessage = 'Ungewöhnliches Benutzerverhalten erkannt. Bitte versuchen Sie es erneut.';
        suspicionReasons.push('Required mouse/scroll data missing');
        console.log('❌ Layer 6: Missing required behavioral data');
      } else if (mouseMovements && Array.isArray(mouseMovements)) {
        if (mouseMovements.length < minEvents) {
          suspicionReasons.push(`Only ${mouseMovements.length} mouse events (min: ${minEvents})`);
        }

        // Check for robotic patterns
        if (mouseMovements.length > 0) {
          const perfectLines = mouseMovements.filter((m, i) => {
            if (i === 0) return false;
            const prev = mouseMovements[i - 1];
            const deltaX = Math.abs(m.x - prev.x);
            const deltaY = Math.abs(m.y - prev.y);
            return deltaX === 0 || deltaY === 0;
          });

          if (perfectLines.length > mouseMovements.length * 0.8) {
            isValid = false;
            cheatReason = 'ROBOTIC_MOUSE_PATTERN';
            userMessage =
              'Automatisiertes Verhalten erkannt. Bitte verwenden Sie die Seite manuell.';
            suspicionReasons.push(
              `${perfectLines.length}/${mouseMovements.length} perfect line movements (robotic)`
            );
            console.log('❌ Layer 6: Robotic mouse pattern detected');
          }
        }
      }
    }

    // ===================================================================
    // LAYER 7: NETWORK ANALYSIS (VPN/Proxy/Hosting Detection)
    // ===================================================================
    if (isValid && settings.network_analysis_enabled === 'true') {
      // Check against known VPN IPs
      try {
        const vpnCheck = await pool.request().input('client_ip', sql.NVarChar, clientIP).query(`
            SELECT provider, confidence 
            FROM known_vpn_ips 
            WHERE ip_address = @client_ip AND is_active = 1
          `);

        if (vpnCheck.recordset.length > 0) {
          const vpnInfo = vpnCheck.recordset[0];
          const vpnThreshold = parseFloat(settings.vpn_confidence_threshold) || 0.8;

          if (vpnInfo.confidence >= vpnThreshold && settings.block_vpn_registrations === 'true') {
            isValid = false;
            cheatReason = 'VPN_IP_DETECTED';
            userMessage =
              'VPN- oder Proxy-Verbindungen sind nicht erlaubt. Bitte verwenden Sie eine direkte Internetverbindung.';
            suspicionReasons.push(
              `VPN detected: ${vpnInfo.provider} (${vpnInfo.confidence} confidence)`
            );
            console.log(
              `❌ Layer 7: VPN detected - ${vpnInfo.provider} (${vpnInfo.confidence} confidence)`
            );
          }
        }
      } catch (vpnError) {
        console.log('⚠️ Layer 7: VPN check skipped (table not available)');
      }

      // Check for hosting/datacenter IPs
      const hostingPatterns = [/^45\./, /^144\./, /^185\.220\./, /^139\.99\./];
      if (hostingPatterns.some((pattern) => pattern.test(clientIP))) {
        suspicionReasons.push('IP matches hosting/datacenter pattern');

        if (settings.block_hosting_ips === 'true') {
          isValid = false;
          cheatReason = 'HOSTING_IP_DETECTED';
          userMessage = 'Registrierung von Server- oder Datacenter-IPs ist nicht erlaubt.';
          console.log(`❌ Layer 7: Hosting IP detected - ${clientIP}`);
        }
      }
    }

    // ===================================================================
    // LAYER 8: ENHANCED LOGGING & CONFIDENCE SCORE
    // ===================================================================
    const totalLayers = 8;
    let layersPassed = 0;
    if (isValid) {
      layersPassed = totalLayers;
    } else {
      // Count which layers were passed before failure
      if (!cheatReason.includes('IP_ALREADY_USED')) layersPassed++;
      if (!cheatReason.includes('FINGERPRINT_ALREADY_USED')) layersPassed++;
      if (!cheatReason.includes('SAME_USER_MULTIPLE')) layersPassed++;
      if (!cheatReason.includes('RAPID_FIRE') && !cheatReason.includes('FORM_FILLED_TOO_FAST'))
        layersPassed++;
      if (!cheatReason.includes('HONEYPOT')) layersPassed++;
      if (!cheatReason.includes('ROBOTIC') && !cheatReason.includes('BEHAVIORAL')) layersPassed++;
      if (!cheatReason.includes('VPN') && !cheatReason.includes('HOSTING')) layersPassed++;
    }

    const confidenceScore = layersPassed / totalLayers;

    if (isValid) {
      console.log('✅ Anti-Cheat: Alle 8 Layer bestanden');
    } else {
      console.log(`❌ Anti-Cheat: Blockiert - ${cheatReason}`);
    }

    return {
      valid: isValid,
      reason: cheatReason || null,
      userMessage: userMessage,
      referrerJid: referrerJid,
      suspicionReasons: suspicionReasons,
      confidenceScore: confidenceScore,
      layersPassed: layersPassed,
      totalLayers: totalLayers,
    };
  } catch (error) {
    console.error('❌ Anti-Cheat Validierung fehlgeschlagen:', error);
    return {
      valid: false,
      reason: 'ANTICHEAT_ERROR',
      userMessage: 'Ein technischer Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      referrerJid: null,
      suspicionReasons: [error.message],
      confidenceScore: 0,
      layersPassed: 0,
      totalLayers: 8,
    };
  }
}

module.exports = {
  validateReferralAntiCheat,
};
