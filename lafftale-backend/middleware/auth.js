const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Entfernt 'Bearer '
  if (!token) return res.status(401).send("Access denied. No token provided.");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid or expired token");
    
    req.user = user; // enthält id, role, username (aus dem Login-Token)
    next();
  });
}

module.exports = authenticateToken;