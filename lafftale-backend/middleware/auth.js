const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Removes 'Bearer '
  if (!token) return res.status(401).send("Access denied. No token provided.");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {    if (err) return res.status(403).send("Invalid or expired token");
    
    req.user = user; // contains id, role, username (from the login token)
    next();
  });
}

module.exports = authenticateToken;