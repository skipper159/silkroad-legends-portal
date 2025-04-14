
const express = require("express");
const router = express.Router();
const { webPool, webPoolConnect, sql } = require("../db");
const authenticateToken = require("../middleware/auth");

// Admin-only middleware
function isAdmin(req, res, next) {
  if (req.user.role !== 3) return res.status(403).send("Access denied"); // RoleId 3 = Admin
  next();
}

// Get all open tickets WITH username
router.get("/tickets/open", authenticateToken, isAdmin, async (req, res) => {
  await webPoolConnect;
  try {
    const result = await webPool.request().query(`
      SELECT 
        T.Id, T.UserId, T.Subject, T.Priority, T.Status, T.CreatedAt,
        U.Username
      FROM SupportTickets T
      JOIN WebUsers U ON T.UserId = U.Id
      WHERE T.Status = 'open'
      ORDER BY T.CreatedAt ASC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading open tickets");
  }
});

// Close a ticket
router.put("/tickets/:id/close", authenticateToken, isAdmin, async (req, res) => {
  const ticketId = req.params.id;
  await webPoolConnect;
  try {
    await webPool.request()
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
