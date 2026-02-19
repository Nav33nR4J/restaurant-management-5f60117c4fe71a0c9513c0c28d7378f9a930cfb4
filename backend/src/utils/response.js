/**
 * Standardized Response Utility
 */

/**
 * Success Response
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Created Response
 */
const createdResponse = (res, data, message = 'Created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * Paginated Response
 */
const paginatedResponse = (res, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
};

/**
 * Error Response
 */
const errorResponse = (res, message, statusCode = 400, errorCode = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode
  });
};

module.exports = {
  successResponse,
  createdResponse,
  paginatedResponse,
  errorResponse
};
