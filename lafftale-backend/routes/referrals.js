const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/my-referrals', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userJid = req.user.jid;

    console.log('User data in my-referrals:', { userId, userJid, user: req.user });

    const pool = await getWebDb();

    // If no JID, try to get it from users table
    let effectiveJid = userJid;
    if (!effectiveJid && userId) {
      const userResult = await pool
        .request()
        .input('userId', sql.BigInt, userId)
        .query('SELECT jid FROM users WHERE id = @userId');

      if (userResult.recordset.length > 0) {
        effectiveJid = userResult.recordset[0].jid;
      }
    }

    // If still no JID, return empty data instead of error
    if (!effectiveJid) {
      return res.json({
        success: true,
        data: {
          referrals: [],
          referral_code: `REF${userId || '000000'}`,
        },
      });
    }

    // Check if user has a referral code record, if not create one
    let userReferralCode = null;
    const codeResult = await pool
      .request()
      .input('userJid', sql.Int, effectiveJid)
      .query('SELECT code FROM referrals WHERE jid = @userJid AND invited_jid IS NULL');

    if (codeResult.recordset.length === 0) {
      // Create a referral code for this user
      let generatedCode;
      do {
        generatedCode = `REF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      } while (
        await pool
          .request()
          .input('code', sql.NVarChar, generatedCode)
          .query('SELECT id FROM referrals WHERE code = @code')
          .then((result) => result.recordset.length > 0)
      );

      // Get username from users table
      const userResult = await pool
        .request()
        .input('userId', sql.BigInt, userId)
        .query('SELECT username FROM users WHERE id = @userId');

      const username =
        userResult.recordset.length > 0 ? userResult.recordset[0].username : 'Unknown';

      // Insert the referral code record
      await pool
        .request()
        .input('code', sql.NVarChar, generatedCode)
        .input('name', sql.NVarChar, username)
        .input('jid', sql.Int, effectiveJid).query(`
          INSERT INTO referrals (code, name, jid, invited_jid, points, reward_silk, redeemed, created_at, updated_at)
          VALUES (@code, @name, @jid, NULL, 0, 0, 0, GETDATE(), GETDATE())
        `);

      userReferralCode = generatedCode;
    } else {
      userReferralCode = codeResult.recordset[0].code;
    }

    // Get recent referrals (those where this user is the referrer)
    const referralsResult = await pool.request().input('userJid', sql.Int, effectiveJid).query(`
        SELECT r.id, r.code, r.name, r.jid, r.invited_jid, 
               r.points, r.reward_silk, r.redeemed, r.redeemed_at, r.created_at,
               u.username as referred_username 
        FROM referrals r
        LEFT JOIN users u ON r.invited_jid = u.jid
        WHERE r.jid = @userJid AND r.invited_jid IS NOT NULL AND r.points > 0
        ORDER BY r.created_at DESC
      `);

    res.json({
      success: true,
      data: {
        referrals: referralsResult.recordset || [],
        referral_code: userReferralCode,
      },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.post('/redeem', verifyToken, async (req, res) => {
  try {
    const { points } = req.body;
    const userJid = req.user.jid;

    const pool = await getWebDb();

    // Get referral settings
    const settingsResult = await pool
      .request()
      .query(
        "SELECT setting_key, setting_value FROM referral_settings WHERE setting_key IN ('minimum_redeem_points', 'silk_per_point')"
      );

    const settings = {};
    settingsResult.recordset.forEach((row) => {
      settings[row.setting_key] = row.setting_value;
    });

    const minimumRedeem = parseInt(settings.minimum_redeem_points) || 100;
    const silkRate = parseInt(settings.silk_per_point) || 1;

    if (!points || points < minimumRedeem) {
      return res.status(400).json({
        success: false,
        message: `Minimum redemption amount is ${minimumRedeem} points`,
      });
    }

    // Get available points
    const pointsResult = await pool.request().input('jid', sql.Int, userJid).query(`
        SELECT SUM(CASE WHEN redeemed = 0 THEN points ELSE 0 END) as available_points
        FROM referrals 
        WHERE jid = @jid AND invited_jid IS NOT NULL
      `);

    const availablePoints = pointsResult.recordset[0]?.available_points || 0;

    if (availablePoints < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points available',
      });
    }

    // Start transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Mark points as redeemed (update oldest unredeemed referrals first)
      let remainingPoints = points;

      const unredeemed = await transaction.request().input('jid', sql.Int, userJid).query(`
          SELECT id, points 
          FROM referrals 
          WHERE jid = @jid AND redeemed = 0 AND invited_jid IS NOT NULL
          ORDER BY created_at ASC
        `);

      for (const referral of unredeemed.recordset) {
        if (remainingPoints <= 0) break;

        if (referral.points <= remainingPoints) {
          // Redeem entire referral
          await transaction
            .request()
            .input('id', sql.Int, referral.id)
            .query('UPDATE referrals SET redeemed = 1 WHERE id = @id');
          remainingPoints -= referral.points;
        } else {
          // Partial redemption - split the referral
          const redeemedAmount = remainingPoints;
          const remainingAmount = referral.points - remainingPoints;

          // Update original referral
          await transaction
            .request()
            .input('id', sql.Int, referral.id)
            .input('points', sql.Int, remainingAmount)
            .query('UPDATE referrals SET points = @points WHERE id = @id');

          // Create new redeemed entry
          await transaction
            .request()
            .input('referrer_jid', sql.Int, userJid)
            .input('referred_jid', sql.Int, referral.referred_jid)
            .input('points', sql.Int, redeemedAmount).query(`
              INSERT INTO referrals (referrer_jid, referred_jid, points, redeemed, created_at, updated_at)
              VALUES (@referrer_jid, @referred_jid, @points, 1, GETDATE(), GETDATE())
            `);

          remainingPoints = 0;
        }
      }

      // Add silk to user account
      const silkAmount = points * silkRate;
      const { getGameDb } = require('../db');
      const gamePool = await getGameDb();

      await gamePool.request().input('jid', sql.Int, userJid).input('amount', sql.Int, silkAmount)
        .query(`
          UPDATE SK_Silk 
          SET silk_own = silk_own + @amount 
          WHERE JID = @jid
        `);

      await transaction.commit();

      res.json({
        success: true,
        message: `Successfully redeemed ${points} points for ${silkAmount} silk!`,
        data: {
          points_redeemed: points,
          silk_received: silkAmount,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error redeeming referral points:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Redeem specific reward
router.post('/redeem-reward', verifyToken, async (req, res) => {
  try {
    const { reward_id, points_required } = req.body;
    const userJid = req.user.jid;

    if (!reward_id || !points_required) {
      return res.status(400).json({
        success: false,
        message: 'Missing reward_id or points_required',
      });
    }

    const pool = await getWebDb();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Verify reward exists and is active
      const rewardResult = await transaction
        .request()
        .input('reward_id', sql.Int, reward_id)
        .query('SELECT * FROM referral_rewards WHERE id = @reward_id AND is_active = 1');

      if (rewardResult.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Reward not found or inactive',
        });
      }

      const reward = rewardResult.recordset[0];

      // Verify points requirement matches
      if (reward.points_required !== points_required) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Points requirement mismatch',
        });
      }

      // Check user's available points
      const userPointsResult = await transaction.request().input('jid', sql.Int, userJid).query(`
          SELECT SUM(CASE WHEN redeemed = 0 THEN points ELSE 0 END) as available_points
          FROM referrals 
          WHERE jid = @jid AND invited_jid IS NOT NULL
        `);

      const availablePoints = userPointsResult.recordset[0]?.available_points || 0;

      if (availablePoints < points_required) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient points. You have ${availablePoints}, need ${points_required}`,
        });
      }

      // Mark points as redeemed (update oldest unredeemed referrals first)
      const unredeemed = await transaction.request().input('jid', sql.Int, userJid).query(`
          SELECT id, points FROM referrals 
          WHERE jid = @jid AND redeemed = 0 AND invited_jid IS NOT NULL
          ORDER BY created_at ASC
        `);

      let remainingToRedeem = points_required;

      for (const referral of unredeemed.recordset) {
        if (remainingToRedeem <= 0) break;

        if (referral.points <= remainingToRedeem) {
          // Redeem entire referral
          await transaction
            .request()
            .input('id', sql.Int, referral.id)
            .query('UPDATE referrals SET redeemed = 1, redeemed_at = GETDATE() WHERE id = @id');

          remainingToRedeem -= referral.points;
        } else {
          // Partial redemption - split the referral
          const redeemedAmount = remainingToRedeem;
          const remainingAmount = referral.points - remainingToRedeem;

          // Update original referral with remaining points
          await transaction
            .request()
            .input('id', sql.Int, referral.id)
            .input('points', sql.Int, remainingAmount)
            .query('UPDATE referrals SET points = @points WHERE id = @id');

          // Create new redeemed entry
          await transaction
            .request()
            .input('jid', sql.Int, userJid)
            .input('points', sql.Int, redeemedAmount).query(`
              INSERT INTO referrals (jid, invited_jid, points, redeemed, redeemed_at, created_at, updated_at)
              VALUES (@jid, -1, @points, 1, GETDATE(), GETDATE(), GETDATE())
            `);

          remainingToRedeem = 0;
        }
      }

      // Process reward based on type
      let rewardMessage = '';

      if (reward.reward_type === 'silk') {
        const silkAmount = parseInt(reward.reward_value) || 0;

        if (silkAmount > 0) {
          const { getGameDb } = require('../db');
          const gamePool = await getGameDb();

          await gamePool
            .request()
            .input('jid', sql.Int, userJid)
            .input('amount', sql.Int, silkAmount).query(`
              UPDATE SK_Silk 
              SET silk_own = silk_own + @amount 
              WHERE JID = @jid
            `);

          rewardMessage = `Received ${silkAmount} silk`;
        }
      } else if (reward.reward_type === 'item') {
        // For items, you would implement item giving logic here
        // This depends on your game's item system
        rewardMessage = `Received item: ${reward.reward_value}`;
      } else if (reward.reward_type === 'gold') {
        const goldAmount = parseInt(reward.reward_value) || 0;

        if (goldAmount > 0) {
          const { getCharDb } = require('../db');
          const charPool = await getCharDb();

          // This is a simplified example - you'd need to implement proper gold giving
          // based on your game's character/gold system
          rewardMessage = `Received ${goldAmount} gold`;
        }
      }

      // Log the redemption
      await transaction
        .request()
        .input('jid', sql.Int, userJid)
        .input('reward_id', sql.Int, reward_id)
        .input('points_spent', sql.Int, points_required)
        .input('reward_type', sql.NVarChar, reward.reward_type)
        .input('reward_value', sql.NVarChar, reward.reward_value).query(`
          INSERT INTO referral_redemption_log (jid, reward_id, points_spent, reward_type, reward_value, redeemed_at)
          VALUES (@jid, @reward_id, @points_spent, @reward_type, @reward_value, GETDATE())
        `);

      await transaction.commit();

      res.json({
        success: true,
        message: `Successfully redeemed "${reward.title}"! ${rewardMessage}`,
        data: {
          reward_title: reward.title,
          points_spent: points_required,
          reward_type: reward.reward_type,
          reward_value: reward.reward_value,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error redeeming specific reward:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem reward. Please try again.',
    });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { referrer_code, referred_jid } = req.body;

    if (!referrer_code || !referred_jid) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const pool = await getWebDb();

    // Convert referrer code to JID (assuming code is the JID)
    const referrer_jid = parseInt(referrer_code);

    if (isNaN(referrer_jid) || referrer_jid === referred_jid) {
      return res.status(400).json({ success: false, message: 'Invalid referrer code' });
    }

    // Check if referrer exists
    const referrerResult = await pool
      .request()
      .input('jid', sql.Int, referrer_jid)
      .query('SELECT id FROM users WHERE jid = @jid');

    if (referrerResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Referrer not found' });
    }

    // Check if referral already exists
    const existingResult = await pool
      .request()
      .input('referred_jid', sql.Int, referred_jid)
      .query('SELECT id FROM referrals WHERE referred_jid = @referred_jid');

    if (existingResult.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'User already referred' });
    }

    // Create referral record
    const basePoints = 50; // Base points for referral

    await pool
      .request()
      .input('referrer_jid', sql.Int, referrer_jid)
      .input('referred_jid', sql.Int, referred_jid)
      .input('points', sql.Int, basePoints).query(`
        INSERT INTO referrals (referrer_jid, referred_jid, points, redeemed, created_at, updated_at)
        VALUES (@referrer_jid, @referred_jid, @points, 0, GETDATE(), GETDATE())
      `);

    res.json({
      success: true,
      message: 'Referral registered successfully',
      data: {
        referrer_jid,
        referred_jid,
        points: basePoints,
      },
    });
  } catch (error) {
    console.error('Error registering referral:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const pool = await getWebDb();

    const result = await pool.request().query(`
        SELECT TOP ${parseInt(limit)} 
          r.*, 
          ur.username as referrer_username,
          uf.username as referred_username
        FROM referrals r
        JOIN users ur ON r.referrer_jid = ur.jid
        JOIN users uf ON r.referred_jid = uf.jid
        ORDER BY r.created_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = await getWebDb();

    const result = await pool.request().query(`
        SELECT 
          COUNT(*) as total_referrals,
          COUNT(DISTINCT referrer_jid) as total_referrers,
          COUNT(DISTINCT referred_jid) as total_referred,
          SUM(points) as total_points,
          SUM(CASE WHEN redeemed = 1 THEN points ELSE 0 END) as redeemed_points,
          AVG(CAST(points as FLOAT)) as avg_points_per_referral
        FROM referrals
      `);

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// GET /my-stats - Get referral statistics for the current user
router.get('/my-stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userJid = req.user.jid;

    const pool = await getWebDb();

    // If no JID, try to get it from users table
    let effectiveJid = userJid;
    if (!effectiveJid && userId) {
      const userResult = await pool
        .request()
        .input('userId', sql.BigInt, userId)
        .query('SELECT jid FROM users WHERE id = @userId');

      if (userResult.recordset.length > 0) {
        effectiveJid = userResult.recordset[0].jid;
      }
    }

    // If still no JID, return empty stats
    if (!effectiveJid) {
      return res.json({
        success: true,
        data: {
          stats: {
            total_referrals: 0,
            approved_referrals: 0,
            pending_referrals: 0,
            rejected_referrals: 0,
            total_points_earned: 0,
            available_points: 0,
          },
        },
      });
    }

    const result = await pool.request().input('userJid', sql.Int, effectiveJid).query(`
        SELECT 
          COUNT(CASE WHEN points > 0 THEN 1 END) as total_referrals,
          SUM(CASE WHEN redeemed = 1 AND points > 0 THEN 1 ELSE 0 END) as approved_referrals,
          SUM(CASE WHEN redeemed = 0 AND points > 0 THEN 1 ELSE 0 END) as pending_referrals,
          0 as rejected_referrals,
          COALESCE(SUM(CASE WHEN redeemed = 1 THEN points ELSE 0 END), 0) as total_points_earned,
          COALESCE(SUM(CASE WHEN redeemed = 0 THEN points ELSE 0 END), 0) as available_points
        FROM referrals 
        WHERE jid = @userJid
      `);

    res.json({
      success: true,
      data: {
        stats: result.recordset[0] || {
          total_referrals: 0,
          approved_referrals: 0,
          pending_referrals: 0,
          rejected_referrals: 0,
          total_points_earned: 0,
          available_points: 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user referral stats:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// GET /rewards - Get all available referral rewards
router.get('/rewards', async (req, res) => {
  try {
    const pool = await getWebDb();

    // Get all active referral rewards
    const result = await pool.request().query(`
      SELECT id, title, description, points_required, reward_type, reward_value, is_active
      FROM referral_rewards
      WHERE is_active = 1
      ORDER BY points_required ASC
    `);

    res.json({
      success: true,
      data: result.recordset || [],
    });
  } catch (error) {
    console.error('Error fetching available rewards:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// GET /my-rewards - Get all referrals made by the user
router.get('/my-rewards', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userJid = req.user.jid;

    const pool = await getWebDb();

    // If no JID, try to get it from users table
    let effectiveJid = userJid;
    if (!effectiveJid && userId) {
      const userResult = await pool
        .request()
        .input('userId', sql.BigInt, userId)
        .query('SELECT jid FROM users WHERE id = @userId');

      if (userResult.recordset.length > 0) {
        effectiveJid = userResult.recordset[0].jid;
      }
    }

    // If still no JID, return empty rewards
    if (!effectiveJid) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get all referrals made by this user with their rewards
    const result = await pool.request().input('userJid', sql.Int, effectiveJid).query(`
        SELECT r.id, r.code, r.name, r.jid, r.invited_jid, 
               r.points, r.reward_silk, r.redeemed, r.redeemed_at, r.created_at,
               u.username as referred_username
        FROM referrals r
        LEFT JOIN users u ON r.invited_jid = u.jid
        WHERE r.jid = @userJid
        ORDER BY r.created_at DESC
      `);

    res.json({
      success: true,
      data: result.recordset || [],
    });
  } catch (error) {
    console.error('Error fetching referral rewards:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
