const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authentication
 * @param {String} id - User or Admin ID
 * @param {String} role - 'user' or 'admin'
 * @returns {String} JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = generateToken;

