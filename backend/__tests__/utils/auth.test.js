/**
 * Unit Tests for Auth Utility
 */
const {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateId,
  sanitizeUser,
} = require('../../src/utils/auth');

describe('Auth Utility', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { id: '123', email: 'test@example.com' };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should generate token with correct payload', () => {
      const payload = { id: '123', email: 'test@example.com' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded.id).toBe('123');
      expect(decoded.email).toBe('test@example.com');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { id: '123', email: 'test@example.com' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe('123');
    });

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid-token');
      expect(result).toBeNull();
    });

    it('should return null for tampered token', () => {
      const payload = { id: '123' };
      const token = generateToken(payload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      expect(verifyToken(tamperedToken)).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Due to random salt
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      
      const result = await comparePassword('wrongPassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)).toBeTruthy();
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove password_hash from user object', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'secret_hash',
      };
      
      const sanitized = sanitizeUser(user);
      
      expect(sanitized).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(sanitized.password_hash).toBeUndefined();
    });

    it('should return null for null input', () => {
      const result = sanitizeUser(null);
      expect(result).toBeNull();
    });

    it('should return empty object for undefined input', () => {
      const result = sanitizeUser(undefined);
      expect(result).toBeNull();
    });

    it('should handle user without password_hash', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
      };
      
      const sanitized = sanitizeUser(user);
      
      expect(sanitized).toEqual(user);
    });
  });
});

