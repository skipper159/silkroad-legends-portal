
const express = require("express");
const router = express.Router();
const { pool, poolConnect, sql } = require("../db");
const authenticateToken = require("../middleware/auth");

// Admin-only middleware
function isAdmin(req, res, next) {
  if (req.user.role !== 3) return res.status(403).send("Access denied"); // RoleId 3 = Admin
  next();
}

// Get all open tickets
router.get("/tickets/open", authenticateToken, isAdmin, async (req, res) => {
  await poolConnect;
  try {
    const result = await pool.request()
      .query("SELECT * FROM SupportTickets WHERE Status = 'open' ORDER BY CreatedAt ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading open tickets");
  }
});

// Close a ticket
router.put("/tickets/:id/close", authenticateToken, isAdmin, async (req, res) => {
  const ticketId = req.params.id;
  await poolConnect;
  try {
    await pool.request()
      .input("id", sql.Int, ticketId)
      .input("closedAt", sql.DateTime, new Date())
      .query("UPDATE SupportTickets SET Status = 'closed', ClosedAt = @closedAt WHERE Id = @id");
    res.send("Ticket closed");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error closing ticket");
  }
});

module.exports = router;
