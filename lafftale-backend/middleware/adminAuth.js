const jwt = require('jsonwebtoken');
const { getWebDb, sql } = require('../db');

async function adminAuth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user has admin role using the correct database connection and table name
    const pool = await getWebDb();
    const userRole = await pool.request().input('userId', sql.BigInt, decoded.id).query(`
        SELECT u.id, u.username, ISNULL(ur.is_admin, 0) as is_admin
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        WHERE u.id = @userId
      `);

    if (!userRole.recordset[0]) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userRole.recordset[0];

    // Check if user is admin (using user_roles table)
    if (!user.is_admin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Admin auth error:', err);
    res.status(400).json({ error: 'Invalid token.' });
  }
}

module.exports = adminAuth;

module.exports = adminAuth;
