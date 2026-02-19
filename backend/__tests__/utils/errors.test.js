/**
 * Unit Tests for Error Handling Utility
 */
const {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  handleError,
} = require('../../src/utils/errors');

describe('Error Handling Utility', () => {
  describe('AppError', () => {
    it('should create an AppError with default status code', () => {
      const error = new AppError({ code: 'TEST001', message: 'Test error' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error.errorCode).toBe('TEST001');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError({ code: 'TEST002', message: 'Test error' }, 500);
      
      expect(error.statusCode).toBe(500);
    });

    it('should create an AppError with function parameter', () => {
      const error = new AppError(() => ({ code: 'TEST003', message: 'Function error' }));
      
      expect(error.errorCode).toBe('TEST003');
      expect(error.message).toBe('Function error');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with status 400', () => {
      const error = new ValidationError({ code: 'VAL001', message: 'Validation failed' });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with status 404', () => {
      const error = new NotFoundError({ code: 'NOT001', message: 'Resource not found' });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError with status 401', () => {
      const error = new UnauthorizedError({ code: 'AUTH001', message: 'Unauthorized' });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });
  });

  describe('ForbiddenError', () => {
    it('should create a ForbiddenError with status 403', () => {
      const error = new ForbiddenError({ code: 'FORBIDDEN', message: 'Forbidden' });
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });
  });

  describe('handleError', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      mockNext = jest.fn();
    });

    it('should handle operational errors in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new AppError({ code: 'TEST', message: 'Test error' }, 404);
      
      handleError(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Test error',
        errorCode: 'TEST',
      });
      process.env.NODE_ENV = 'test';
    });

    it('should handle non-operational errors in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Non-operational error');
      error.statusCode = 500;
      
      handleError(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong',
        errorCode: 'GEN002',
      });
      process.env.NODE_ENV = 'test';
    });

    it('should return full error details in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new AppError({ code: 'DEV001', message: 'Dev error' }, 400);
      
      handleError(error, mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'error',
        error: error,
        message: 'Dev error',
        errorCode: 'DEV001',
      });
      process.env.NODE_ENV = 'test';
    });
  });
});

