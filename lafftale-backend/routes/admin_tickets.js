const express = require('express');
const router = express.Router();
const { getWebDb, sql } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/auth');

// Get all tickets with pagination and filtering
router.get('/tickets', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status || ''; // 'open', 'closed', or all
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const pool = await getWebDb();

    // Build WHERE clause
    let whereClause = '1=1';
    const request = pool.request();

    if (status) {
      whereClause += ' AND T.Status = @status';
      request.input('status', sql.NVarChar, status);
    }

    if (search.trim()) {
      whereClause += ' AND (T.Subject LIKE @search OR U.username LIKE @search)';
      request.input('search', sql.NVarChar, `%${search.trim()}%`);
    }

    // Get total count
    const countResult = await request.query(`
      SELECT COUNT(*) as total 
      FROM SupportTickets T
      JOIN users U ON T.UserId = U.id
      WHERE ${whereClause}
    `);
    const totalCount = countResult.recordset[0].total;

    // Get paginated results
    const result = await pool
      .request()
      .input('status', status ? sql.NVarChar : sql.NVarChar, status || '')
      .input(
        'search',
        search.trim() ? sql.NVarChar : sql.NVarChar,
        search.trim() ? `%${search.trim()}%` : ''
      )
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit).query(`
        SELECT 
          T.Id, T.UserId, T.Subject, T.Priority, T.Status, T.CreatedAt, T.ClosedAt,
          U.username
        FROM SupportTickets T
        JOIN users U ON T.UserId = U.id
        WHERE ${whereClause}
        ORDER BY 
          CASE WHEN T.Status = 'open' THEN 0 ELSE 1 END,
          T.CreatedAt DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    res.json({
      data: result.recordset,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('Error loading tickets:', err);
    res.status(500).json({ error: 'Error loading tickets', details: err.message });
  }
});

// Get ticket details with messages
router.get('/tickets/:id', authenticateToken, verifyAdmin, async (req, res) => {
  const ticketId = req.params.id;

  try {
    const pool = await getWebDb();

    const ticketResult = await pool.request().input('id', sql.Int, ticketId).query(`
        SELECT T.*, U.username 
        FROM SupportTickets T
        JOIN users U ON T.UserId = U.id
        WHERE T.Id = @id
      `);

    const messagesResult = await pool.request().input('ticketId', sql.Int, ticketId).query(`
        SELECT 
          TM.Id, TM.TicketId, TM.SenderId, TM.Message, TM.SentAt, TM.IsFromStaff,
          U.username AS SenderName
        FROM TicketMessages TM
        JOIN users U ON TM.SenderId = U.id
        WHERE TM.TicketId = @ticketId
        ORDER BY TM.SentAt ASC
      `);

    const ticket = ticketResult.recordset[0];
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    res.json({
      ...ticket,
      Messages: messagesResult.recordset,
    });
  } catch (err) {
    console.error('Error loading ticket details:', err);
    res.status(500).json({ error: 'Error loading ticket details' });
  }
});

// Reply to ticket (admin only)
router.post('/tickets/:id/reply', authenticateToken, verifyAdmin, async (req, res) => {
  const ticketId = req.params.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const pool = await getWebDb();

    await pool
      .request()
      .input('ticketId', sql.Int, ticketId)
      .input('senderId', sql.Int, req.user.id)
      .input('message', sql.NVarChar, message.trim())
      .input('isFromStaff', sql.Bit, 1).query(`
        INSERT INTO TicketMessages (TicketId, SenderId, Message, IsFromStaff, SentAt)
        VALUES (@ticketId, @senderId, @message, @isFromStaff, GETDATE())
      `);

    res.json({ message: 'Reply sent successfully' });
  } catch (err) {
    console.error('Error sending reply:', err);
    res.status(500).json({ error: 'Error sending reply' });
  }
});

// Close a ticket
router.put('/tickets/:id/close', authenticateToken, verifyAdmin, async (req, res) => {
  const ticketId = req.params.id;
  try {
    const pool = await getWebDb();
    await pool
      .request()
      .input('id', sql.Int, ticketId)
      .input('closedAt', sql.DateTime, new Date())
      .query("UPDATE SupportTickets SET Status = 'closed', ClosedAt = @closedAt WHERE Id = @id");
    res.json({ message: 'Ticket closed successfully' });
  } catch (err) {
    console.error('Error closing ticket:', err);
    res.status(500).json({ error: 'Error closing ticket' });
  }
});

// Reopen a ticket
router.put('/tickets/:id/reopen', authenticateToken, verifyAdmin, async (req, res) => {
  const ticketId = req.params.id;
  try {
    const pool = await getWebDb();
    await pool
      .request()
      .input('id', sql.Int, ticketId)
      .query("UPDATE SupportTickets SET Status = 'open', ClosedAt = NULL WHERE Id = @id");
    res.json({ message: 'Ticket reopened successfully' });
  } catch (err) {
    console.error('Error reopening ticket:', err);
    res.status(500).json({ error: 'Error reopening ticket' });
  }
});

module.exports = router;
