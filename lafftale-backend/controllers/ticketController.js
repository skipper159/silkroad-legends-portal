
const { pool, poolConnect, sql } = require("../db");

/**
 * Create a new support ticket
 */
async function createTicket(req, res) {
  const { subject, message, priority } = req.body;
  if (!subject || !message) return res.status(400).send("Missing required fields");

  await poolConnect;
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    
    // Create the ticket
    const ticketRequest = new sql.Request(transaction);
    const ticketResult = await ticketRequest
      .input("userId", sql.Int, req.user.id)
      .input("subject", sql.NVarChar, subject)
      .input("priority", sql.NVarChar, priority || 'normal')
      .input("status", sql.NVarChar, 'open')
      .input("createdAt", sql.DateTime, new Date())
      .query(`
        INSERT INTO SupportTickets (UserId, Subject, Priority, Status, CreatedAt) 
        OUTPUT INSERTED.Id 
        VALUES (@userId, @subject, @priority, @status, @createdAt)
      `);

    const ticketId = ticketResult.recordset[0].Id;

    // Add the first message
    const messageRequest = new sql.Request(transaction);
    await messageRequest
      .input("ticketId", sql.Int, ticketId)
      .input("senderId", sql.Int, req.user.id)
      .input("message", sql.NVarChar, message)
      .input("isFromStaff", sql.Bit, 0)
      .input("sentAt", sql.DateTime, new Date())
      .query(`
        INSERT INTO TicketMessages (TicketId, SenderId, Message, IsFromStaff, SentAt) 
        VALUES (@ticketId, @senderId, @message, @isFromStaff, @sentAt)
      `);

    await transaction.commit();
    res.status(201).json({ ticketId });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    res.status(500).send("Error creating ticket");
  }
}

/**
 * Get user's tickets
 */
async function getUserTickets(req, res) {
  await poolConnect;
  try {
    const result = await pool.request()
      .input("userId", sql.Int, req.user.id)
      .query(`
        SELECT 
          t.*, 
          (SELECT TOP 1 SentAt FROM TicketMessages WHERE TicketId = t.Id ORDER BY SentAt DESC) AS LastActivity,
          (SELECT COUNT(*) FROM TicketMessages WHERE TicketId = t.Id) AS MessageCount
        FROM SupportTickets t
        WHERE t.UserId = @userId
        ORDER BY t.CreatedAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching tickets");
  }
}

/**
 * Get ticket details with messages
 */
async function getTicketDetails(req, res) {
  const ticketId = req.params.id;
  await poolConnect;
  try {
    // Check if user has access to this ticket (either owner or admin)
    const access = await pool.request()
      .input("ticketId", sql.Int, ticketId)
      .input("userId", sql.Int, req.user.id)
      .input("adminRoleId", sql.Int, 3) // Assuming 3 is admin role ID
      .query(`
        SELECT 1
        FROM SupportTickets
        WHERE Id = @ticketId AND (UserId = @userId OR @adminRoleId = (SELECT RoleId FROM WebUsers WHERE Id = @userId))
      `);
      
    if (!access.recordset[0]) {
      return res.status(403).send("Access denied to this ticket");
    }
    
    // Get ticket details
    const ticket = await pool.request()
      .input("id", sql.Int, ticketId)
      .query(`
        SELECT t.*, u.Username as UserName
        FROM SupportTickets t
        JOIN WebUsers u ON t.UserId = u.Id
        WHERE t.Id = @id
      `);

    if (!ticket.recordset[0]) return res.status(404).send("Ticket not found");

    // Get messages
    const messages = await pool.request()
      .input("ticketId", sql.Int, ticketId)
      .query(`
        SELECT 
          tm.*, 
          u.Username as SenderName
        FROM TicketMessages tm
        JOIN WebUsers u ON tm.SenderId = u.Id
        WHERE tm.TicketId = @ticketId
        ORDER BY tm.SentAt ASC
      `);

    res.json({ 
      ticket: ticket.recordset[0], 
      messages: messages.recordset 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading ticket");
  }
}

/**
 * Add reply to ticket
 */
async function addTicketReply(req, res) {
  const ticketId = req.params.id;
  const { message } = req.body;
  if (!message) return res.status(400).send("Message required");

  await poolConnect;
  try {
    // Check if user has access to this ticket
    const access = await pool.request()
      .input("ticketId", sql.Int, ticketId)
      .input("userId", sql.Int, req.user.id)
      .input("adminRoleId", sql.Int, 3) // Assuming 3 is admin role ID
      .query(`
        SELECT t.*, (SELECT RoleId FROM WebUsers WHERE Id = @userId) as UserRole
        FROM SupportTickets t
        WHERE Id = @ticketId AND (UserId = @userId OR (SELECT RoleId FROM WebUsers WHERE Id = @userId) = @adminRoleId)
      `);
      
    if (!access.recordset[0]) {
      return res.status(403).send("Access denied to this ticket");
    }
    
    const isAdmin = access.recordset[0].UserRole === 3;
    
    // Add message to ticket
    await pool.request()
      .input("ticketId", sql.Int, ticketId)
      .input("senderId", sql.Int, req.user.id)
      .input("message", sql.NVarChar, message)
      .input("isFromStaff", sql.Bit, isAdmin ? 1 : 0)
      .input("sentAt", sql.DateTime, new Date())
      .query(`
        INSERT INTO TicketMessages (TicketId, SenderId, Message, IsFromStaff, SentAt) 
        VALUES (@ticketId, @senderId, @message, @isFromStaff, @sentAt)
      `);
    
    // If ticket was closed and user replies, reopen it
    if (!isAdmin && access.recordset[0].Status === 'closed') {
      await pool.request()
        .input("ticketId", sql.Int, ticketId)
        .query(`UPDATE SupportTickets SET Status = 'open', ClosedAt = NULL WHERE Id = @ticketId`);
    }

    res.send("Message added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding message");
  }
}

module.exports = {
  createTicket,
  getUserTickets,
  getTicketDetails,
  addTicketReply
};
