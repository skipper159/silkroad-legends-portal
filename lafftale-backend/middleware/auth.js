const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Removes 'Bearer '

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.user = user; // contains id, role, username (from the login token)
    next();
  });
}

// Alias for verifyToken
const verifyToken = authenticateToken;

// Admin verification middleware
function verifyAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Check if user has admin privileges (using isAdmin boolean from token)
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  next();
}

module.exports = {
  authenticateToken,
  verifyToken,
  verifyAdmin,
};
