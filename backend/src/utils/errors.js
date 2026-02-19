/**
 * Error Handling Utility
 */
class AppError extends Error {
  constructor(warning, statusCode = 400) {
    const { code, message } = typeof warning === 'function' ? warning() : warning;
    super(message);
    this.statusCode = statusCode;
    this.errorCode = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(warning) {
    super(warning, 400);
  }
}

class NotFoundError extends AppError {
  constructor(warning) {
    super(warning, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(warning) {
    super(warning, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(warning) {
    super(warning, 403);
  }
}

const handleError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      errorCode: err.errorCode
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errorCode: err.errorCode
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
        errorCode: 'GEN002'
      });
    }
  }
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  handleError
};
