/**
 * Token and Authentication Utility
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'delivery-app-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT Token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Hash Password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare Password
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate UUID
 */
const generateId = () => uuidv4();

/**
 * Sanitize User Object (remove sensitive data)
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password_hash, ...sanitized } = user;
  return sanitized;
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateId,
  sanitizeUser,
  JWT_SECRET
};
