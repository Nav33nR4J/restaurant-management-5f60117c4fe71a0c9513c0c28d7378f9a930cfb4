/**
 * Auth Saga Service - Saga pattern for authentication operations
 * 
 * Operations:
 * 1. Register - Register new user with validation
 * 2. Update Profile - Update user profile
 */
const { pool } = require('../config/database');
const { generateId, generateToken, hashPassword, sanitizeUser } = require('../utils/auth');
const { createSaga } = require('./sagaOrchestrator');
const { WARNINGS } = require('../utils/warnings');

/**
 * Register User Saga
 */
const register = async (payload) => {
  const { name, email, phone, password } = payload;
  const sagaId = generateId();

  // Validate password
  const validatePassword = async (p) => {
    if (!p.password || p.password.length < 8) {
      throw new Error(WARNINGS.AUTH.WEAK_PASSWORD);
    }
    return { success: true, data: { password_valid: true } };
  };

  const compensateValidatePassword = async () => ({ success: true });

  // Check for duplicate email
  const checkDuplicate = async (p) => {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [p.email]
    );
    if (existing.length > 0) {
      throw new Error(WARNINGS.AUTH.USER_EXISTS);
    }
    return { success: true, data: { email: p.email } };
  };

  const compensateCheckDuplicate = async () => ({ success: true });

  // Create user
  const createUser = async (p) => {
    const id = generateId();
    const passwordHash = await hashPassword(p.password);

    await pool.execute(
      'INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
      [id, p.name, p.email, p.phone || null, passwordHash]
    );

    const token = generateToken({ id, email: p.email, role: 'customer' });

    return {
      success: true,
      data: { user: { id, name: p.name, email: p.email, role: 'customer' }, token },
      compensation: { user_id: id }
    };
  };

  const compensateCreateUser = async (compData) => {
    if (compData.user_id) {
      await pool.execute('DELETE FROM users WHERE id = ?', [compData.user_id]);
    }
    return { success: true, message: 'User deleted' };
  };

  const saga = createSaga('auth_register', sagaId)
    .addStep('validate_password', validatePassword, compensateValidatePassword, payload)
    .addStep('check_duplicate', checkDuplicate, compensateCheckDuplicate, { dependsOn: 'validate_password' })
    .addStep('create_user', createUser, compensateCreateUser, { dependsOn: 'check_duplicate' });

  return await saga.execute(payload);
};

/**
 * Update Profile Saga
 */
const updateProfile = async (payload) => {
  const { userId, name, phone } = payload;
  const sagaId = generateId();

  // Get current user state
  const getCurrentState = async (p) => {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [p.userId]);
    if (users.length === 0) {
      throw new Error('User not found');
    }
    return {
      success: true,
      data: { current: users[0] },
      compensation: { userId: p.userId, original: users[0] }
    };
  };

  const compensateGetCurrentState = async () => ({ success: true });

  // Update profile
  const updateProfileDB = async (p) => {
    const updates = [];
    const params = [];

    if (p.name) { updates.push('name = ?'); params.push(p.name); }
    if (p.phone !== undefined) { updates.push('phone = ?'); params.push(p.phone); }

    if (updates.length > 0) {
      params.push(p.userId);
      await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.execute('SELECT * FROM users WHERE id = ?', [p.userId]);

    return {
      success: true,
      data: { user: sanitizeUser(updated[0]) },
      compensation: { userId: p.userId }
    };
  };

  const compensateUpdateProfile = async (compData) => {
    const orig = compData.original;
    if (orig) {
      await pool.execute(
        'UPDATE users SET name = ?, phone = ? WHERE id = ?',
        [orig.name, orig.phone, compData.userId]
      );
    }
    return { success: true, message: 'Profile restored' };
  };

  const saga = createSaga('auth_update_profile', sagaId)
    .addStep('get_current_state', getCurrentState, compensateGetCurrentState, payload)
    .addStep('update_profile', updateProfileDB, compensateUpdateProfile, { dependsOn: 'get_current_state' });

  return await saga.execute(payload);
};

module.exports = {
  register,
  updateProfile
};
