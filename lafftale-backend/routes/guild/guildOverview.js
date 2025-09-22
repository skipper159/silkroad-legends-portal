const express = require('express');
const router = express.Router();
const QueryBuilder = require('../../utils/queryBuilder');
const { authenticateToken } = require('../../middleware/auth');
const { getCharDb } = require('../../db');

/**
 * GET /api/guild/overview/:guildName
 * Get guild information and all members
 * Requires authentication to view
 */
router.get('/overview/:guildName', async (req, res) => {
  try {
    const { guildName } = req.params;

    if (!guildName) {
      return res.status(400).json({
        success: false,
        message: 'Guild name is required',
      });
    }

    const pool = await getCharDb();

    // First get guild information
    const guildQuery = `
      SELECT 
        g.ID,
        g.Name,
        g.Lvl,
        g.Alliance,
        g.MasterCommentTitle,
        g.MasterComment,
        g.FoundationDate as CreatedDate,
        (SELECT COUNT(*) FROM _GuildMember gm WHERE gm.GuildID = g.ID) as MemberCount
      FROM _Guild g
      WHERE g.Name = @guildName
        AND g.Name IS NOT NULL 
        AND g.Name != ''
    `;

    const guildParams = { guildName };
    const finalGuildQuery = QueryBuilder.applyParameters(guildQuery, guildParams);
    const guildResult = await pool.request().query(finalGuildQuery);

    if (!guildResult || !guildResult.recordset || guildResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Guild not found',
      });
    }

    const guild = guildResult.recordset[0];

    // Get all guild members with their character information and job details
    const membersQuery = `
      SELECT 
        c.CharID,
        c.CharName16,
        c.CurLevel,
        c.Strength,
        c.Intellect,
        CASE 
          WHEN roc.CodeName128 LIKE 'CHAR_CH_%' THEN 1 
          WHEN roc.CodeName128 LIKE 'CHAR_EU_%' THEN 2 
          ELSE 1 
        END as Race,
        ISNULL(tcj.Class, 0) as JobClass,
        ISNULL(tcj.JobLevel, 1) as JobLevel,
        ISNULL(tcj.PromotionPhase, 0) as PromotionPhase,
        c.LastLogout,
        gm.MemberClass,
        gm.CharLevel,
        gm.GP_Donation,
        gm.JoinDate,
        gm.Contribution,
        ISNULL((
          SELECT 
            SUM(ISNULL(bow.nOptValue, 0)) +
            SUM(ISNULL(i.OptLevel, 0)) +
            SUM(ISNULL(roc2.ReqLevel1, 0)) +
            SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_A_RARE%' THEN 5 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_B_RARE%' THEN 10 ELSE 0 END, 0)) +
            SUM(ISNULL(CASE WHEN roc2.CodeName128 LIKE '%_C_RARE%' THEN 15 ELSE 0 END, 0))
          FROM _Inventory inv
          JOIN _Items i ON i.ID64 = inv.ItemID
          JOIN _RefObjCommon roc2 ON roc2.ID = i.RefItemID
          LEFT JOIN _BindingOptionWithItem bow ON bow.nItemDBID = i.ID64 
            AND bow.nOptValue > 0 AND bow.bOptType = 2
          WHERE inv.CharID = c.CharID 
            AND inv.Slot < 13 
            AND inv.Slot NOT IN (7, 8)
            AND inv.ItemID > 0
        ), 0) as ItemPoints
      FROM _Char c
      JOIN _GuildMember gm ON gm.CharID = c.CharID
      LEFT JOIN _RefObjCommon roc ON c.RefObjID = roc.ID
      LEFT JOIN _CharTradeConflictJob tcj ON tcj.CharID = c.CharID
      WHERE gm.GuildID = @guildId
        AND c.CharName16 IS NOT NULL 
        AND c.CharName16 != ''
      ORDER BY gm.MemberClass ASC, c.CurLevel DESC
    `;

    const membersParams = { guildId: guild.ID };
    const finalMembersQuery = QueryBuilder.applyParameters(membersQuery, membersParams);
    const membersResult = await pool.request().query(finalMembersQuery);

    const members = membersResult.recordset || [];

    // Format the response data
    const guildOverviewData = {
      guild: {
        ID: guild.ID,
        Name: guild.Name,
        Lvl: guild.Lvl,
        MemberCount: guild.MemberCount,
        Alliance: guild.Alliance || null,
        Notice: guild.MasterComment || null,
        CreatedDate: guild.CreatedDate || null,
      },
      members: members.map((member) => ({
        CharID: member.CharID,
        CharName16: member.CharName16,
        CurLevel: member.CurLevel,
        Race: member.Race,
        JobClass: member.JobClass,
        JobLevel: member.JobLevel,
        PromotionPhase: member.PromotionPhase,
        Strength: member.Strength,
        Intellect: member.Intellect,
        LastLogout: member.LastLogout,
        ItemPoints: member.ItemPoints || 0,
        MemberClass: member.MemberClass,
        GuildLevel: member.CharLevel,
        Donation: member.GP_Donation || 0,
        JoinDate: member.JoinDate,
        Contribution: member.Contribution || 0,
      })),
    };

    res.json({
      success: true,
      data: guildOverviewData,
    });
  } catch (error) {
    console.error('Error fetching guild overview data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guild information',
    });
  }
});

module.exports = router;
