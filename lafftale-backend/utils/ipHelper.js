/**
 * Utility functions for extracting real client IP addresses
 * Handles various proxy configurations (nginx, cloudflare, etc.)
 */

/**
 * Extract real client IP from request headers
 * Prioritizes X-Forwarded-For, X-Real-IP, and CF-Connecting-IP headers
 * @param {Object} req - Express request object
 * @returns {string} - Real client IP address
 */
function getRealClientIP(req) {
  // Priority order for IP extraction:
  // 1. X-Forwarded-For (most common proxy header)
  // 2. X-Real-IP (nginx specific)
  // 3. CF-Connecting-IP (Cloudflare)
  // 4. X-Client-IP (some proxies)
  // 5. X-Cluster-Client-IP (cluster configurations)
  // 6. Forwarded (RFC 7239 standard)
  // 7. req.ip (Express default)
  // 8. req.connection.remoteAddress (fallback)

  let clientIP = null;

  // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
  // The first IP is usually the real client IP
  if (req.headers['x-forwarded-for']) {
    const forwardedIPs = req.headers['x-forwarded-for'].split(',');
    clientIP = forwardedIPs[0].trim();
  }

  // X-Real-IP (single IP, commonly used by nginx)
  else if (req.headers['x-real-ip']) {
    clientIP = req.headers['x-real-ip'].trim();
  }

  // CF-Connecting-IP (Cloudflare)
  else if (req.headers['cf-connecting-ip']) {
    clientIP = req.headers['cf-connecting-ip'].trim();
  }

  // X-Client-IP
  else if (req.headers['x-client-ip']) {
    clientIP = req.headers['x-client-ip'].trim();
  }

  // X-Cluster-Client-IP
  else if (req.headers['x-cluster-client-ip']) {
    clientIP = req.headers['x-cluster-client-ip'].trim();
  }

  // Forwarded header (RFC 7239)
  else if (req.headers['forwarded']) {
    const forwardedHeader = req.headers['forwarded'];
    const forMatch = forwardedHeader.match(/for=([^;,\s]+)/);
    if (forMatch && forMatch[1]) {
      clientIP = forMatch[1].replace(/"/g, '');
      // Remove IPv6 brackets and port if present
      clientIP = clientIP.replace(/^\[?([^\]]+)\]?:\d+$/, '$1');
    }
  }

  // Express default
  else if (req.ip) {
    clientIP = req.ip;
  }

  // Connection fallback
  else if (req.connection && req.connection.remoteAddress) {
    clientIP = req.connection.remoteAddress;
  }

  // Socket fallback
  else if (req.socket && req.socket.remoteAddress) {
    clientIP = req.socket.remoteAddress;
  }

  // Final fallback
  else {
    clientIP = '127.0.0.1';
  }

  // Clean up IPv6-mapped IPv4 addresses (::ffff:192.168.1.1 -> 192.168.1.1)
  if (clientIP && clientIP.startsWith('::ffff:')) {
    clientIP = clientIP.substring(7);
  }

  // Validate IP format (basic check)
  if (clientIP && !isValidIP(clientIP)) {
    console.warn(`Invalid IP detected: ${clientIP}, falling back to 127.0.0.1`);
    clientIP = '127.0.0.1';
  }

  return clientIP || '127.0.0.1';
}

/**
 * Basic IP validation (IPv4 and IPv6)
 * @param {string} ip - IP address to validate
 * @returns {boolean} - True if IP is valid
 */
function isValidIP(ip) {
  if (!ip || typeof ip !== 'string') return false;

  // IPv4 regex
  const ipv4Regex =
    /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Get client IP with debug information
 * Useful for troubleshooting proxy configurations
 * @param {Object} req - Express request object
 * @returns {Object} - IP and debug info
 */
function getRealClientIPWithDebug(req) {
  const headers = {
    'x-forwarded-for': req.headers['x-forwarded-for'],
    'x-real-ip': req.headers['x-real-ip'],
    'cf-connecting-ip': req.headers['cf-connecting-ip'],
    'x-client-ip': req.headers['x-client-ip'],
    'x-cluster-client-ip': req.headers['x-cluster-client-ip'],
    forwarded: req.headers['forwarded'],
  };

  const fallbacks = {
    'req.ip': req.ip,
    'req.connection.remoteAddress': req.connection?.remoteAddress,
    'req.socket.remoteAddress': req.socket?.remoteAddress,
  };

  const realIP = getRealClientIP(req);

  return {
    realIP,
    headers,
    fallbacks,
    used: getRealClientIPSource(req),
  };
}

/**
 * Get the source of the detected IP
 * @param {Object} req - Express request object
 * @returns {string} - Source name
 */
function getRealClientIPSource(req) {
  if (req.headers['x-forwarded-for']) return 'x-forwarded-for';
  if (req.headers['x-real-ip']) return 'x-real-ip';
  if (req.headers['cf-connecting-ip']) return 'cf-connecting-ip';
  if (req.headers['x-client-ip']) return 'x-client-ip';
  if (req.headers['x-cluster-client-ip']) return 'x-cluster-client-ip';
  if (req.headers['forwarded']) return 'forwarded';
  if (req.ip) return 'req.ip';
  if (req.connection?.remoteAddress) return 'req.connection.remoteAddress';
  if (req.socket?.remoteAddress) return 'req.socket.remoteAddress';
  return 'fallback';
}

module.exports = {
  getRealClientIP,
  getRealClientIPWithDebug,
  getRealClientIPSource,
  isValidIP,
};
