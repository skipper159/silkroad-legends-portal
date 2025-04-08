
const bcrypt = require("bcryptjs");

/**
 * Hashes a password
 * @param {string} password - The plain text password
 * @returns {Promise<string>} The hashed password
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compares a password with a hash
 * @param {string} password - The plain text password
 * @param {string} hash - The hashed password
 * @returns {Promise<boolean>} True if password matches hash
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};
