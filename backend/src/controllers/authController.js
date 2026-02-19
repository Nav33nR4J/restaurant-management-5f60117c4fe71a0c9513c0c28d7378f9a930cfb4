/**
 * Auth Controller - Business Logic
 */
const { pool } = require('../config/database');
const { generateId, generateToken, hashPassword, comparePassword, sanitizeUser } = require('../utils/auth');
const { WARNINGS } = require('../utils/warnings');
const { NotFoundError, ValidationError, UnauthorizedError } = require('../utils/errors');
const { successResponse, createdResponse } = require('../utils/response');

/**
 * Register User
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Name, email, and password are required'));
    }

    if (password.length < 8) {
      throw new ValidationError(WARNINGS.AUTH.WEAK_PASSWORD);
    }

    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      throw new ValidationError(WARNINGS.AUTH.USER_EXISTS);
    }

    const id = generateId();
    const passwordHash = await hashPassword(password);

    await pool.execute(
      'INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, phone || null, passwordHash]
    );

    const token = generateToken({ id, email, role: 'customer' });

    return createdResponse(res, {
      user: { id, name, email, role: 'customer' },
      token
    }, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError(WARNINGS.GENERAL.BAD_REQUEST('Email and password are required'));
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      throw new UnauthorizedError(WARNINGS.AUTH.INVALID_CREDENTIALS);
    }

    const user = users[0];
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedError(WARNINGS.AUTH.INVALID_CREDENTIALS);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return successResponse(res, {
      user: sanitizeUser(user),
      token
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError(WARNINGS.AUTH.UNAUTHORIZED);
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      throw new NotFoundError(WARNINGS.GENERAL.NOT_FOUND('User'));
    }

    return successResponse(res, sanitizeUser(users[0]));
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { name, phone } = req.body;

    if (!userId) {
      throw new UnauthorizedError(WARNINGS.AUTH.UNAUTHORIZED);
    }

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }

    if (updates.length > 0) {
      params.push(userId);
      await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    return successResponse(res, sanitizeUser(users[0]), 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
const logout = async (req, res, next) => {
  try {
    // In a stateless JWT setup, logout is handled client-side
    // For token blacklisting, you would implement it here
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout
};
