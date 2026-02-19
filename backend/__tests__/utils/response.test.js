/**
 * Unit Tests for Response Utility
 */
const {
  successResponse,
  createdResponse,
  paginatedResponse,
  errorResponse,
} = require('../../src/utils/response');

describe('Response Utility', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('successResponse', () => {
    it('should return a success response with default values', () => {
      const data = { id: 1, name: 'Test' };
      successResponse(mockRes, data);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: data,
      });
    });

    it('should return a success response with custom message', () => {
      const data = { id: 1 };
      const message = 'Operation successful';
      successResponse(mockRes, data, message);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: message,
        data: data,
      });
    });

    it('should return a success response with custom status code', () => {
      const data = { id: 1 };
      successResponse(mockRes, data, 'OK', 201);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('createdResponse', () => {
    it('should return a created response with status 201', () => {
      const data = { id: 1, name: 'New Item' };
      createdResponse(mockRes, data);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created successfully',
        data: data,
      });
    });

    it('should return a created response with custom message', () => {
      const data = { id: 1 };
      createdResponse(mockRes, data, 'Item created');
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Item created',
        data: data,
      });
    });
  });

  describe('paginatedResponse', () => {
    it('should return a paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const page = 1;
      const limit = 10;
      const total = 25;
      
      paginatedResponse(mockRes, data, page, limit, total);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3,
        },
      });
    });

    it('should calculate pages correctly', () => {
      const data = [];
      paginatedResponse(mockRes, data, 1, 10, 0);
      
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            pages: 0,
          }),
        })
      );
    });
  });

  describe('errorResponse', () => {
    it('should return an error response with default values', () => {
      const message = 'Error occurred';
      errorResponse(mockRes, message);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        errorCode: null,
      });
    });

    it('should return an error response with custom status code', () => {
      const message = 'Not found';
      errorResponse(mockRes, message, 404);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return an error response with error code', () => {
      const message = 'Validation error';
      const errorCode = 'VAL001';
      errorResponse(mockRes, message, 400, errorCode);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: message,
        errorCode: errorCode,
      });
    });
  });
});

