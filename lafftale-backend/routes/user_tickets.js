// routes/user_tickets.js
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const { sql, webPool, webPoolConnect } = require("../db");

// GET all tickets of current user
router.get("/my", authenticateToken, async (req, res) => {
  await webPoolConnect;
  try {
    const result = await webPool.request()
      .input("userId", sql.Int, req.user.id)
      .query("SELECT * FROM SupportTickets WHERE UserId = @userId ORDER BY CreatedAt DESC");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching user tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// GET single ticket and messages
router.get("/:id", authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  await webPoolConnect;
  try {
    const ticketResult = await webPool.request()
      .input("id", sql.Int, ticketId)
      .input("userId", sql.Int, req.user.id)
      .query("SELECT * FROM SupportTickets WHERE Id = @id AND UserId = @userId");

    const ticket = ticketResult.recordset[0];
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const messagesResult = await webPool.request()
      .input("ticketId", sql.Int, ticketId)
      .query("SELECT * FROM TicketMessages WHERE TicketId = @ticketId ORDER BY SentAt ASC");

    res.json({ ...ticket, Messages: messagesResult.recordset });
  } catch (err) {
    console.error("Error loading ticket:", err);
    res.status(500).json({ error: "Failed to load ticket" });
  }
});

// POST new ticket + message
router.post("/", authenticateToken, async (req, res) => {
  const { subject, message, priority = "normal" } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: "Missing subject or message" });
  }

  await webPoolConnect;
  try {
    const ticketResult = await webPool.request()
      .input("userId", sql.Int, req.user.id)
      .input("subject", sql.NVarChar, subject)
      .input("priority", sql.NVarChar, priority)
      .query(`
        INSERT INTO SupportTickets (UserId, Subject, Priority, Status, CreatedAt)
        OUTPUT INSERTED.Id AS TicketId
        VALUES (@userId, @subject, @priority, 'open', GETDATE())
      `);

    const ticketId = ticketResult.recordset[0].TicketId;

    await webPool.request()
      .input("ticketId", sql.Int, ticketId)
      .input("senderId", sql.Int, req.user.id)
      .input("message", sql.NVarChar, message)
      .query(`
        INSERT INTO TicketMessages (TicketId, SenderId, Message, SentAt)
        VALUES (@ticketId, @senderId, @message, GETDATE())
      `);

    res.status(201).json({ message: "Ticket created", ticketId });
  } catch (err) {
    console.error("Error creating ticket:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST message to existing ticket
router.post("/:id/message", authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  await webPoolConnect;
  try {
    await webPool.request()
      .input("ticketId", sql.Int, ticketId)
      .input("senderId", sql.Int, req.user.id)
      .input("message", sql.NVarChar, message)
      .query("INSERT INTO TicketMessages (TicketId, SenderId, Message, SentAt) VALUES (@ticketId, @senderId, @message, GETDATE())");

    res.status(200).json({ message: "Message added" });
  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).json({ error: "Failed to add message" });
  }
});

module.exports = router;