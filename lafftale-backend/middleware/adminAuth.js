const jwt = require('jsonwebtoken');
const { webPool, webPoolConnect, sql } = require('../db');

async function adminAuth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user has admin role
    await webPoolConnect;
    const userRole = await webPool.request().input('userId', sql.Int, decoded.id).query(`
        SELECT wu.RoleId, r.Name as RoleName, ur.is_admin
        FROM WebUsers wu
        LEFT JOIN Roles r ON wu.RoleId = r.Id
        LEFT JOIN user_roles ur ON wu.Id = ur.user_id
        WHERE wu.Id = @userId
      `);

    if (!userRole.recordset[0]) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userRole.recordset[0];

    // Check if user is admin (either by Role or user_roles table)
    if (user.RoleName !== 'Admin' && !user.is_admin) {
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
