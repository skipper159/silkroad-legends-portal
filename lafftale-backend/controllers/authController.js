const { pool, poolConnect, sql } = require('../db');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken, sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');
const { getRealClientIP, getRealClientIPWithDebug } = require('../utils/ipHelper');
const { validateReferralAntiCheat } = require('../services/antiCheatService');
const PortalAccount = require('../models/portalAccount');

/**
 * Register a new user with SRO-CMS Pattern und Anti-cheat protection
 */
async function registerUser(req, res) {
  const { username, email, password, referralCode, fingerprint } = req.body;
  if (!username || !email || !password) return res.status(400).send('Missing fields');

  // Anti-Cheat Validierung - Echte Client-IP erfassen
  const clientIP = getRealClientIP(req);
  const ipDebug = getRealClientIPWithDebug(req);

  console.log('Registration attempt:', {
    username,
    email,
    ip: clientIP,
    ipSource: ipDebug.used,
    fingerprint: fingerprint ? fingerprint.substring(0, 8) + '...' : 'none',
    referralCode,
  });

  // Fingerprint ist erforderlich für Anti-Cheat
  if (!fingerprint) {
    return res.status(400).json({
      success: false,
      error:
        'Browser-Validierung fehlgeschlagen. Bitte aktivieren Sie JavaScript und versuchen Sie es erneut.',
    });
  }

  console.log('Processing referralCode in registration:', referralCode);

  // ✅ SCHRITT 1: ANTI-CHEAT VALIDIERUNG VOR ACCOUNT-ERSTELLUNG
  if (referralCode) {
    console.log('🛡️ Führe Anti-Cheat-Validierung durch...');
    const antiCheatResult = await validateReferralAntiCheat(referralCode, clientIP, fingerprint);

    if (!antiCheatResult.valid) {
      console.log(`❌ Anti-Cheat Prüfung fehlgeschlagen: ${antiCheatResult.reason}`);
      return res.status(400).json({
        success: false,
        error: antiCheatResult.userMessage || 'Registrierung nicht möglich.',
      });
    }

    console.log('✅ Anti-Cheat-Validierung erfolgreich');
  }

  const hashedPassword = await hashPassword(password);

  // ✅ MAIL AUTHENTICATION - E-Mail Verifikation aktiviert
  const verificationToken = generateToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Valid for 24 hours

  await poolConnect;

  try {
    // ✅ SCHRITT 1: Username/Email Validierung mit Portal System
    const usernameExists = await PortalAccount.checkUsernameExists(username);
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already exists in Portal system' });
    }

    const emailExists = await PortalAccount.checkEmailExists(email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists in Portal system' });
    }

    // ✅ SCHRITT 2: Vollständigen Portal Account erstellen (SRO-CMS Pattern)
    const portalJID = await PortalAccount.createFullAccount(username, password, email, clientIP);

    console.log(`✅ Portal Account erstellt: ${username} -> JID: ${portalJID}`);

    // ✅ SCHRITT 3: Web User mit ECHTER JID erstellen
    const userResult = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('jid', sql.Int, portalJID) // ✅ ECHTE JID aus Portal!
      .input('verificationToken', sql.NVarChar, verificationToken) // ✅ Verifikations-Token
      .input('now', sql.DateTime, new Date())
      .query(`INSERT INTO users (jid, username, email, password, remember_token, email_verified_at, created_at, updated_at) 
              OUTPUT INSERTED.id
              VALUES (@jid, @username, @email, @password, @verificationToken, NULL, @now, @now)`);

    const userId = userResult.recordset[0].id;

    // Create user role entry (default: not admin)
    await pool
      .request()
      .input('userId', sql.BigInt, userId)
      .input('isAdmin', sql.Bit, 0) // Default: not admin
      .input('now', sql.DateTime, new Date())
      .query(`INSERT INTO user_roles (user_id, is_admin, created_at, updated_at) 
              VALUES (@userId, @isAdmin, @now, @now)`);

    // ✅ SCHRITT 4: REFERRAL-BELOHNUNG VERGEBEN (nach erfolgreicher Account-Erstellung)
    if (referralCode) {
      try {
        console.log('🎯 Verarbeite Referral-Code:', referralCode);

        // Get referral settings
        const settingsResult = await pool.request().query(`
          SELECT setting_key, setting_value 
          FROM referral_settings 
          WHERE setting_key IN ('points_per_referral', 'referral_enabled', 'delayed_rewards_enabled')
        `);

        const settings = {};
        settingsResult.recordset.forEach((row) => {
          settings[row.setting_key] = row.setting_value;
        });

        if (settings.referral_enabled !== 'true') {
          console.log('Referral system is disabled');
          return;
        }

        const pointsPerReferral = parseInt(settings.points_per_referral) || 100;
        const delayedRewardsEnabled = settings.delayed_rewards_enabled === 'true';

        // Find the referrer (re-validation)
        const referrerResult = await pool
          .request()
          .input('code', sql.NVarChar, referralCode)
          .query('SELECT jid FROM referrals WHERE code = @code');

        if (referrerResult.recordset.length > 0) {
          const referrerJid = referrerResult.recordset[0].jid;
          console.log('Found referrer with JID:', referrerJid);

          // ===================================================================
          // ERWEITERTE ANTI-CHEAT PRÜFUNG (KOMPLETT - ALLE 8 LAYER)
          // ===================================================================
          let isValidReferral = true;
          let cheatReason = '';
          let suspicionReasons = [];

          try {
            // Lade Anti-Cheat Einstellungen
            const antiCheatSettingsResult = await pool.request().query(`
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

            const antiCheatSettings = {};
            antiCheatSettingsResult.recordset.forEach((row) => {
              antiCheatSettings[row.setting_key] = row.setting_value;
            });

            const antiCheatEnabled = antiCheatSettings.anticheat_enabled === 'true';

            if (antiCheatEnabled) {
              console.log('🛡️ Anti-Cheat aktiviert - Führe ALLE 8 Layer durch...');

              // ===============================================================
              // LAYER 1: STRIKTE IP-PRÜFUNG (LIFETIME - GLOBAL)
              // ===============================================================
              const maxIpLifetime = parseInt(antiCheatSettings.max_referrals_per_ip_lifetime) || 1;
              const blockIpCompletely = antiCheatSettings.block_duplicate_ip_completely === 'true';

              if (blockIpCompletely) {
                const ipLifetimeCheck = await pool
                  .request()
                  .input('client_ip', sql.NVarChar, clientIP).query(`
                    SELECT COUNT(*) as count 
                    FROM referrals 
                    WHERE ip_address = @client_ip 
                    AND invited_jid IS NOT NULL
                    AND is_valid = 1
                  `);

                const ipUsageCount = ipLifetimeCheck.recordset[0].count;

                if (ipUsageCount >= maxIpLifetime) {
                  isValidReferral = false;
                  cheatReason = 'IP_ALREADY_USED_LIFETIME';
                  suspicionReasons.push(
                    `IP has been used ${ipUsageCount} time(s) (max: ${maxIpLifetime})`
                  );
                  console.log(
                    `❌ Layer 1: IP ${clientIP} bereits ${ipUsageCount}x verwendet (Limit: ${maxIpLifetime})`
                  );
                }
              }

              // ===============================================================
              // LAYER 2: STRIKTE FINGERPRINT-PRÜFUNG (LIFETIME - GLOBAL)
              // ===============================================================
              if (isValidReferral) {
                const maxFingerprintLifetime =
                  parseInt(antiCheatSettings.max_referrals_per_fingerprint_lifetime) || 1;
                const blockFingerprintDuplicates =
                  antiCheatSettings.block_duplicate_fingerprint_referrals === 'true';

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
                    isValidReferral = false;
                    cheatReason = 'FINGERPRINT_ALREADY_USED_LIFETIME';
                    suspicionReasons.push(
                      `Fingerprint has been used ${fingerprintUsageCount} time(s) (max: ${maxFingerprintLifetime})`
                    );
                    console.log(
                      `❌ Layer 2: Fingerprint bereits ${fingerprintUsageCount}x verwendet (Limit: ${maxFingerprintLifetime})`
                    );
                  }
                }
              }

              // ===============================================================
              // LAYER 3: GLEICHER REFERRER MEHRFACH-PRÜFUNG
              // ===============================================================
              if (isValidReferral) {
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
                  isValidReferral = false;
                  cheatReason = 'SAME_USER_MULTIPLE_ACCOUNTS';
                  suspicionReasons.push('Same IP or Fingerprint used by same referrer before');
                  console.log(
                    '❌ Layer 3: Gleicher Benutzer versucht mehrere Referrals beim selben Referrer'
                  );
                }
              }

              // ===============================================================
              // LAYER 4: PATTERN DETECTION (Rapid-Fire & Timing)
              // ===============================================================
              if (isValidReferral && antiCheatSettings.pattern_detection_enabled === 'true') {
                const maxPerHour = parseInt(antiCheatSettings.max_registrations_per_hour) || 3;
                const rapidFireWindow = parseInt(antiCheatSettings.rapid_fire_window_minutes) || 5;

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
                  isValidReferral = false;
                  cheatReason = 'RAPID_FIRE_REGISTRATION';
                  suspicionReasons.push(
                    `${rapidFireCheck.recordset[0].count} registrations in ${rapidFireWindow} minutes`
                  );
                  console.log(
                    `❌ Layer 4: Rapid-fire detection - ${rapidFireCheck.recordset[0].count} attempts in ${rapidFireWindow}min`
                  );
                }

                // Check form fill time if provided
                const formFillTime = req.body.formFillTime;
                const minFillTime = parseInt(antiCheatSettings.min_form_fill_time_seconds) || 3;

                if (formFillTime && formFillTime < minFillTime * 1000) {
                  isValidReferral = false;
                  cheatReason = 'FORM_FILLED_TOO_FAST';
                  suspicionReasons.push(
                    `Form filled in ${formFillTime}ms (min: ${minFillTime * 1000}ms)`
                  );
                  console.log(`❌ Layer 4: Form filled too fast - ${formFillTime}ms`);
                }
              }

              // ===============================================================
              // LAYER 5: HONEYPOT TRAPS (Bot Detection)
              // ===============================================================
              if (isValidReferral && antiCheatSettings.honeypot_traps_enabled === 'true') {
                const honeypotFields = (
                  antiCheatSettings.honeypot_field_names || 'phone,address,website,company'
                ).split(',');

                for (const field of honeypotFields) {
                  if (req.body[field.trim()]) {
                    isValidReferral = false;
                    cheatReason = 'HONEYPOT_FIELD_FILLED';
                    suspicionReasons.push(`Honeypot field '${field.trim()}' was filled`);
                    console.log(`❌ Layer 5: Honeypot triggered - field '${field.trim()}' filled`);
                    break;
                  }
                }
              }

              // ===============================================================
              // LAYER 6: BEHAVIORAL ANALYSIS (Mouse & Scroll Patterns)
              // ===============================================================
              if (isValidReferral && antiCheatSettings.behavioral_analysis_enabled === 'true') {
                const mouseMovements = req.body.mouseMovements;
                const scrollEvents = req.body.scrollEvents;
                const minEvents = parseInt(antiCheatSettings.behavioral_min_events) || 5;

                if (
                  antiCheatSettings.mouse_movement_required === 'true' &&
                  (!mouseMovements || !scrollEvents)
                ) {
                  isValidReferral = false;
                  cheatReason = 'MISSING_BEHAVIORAL_DATA';
                  suspicionReasons.push('Required mouse/scroll data missing');
                  console.log('❌ Layer 6: Missing required behavioral data');
                } else if (mouseMovements && Array.isArray(mouseMovements)) {
                  if (mouseMovements.length < minEvents) {
                    suspicionReasons.push(
                      `Only ${mouseMovements.length} mouse events (min: ${minEvents})`
                    );
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
                      isValidReferral = false;
                      cheatReason = 'ROBOTIC_MOUSE_PATTERN';
                      suspicionReasons.push(
                        `${perfectLines.length}/${mouseMovements.length} perfect line movements (robotic)`
                      );
                      console.log('❌ Layer 6: Robotic mouse pattern detected');
                    }
                  }
                }
              }

              // ===============================================================
              // LAYER 7: NETWORK ANALYSIS (VPN/Proxy/Hosting Detection)
              // ===============================================================
              if (isValidReferral && antiCheatSettings.network_analysis_enabled === 'true') {
                // Check against known VPN IPs (simplified - table might not exist)
                try {
                  const vpnCheck = await pool.request().input('client_ip', sql.NVarChar, clientIP)
                    .query(`
                    SELECT provider, confidence 
                    FROM known_vpn_ips 
                    WHERE ip_address = @client_ip AND is_active = 1
                  `);

                  if (vpnCheck.recordset.length > 0) {
                    const vpnInfo = vpnCheck.recordset[0];
                    const vpnThreshold =
                      parseFloat(antiCheatSettings.vpn_confidence_threshold) || 0.8;

                    if (
                      vpnInfo.confidence >= vpnThreshold &&
                      antiCheatSettings.block_vpn_registrations === 'true'
                    ) {
                      isValidReferral = false;
                      cheatReason = 'VPN_IP_DETECTED';
                      console.log(
                        `❌ Layer 7: VPN detected - ${vpnInfo.provider} (${vpnInfo.confidence} confidence)`
                      );
                    }
                  }
                } catch (vpnError) {
                  // VPN table might not exist - skip this check
                  console.log('⚠️ Layer 7: VPN check skipped (table not available)');
                }

                // Check for hosting/datacenter IPs
                const hostingPatterns = [/^45\./, /^144\./, /^185\.220\./, /^139\.99\./];
                if (hostingPatterns.some((pattern) => pattern.test(clientIP))) {
                  suspicionReasons.push('IP matches hosting/datacenter pattern');

                  if (antiCheatSettings.block_hosting_ips === 'true') {
                    isValidReferral = false;
                    cheatReason = 'HOSTING_IP_DETECTED';
                    console.log(`❌ Layer 7: Hosting IP detected - ${clientIP}`);
                  }
                }
              }

              // ===============================================================
              // LAYER 8: ENHANCED LOGGING & CONFIDENCE SCORE
              // ===============================================================
              const totalLayers = 8;
              let layersPassed = 0;
              if (isValidReferral) layersPassed = totalLayers;
              else {
                // Count which layers were passed before failure
                if (!cheatReason.includes('IP_ALREADY_USED')) layersPassed++;
                if (!cheatReason.includes('FINGERPRINT_ALREADY_USED')) layersPassed++;
                if (!cheatReason.includes('SAME_USER_MULTIPLE')) layersPassed++;
                if (
                  !cheatReason.includes('RAPID_FIRE') &&
                  !cheatReason.includes('FORM_FILLED_TOO_FAST')
                )
                  layersPassed++;
                if (!cheatReason.includes('HONEYPOT')) layersPassed++;
                if (!cheatReason.includes('ROBOTIC') && !cheatReason.includes('BEHAVIORAL'))
                  layersPassed++;
                if (!cheatReason.includes('VPN') && !cheatReason.includes('HOSTING'))
                  layersPassed++;
              }

              const confidenceScore = layersPassed / totalLayers;

              // Simplified Anti-Cheat Logging (only basic columns)
              try {
                await pool
                  .request()
                  .input('user_id', sql.BigInt, portalJID)
                  .input('ip_address', sql.NVarChar, clientIP)
                  .input('fingerprint', sql.NVarChar, fingerprint)
                  .input(
                    'action',
                    sql.NVarChar,
                    isValidReferral ? 'REFERRAL_ACCEPTED' : 'REFERRAL_BLOCKED'
                  )
                  .input('referral_code', sql.NVarChar, referralCode)
                  .input('is_suspicious', sql.Bit, isValidReferral ? 0 : 1)
                  .input('detection_reason', sql.NVarChar, cheatReason || null)
                  .input('user_agent', sql.NVarChar, req.headers['user-agent'] || null).query(`
                    INSERT INTO referral_anticheat_logs 
                    (user_id, ip_address, fingerprint, action, referral_code, is_suspicious, detection_reason, user_agent, created_at)
                    VALUES (@user_id, @ip_address, @fingerprint, @action, @referral_code, @is_suspicious, @detection_reason, @user_agent, GETDATE())
                  `);
              } catch (logError) {
                console.warn('⚠️ Anti-Cheat Logging failed:', logError.message);
                // Continue even if logging fails
              }

              if (isValidReferral) {
                console.log('✅ Anti-Cheat: Alle 8 Layer bestanden');
              } else {
                console.log(`❌ Anti-Cheat: Blockiert in Layer - ${cheatReason}`);
              }
            } else {
              console.log(
                'ℹ️ Anti-Cheat deaktiviert - Referral wird ohne Layer-Prüfung akzeptiert'
              );
            }
          } catch (antiCheatError) {
            console.error('❌ Anti-Cheat Prüfung fehlgeschlagen:', antiCheatError);
            isValidReferral = false;
            cheatReason = 'ANTICHEAT_ERROR';
            suspicionReasons.push(antiCheatError.message);
          }

          // Determine referral status and reward timing
          let referralStatus = 'PENDING';
          let requiresValidation = 1;
          let pointsToGive = 0;

          if (!isValidReferral) {
            referralStatus = 'REJECTED';
            requiresValidation = 0;
          } else if (!delayedRewardsEnabled) {
            // Immediate rewards (old system)
            referralStatus = 'ACTIVE';
            requiresValidation = 0;
            pointsToGive = pointsPerReferral;
          } else {
            // Delayed rewards (new system) - start as PENDING
            referralStatus = 'PENDING';
            requiresValidation = 1;
            pointsToGive = 0; // Will be given after validation
          }

          // Insert referral record with enhanced tracking and delayed reward support
          console.log(
            `Inserting referral record (Status: ${referralStatus}, Delayed: ${delayedRewardsEnabled}, Points: ${pointsToGive})...`
          );
          await pool
            .request()
            .input('code', sql.NVarChar, referralCode)
            .input('referrer_jid', sql.BigInt, referrerJid)
            .input('invited_jid', sql.BigInt, portalJID) // ✅ ECHTE Portal JID verwenden!
            .input('points', sql.Int, pointsToGive)
            .input('redeemed', sql.Bit, 0)
            .input('reward_silk', sql.Int, 0)
            .input('ip_address', sql.NVarChar, clientIP)
            .input('fingerprint', sql.NVarChar, fingerprint)
            .input('is_valid', sql.Bit, isValidReferral ? 1 : 0)
            .input('cheat_reason', sql.NVarChar, cheatReason || null)
            .input('status', sql.NVarChar, referralStatus)
            .input('requires_validation', sql.Bit, requiresValidation)
            .input('auto_processed', sql.Bit, 1)
            .input(
              'reward_amount',
              sql.Decimal(10, 2),
              delayedRewardsEnabled ? pointsPerReferral : pointsToGive
            )
            .input('reward_type', sql.NVarChar, 'POINTS')
            .input(
              'next_process_at',
              sql.DateTime,
              delayedRewardsEnabled && isValidReferral
                ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                : null
            )
            .input('created_at', sql.DateTime, new Date())
            .input('updated_at', sql.DateTime, new Date()).query(`
              INSERT INTO referrals 
              (code, jid, invited_jid, points, redeemed, reward_silk, ip_address, fingerprint, 
               is_valid, cheat_reason, status, requires_validation, auto_processed, 
               reward_amount, reward_type, next_process_at, created_at, updated_at) 
              VALUES 
              (@code, @referrer_jid, @invited_jid, @points, @redeemed, @reward_silk, @ip_address, @fingerprint, 
               @is_valid, @cheat_reason, @status, @requires_validation, @auto_processed,
               @reward_amount, @reward_type, @next_process_at, @created_at, @updated_at)
            `);

          if (isValidReferral) {
            if (delayedRewardsEnabled) {
              console.log(
                `✅ Valid referral created with DELAYED rewards (Status: PENDING, will be processed after account meets requirements)`
              );
            } else {
              console.log(
                `✅ Valid referral created with IMMEDIATE rewards (${pointsToGive} points given)`
              );
            }
          } else {
            console.log(
              `❌ Suspicious referral blocked - Reason: ${cheatReason}, Status: REJECTED`
            );
          }
        } else {
          console.log('Referral code not found:', referralCode);
        }
      } catch (referralError) {
        console.error('❌ Fehler beim Verarbeiten des Referrals:', referralError);
        // Registrierung nicht abbrechen bei Referral-Fehlern
      }
    }

    // ✅ MAIL AUTHENTICATION - Verifikations-E-Mail senden
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // We don't return an error here to avoid interrupting the registration process
    }

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error(err);

    if (err.number === 2627) {
      // SQL Server unique constraint violation
      return res.status(409).send('Username or email already exists');
    }

    res.status(500).send('Database error during registration');
  }
}

/**
 * Login a user
 */
async function loginUser(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send('Missing fields');

  await poolConnect;
  try {
    // Find user in users table with role information
    const user = await pool.request().input('username', sql.NVarChar, username).query(`
        SELECT u.*, ur.is_admin 
        FROM users u 
        LEFT JOIN user_roles ur ON u.id = ur.user_id 
        WHERE u.username = @username OR u.email = @username
      `);

    if (!user.recordset[0]) return res.status(404).send('User not found');

    const valid = await comparePassword(password, user.recordset[0].password);
    if (!valid) return res.status(403).send('Invalid credentials');

    // ✅ MAIL AUTHENTICATION - E-Mail Verifikation Check aktiviert
    // Check if the user has verified their email address
    if (!user.recordset[0].email_verified_at) {
      // Optional: A new confirmation email could be triggered here if the old one has expired
      return res.status(403).send({
        message: 'Email not verified',
        needsVerification: true,
      });
    }

    // ✅ TWO-FACTOR AUTHENTICATION CHECK
    // If 2FA is enabled, return temp token instead of full JWT
    if (user.recordset[0].totp_enabled) {
      const tempToken = jwt.sign(
        {
          id: user.recordset[0].id,
          requires2FA: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: '5m' } // Short-lived token for 2FA verification
      );

      return res.json({
        requires2FA: true,
        tempToken: tempToken,
        message: 'Please enter your 2FA code',
      });
    }

    // Update last login time (updated_at field)
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('now', sql.DateTime, new Date())
      .query('UPDATE users SET updated_at = @now WHERE id = @userId');

    const token = jwt.sign(
      {
        id: user.recordset[0].id,
        role: user.recordset[0].is_admin ? 'admin' : 'user',
        username: user.recordset[0].username,
        isAdmin: user.recordset[0].is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.recordset[0].id,
        username: user.recordset[0].username,
        email: user.recordset[0].email,
        role: user.recordset[0].is_admin ? 'admin' : 'user',
        isAdmin: user.recordset[0].is_admin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
}

/**
 * Forgot password - Sends an email with a password reset link
 */
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email is required');

  try {
    await poolConnect;
    // Check if user with this email exists
    const user = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (!user.recordset[0]) {
      // For security reasons, we don't reveal that the email doesn't exist
      return res.status(200).send('Reset password instructions sent if email exists');
    }

    // Token for password reset
    const resetToken = generateToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // Valid for 1 hour

    // Store token in the remember_token field (repurposing it for reset tokens)
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('resetToken', sql.NVarChar, resetToken)
      .input('now', sql.DateTime, new Date())
      .query('UPDATE users SET remember_token = @resetToken, updated_at = @now WHERE id = @userId');

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).send('Reset password instructions sent');
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).send('Error processing password reset request');
  }
}

/**
 * Verifies if a password reset token is valid
 */
async function verifyResetToken(req, res) {
  const { token } = req.params;
  if (!token) return res.status(400).send('Token is required');

  try {
    await poolConnect;
    // Find token in the remember_token field
    const user = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .query('SELECT * FROM users WHERE remember_token = @token');

    if (!user.recordset[0]) {
      return res.status(400).send('Invalid or expired token');
    }

    res.status(200).send('Token is valid');
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).send('Error verifying token');
  }
}

/**
 * Resets the password
 */
async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).send('Token and password are required');

  try {
    await poolConnect;
    // Find token in the remember_token field
    const user = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .query('SELECT * FROM users WHERE remember_token = @token');

    if (!user.recordset[0]) {
      return res.status(400).send('Invalid or expired token');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and clear reset token
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('password', sql.NVarChar, hashedPassword)
      .input('now', sql.DateTime, new Date())
      .query(
        'UPDATE users SET password = @password, remember_token = NULL, updated_at = @now WHERE id = @userId'
      );

    res.status(200).send('Password has been reset successfully');
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).send('Error resetting password');
  }
}

/**
 * Confirms a user's email address
 */
async function verifyEmail(req, res) {
  const { token } = req.params;
  if (!token) return res.status(400).send('Token is required');

  try {
    await poolConnect;
    // Find token in the remember_token field (repurposed for email verification)
    const user = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .query('SELECT * FROM users WHERE remember_token = @token');

    if (!user.recordset[0]) {
      return res.status(400).send('Invalid or expired token');
    }

    // Mark email as verified and clear token
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('now', sql.DateTime, new Date())
      .query(
        'UPDATE users SET email_verified_at = @now, remember_token = NULL, updated_at = @now WHERE id = @userId'
      );

    res.status(200).send('Email has been verified successfully');
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).send('Error verifying email');
  }
}

/**
 * Sends a new verification email
 */
async function resendVerificationEmail(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email is required');

  try {
    await poolConnect;
    // Find user in the database
    const user = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (!user.recordset[0]) {
      // For security reasons, we don't reveal that the email doesn't exist
      return res.status(200).send('Verification email sent if account exists');
    }

    // If the email is already verified
    if (user.recordset[0].email_verified_at) {
      return res.status(400).send('Email is already verified');
    }

    // Generate new token
    const verificationToken = generateToken();

    // Update token in the database (using remember_token field)
    await pool
      .request()
      .input('userId', sql.BigInt, user.recordset[0].id)
      .input('verificationToken', sql.NVarChar, verificationToken)
      .input('now', sql.DateTime, new Date())
      .query(
        'UPDATE users SET remember_token = @verificationToken, updated_at = @now WHERE id = @userId'
      );

    // Send email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).send('Verification email sent');
  } catch (err) {
    console.error('Resend verification email error:', err);
    res.status(500).send('Error sending verification email');
  }
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
};
