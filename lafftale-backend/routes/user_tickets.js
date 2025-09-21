// routes/user_tickets.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sql, getWebDb } = require('../db');

// GET all tickets of current user with optional status filter
router.get('/my', authenticateToken, async (req, res) => {
  const { status } = req.query;
  const pool = await getWebDb();
  try {
    let query = 'SELECT * FROM SupportTickets WHERE UserId = @userId';
    if (status) query += ' AND Status = @status';
    query += ' ORDER BY CreatedAt DESC';

    const request = pool.request().input('userId', sql.Int, req.user.id);
    if (status) request.input('status', sql.NVarChar, status);

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching user tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET single ticket and messages
router.get('/:id', authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;

  const pool = await getWebDb();
  try {
    const ticketResult = await pool
      .request()
      .input('id', sql.Int, ticketId)
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM SupportTickets WHERE Id = @id AND UserId = @userId');

    if (ticketResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or access denied' });
    }

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

    res.json({
      ...ticket,
      Messages: messagesResult.recordset,
    });
  } catch (err) {
    console.error('Error loading ticket messages:', err);
    res.status(500).json({ error: 'Error loading ticket' });
  }
});

// POST new ticket + message (only if no open ticket exists)
router.post('/', authenticateToken, async (req, res) => {
  const { subject, message, priority = 'normal' } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'Missing subject or message' });
  }

  const pool = await getWebDb();
  try {
    // Prüfen ob bereits ein offenes Ticket vorhanden ist
    const openCheck = await pool
      .request()
      .input('userId', sql.Int, req.user.id)
      .query(
        "SELECT COUNT(*) AS OpenCount FROM SupportTickets WHERE UserId = @userId AND Status = 'open'"
      );

    if (openCheck.recordset[0].OpenCount > 0) {
      return res.status(403).json({ error: 'You already have an open ticket.' });
    }

    // Ticket erstellen
    const ticketResult = await pool
      .request()
      .input('userId', sql.Int, req.user.id)
      .input('subject', sql.NVarChar, subject)
      .input('priority', sql.NVarChar, priority).query(`
        INSERT INTO SupportTickets (UserId, Subject, Priority, Status, CreatedAt)
        OUTPUT INSERTED.Id AS TicketId
        VALUES (@userId, @subject, @priority, 'open', GETDATE())
      `);

    const ticketId = ticketResult.recordset[0].TicketId;

    await pool
      .request()
      .input('ticketId', sql.Int, ticketId)
      .input('senderId', sql.Int, req.user.id)
      .input('message', sql.NVarChar, message).query(`
        INSERT INTO TicketMessages (TicketId, SenderId, Message, SentAt, IsFromStaff)
        VALUES (@ticketId, @senderId, @message, GETDATE(), 0)
      `);

    res.status(201).json({ message: 'Ticket created', ticketId });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST message to existing ticket
router.post('/:id/message', authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  const pool = await getWebDb();
  try {
    // Verify ticket ownership and status
    const ticketCheck = await pool
      .request()
      .input('ticketId', sql.Int, ticketId)
      .input('userId', sql.Int, userId)
      .query('SELECT Status FROM SupportTickets WHERE Id = @ticketId AND UserId = @userId');

    if (ticketCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Ticket not found or access denied' });
    }

    if (ticketCheck.recordset[0].Status === 'closed') {
      return res.status(403).json({ error: 'Cannot add messages to closed tickets' });
    }

    const isFromStaff = req.user.isAdmin; // Use isAdmin instead of role === 3

    await pool
      .request()
      .input('ticketId', sql.Int, ticketId)
      .input('senderId', sql.Int, userId)
      .input('message', sql.NVarChar, message.trim())
      .input('isFromStaff', sql.Bit, isFromStaff ? 1 : 0)
      .input('sentAt', sql.DateTime, new Date()).query(`
        INSERT INTO TicketMessages (TicketId, SenderId, Message, IsFromStaff, SentAt)
        VALUES (@ticketId, @senderId, @message, @isFromStaff, @sentAt)
      `);

    res.status(201).json({ message: 'Message added successfully' });
  } catch (err) {
    console.error('Error inserting message:', err);
    res.status(500).json({ error: 'Error adding message' });
  }
});

module.exports = router;
