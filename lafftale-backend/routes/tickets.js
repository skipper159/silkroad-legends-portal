
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");
const authenticateToken = require("../middleware/auth");

// Create a new ticket
router.post("/", authenticateToken, async (req, res) => {
  const { subject, message, priority } = req.body;
  if (!subject || !message) return res.status(400).send("Missing fields");

  await poolConnect;
  try {
    const result = await pool.request()
      .input("userId", sql.Int, req.user.id)
      .input("subject", sql.NVarChar, subject)
      .input("priority", sql.NVarChar, priority || 'normal')
      .query(`INSERT INTO SupportTickets (UserId, Subject, Priority) OUTPUT INSERTED.Id VALUES (@userId, @subject, @priority)`);

    const ticketId = result.recordset[0].Id;

    await pool.request()
      .input("ticketId", sql.Int, ticketId)
      .input("senderId", sql.Int, req.user.id)
      .input("message", sql.NVarChar, message)
      .input("isFromStaff", sql.Bit, 0)
      .query(`INSERT INTO TicketMessages (TicketId, SenderId, Message, IsFromStaff) VALUES (@ticketId, @senderId, @message, @isFromStaff)`);

    res.status(201).send("Ticket created");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating ticket");
  }
});

// Get user's tickets
router.get("/my", authenticateToken, async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request()
      .input("userId", sql.Int, req.user.id)
      .query("SELECT * FROM SupportTickets WHERE UserId = @userId ORDER BY CreatedAt DESC");

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching tickets");
  }
});

// Get ticket details with messages
router.get("/:id", authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  await poolConnect;
  try {
    const ticket = await pool.request()
      .input("id", sql.Int, ticketId)
      .query("SELECT * FROM SupportTickets WHERE Id = @id");

    if (!ticket.recordset[0]) return res.status(404).send("Ticket not found");

    const messages = await pool.request()
      .input("ticketId", sql.Int, ticketId)
      .query("SELECT * FROM TicketMessages WHERE TicketId = @ticketId ORDER BY SentAt ASC");

    res.json({ ticket: ticket.recordset[0], messages: messages.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading ticket");
  }
});

// Add a message to an existing ticket
router.post("/:id/message", authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const { message } = req.body;
  if (!message) return res.status(400).send("Message required");

  await poolConnect;
  try {
    await pool.request()
      .input("ticketId", sql.Int, ticketId)
      .input("senderId", sql.Int, req.user.id)
      .input("message", sql.NVarChar, message)
      .input("isFromStaff", sql.Bit, 0)
      .query(`INSERT INTO TicketMessages (TicketId, SenderId, Message, IsFromStaff) VALUES (@ticketId, @senderId, @message, @isFromStaff)`);

    res.send("Message added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding message");
  }
});

module.exports = router;
