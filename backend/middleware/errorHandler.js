const fs = require('fs');
const path = require('path');

/**
 * Comprehensive error handling middleware
 */
class ErrorHandler {
  /**
   * Log error to file
   */
  static logError(error, req) {
    const timestamp = new Date().toISOString();
    const errorLog = {
      timestamp,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        status: error.status
      },
      request: {
        method: req.method,
        path: req.path,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        body: req.method === 'POST' ? this.sanitizeLogData(req.body) : undefined
      }
    };
    
    const errorLogPath = path.join(__dirname, '..', 'error.log');
    fs.appendFileSync(errorLogPath, JSON.stringify(errorLog) + '\n');
  }

  /**
   * Sanitize sensitive data from logs
   */
  static sanitizeLogData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'bankAccount'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  /**
   * Main error handling middleware
   */
  static handle(err, req, res, next) {
    // Log the error
    console.error('Error occurred:', err);
    ErrorHandler.logError(err, req);
    
    // Handle different types of errors
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: 'Invalid JSON format',
        message: 'Please check your request body format',
        code: 'INVALID_JSON'
      });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'Please upload a smaller file (max 5MB)',
        code: 'FILE_TOO_LARGE'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 2 files allowed',
        code: 'TOO_MANY_FILES'
      });
    }
    
    if (err.message === 'Only JPG, PNG, and PDF files are allowed') {
      return res.status(400).json({
        error: 'Invalid file type',
        message: err.message,
        code: 'INVALID_FILE_TYPE'
      });
    }
    
    // Database errors
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({
        error: 'Database constraint violation',
        message: 'The provided data violates database constraints',
        code: 'CONSTRAINT_VIOLATION'
      });
    }
    
    if (err.code === 'SQLITE_BUSY') {
      return res.status(503).json({
        error: 'Database temporarily unavailable',
        message: 'Please try again in a moment',
        code: 'DATABASE_BUSY'
      });
    }
    
    // Validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: err.message,
        details: err.details || [],
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Rate limiting errors
    if (err.status === 429) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please slow down and try again later',
        code: 'RATE_LIMITED'
      });
    }
    
    // Authentication/Authorization errors
    if (err.status === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      });
    }
    
    if (err.status === 403) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
        code: 'FORBIDDEN'
      });
    }
    
    // Not found errors
    if (err.status === 404) {
      return res.status(404).json({
        error: 'Not found',
        message: err.message || 'The requested resource was not found',
        code: 'NOT_FOUND'
      });
    }
    
    // Default error response
    const status = err.status || 500;
    const response = {
      error: status === 500 ? 'Internal server error' : err.message,
      message: status === 500 ? 'An unexpected error occurred' : err.message,
      code: err.code || 'INTERNAL_ERROR'
    };
    
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      response.stack = err.stack;
    }
    
    res.status(status).json(response);
  }

  /**
   * 404 handler for unknown routes
   */
  static notFound(req, res) {
    const error = {
      error: 'Route not found',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      path: req.originalUrl,
      method: req.method,
      code: 'ROUTE_NOT_FOUND'
    };
    
    // Log 404 attempts
    console.warn(`404 - ${req.method} ${req.originalUrl} from IP ${req.ip}`);
    
    res.status(404).json(error);
  }

  /**
   * Async error wrapper
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

module.exports = ErrorHandler;