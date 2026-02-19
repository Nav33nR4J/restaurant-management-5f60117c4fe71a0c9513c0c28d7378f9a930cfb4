/**
 * Authentication Middleware
 */
const { verifyToken } = require('../utils/auth');
const { WARNINGS } = require('../utils/warnings');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Verify JWT Token
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(WARNINGS.AUTH.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      throw new UnauthorizedError(WARNINGS.AUTH.TOKEN_INVALID);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication (doesn't fail if no token)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check Admin Role
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new UnauthorizedError(WARNINGS.AUTH.UNAUTHORIZED);
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin
};
