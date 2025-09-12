/**
 * Error Handling Utilities
 * Enterprise-grade error handling and logging
 */

import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/index.js';
import { ERROR_CONFIG } from '../config/index.js';

/**
 * Custom Error Classes
 */
export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = 'GENERIC_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message, HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = ERROR_MESSAGES.TOKEN_EXPIRED) {
    super(message, HTTP_STATUS.UNAUTHORIZED, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = ERROR_MESSAGES.PERMISSION_DENIED) {
    super(message, HTTP_STATUS.FORBIDDEN, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NetworkError extends AppError {
  constructor(message = ERROR_MESSAGES.NETWORK_ERROR) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

/**
 * Error Logger Class
 */
class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
  }
  
  log(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    // Add to local error log
    this.errors.unshift(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }
    
    // Console logging based on environment
    if (process.env.NODE_ENV === 'development') {
      console.error('🔥 Error:', errorEntry);
    }
    
    // Send to external error tracking service in production
    if (ERROR_CONFIG.ENABLE_CRASH_REPORTING && ERROR_CONFIG.SENTRY_DSN) {
      this.sendToErrorService(errorEntry);
    }
    
    return errorEntry;
  }
  
  sendToErrorService(errorEntry) {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just prepare the data structure
    try {
      // Example Sentry integration structure
      const sentryData = {
        message: errorEntry.message,
        level: 'error',
        tags: {
          code: errorEntry.code,
          statusCode: errorEntry.statusCode,
        },
        extra: errorEntry.context,
        fingerprint: [errorEntry.code, errorEntry.message],
      };
      
      // In a real implementation, you would send this to Sentry
      console.log('Would send to Sentry:', sentryData);
    } catch (err) {
      console.error('Failed to send error to tracking service:', err);
    }
  }
  
  getErrors() {
    return this.errors;
  }
  
  clearErrors() {
    this.errors = [];
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();

/**
 * Handles API errors and converts them to appropriate error types
 * @param {Error} error - The error to handle
 * @param {object} context - Additional context
 * @returns {AppError} Processed error
 */
export const handleApiError = (error, context = {}) => {
  let processedError;
  
  if (error.response) {
    // API responded with error status
    const { status, data } = error.response;
    const message = data?.message || data?.error || ERROR_MESSAGES.SERVER_ERROR;
    
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        processedError = new ValidationError(message, data?.errors);
        break;
      case HTTP_STATUS.UNAUTHORIZED:
        processedError = new AuthenticationError(message);
        break;
      case HTTP_STATUS.FORBIDDEN:
        processedError = new AuthorizationError(message);
        break;
      case HTTP_STATUS.NOT_FOUND:
        processedError = new NotFoundError(message);
        break;
      default:
        processedError = new AppError(message, status);
    }
  } else if (error.request) {
    // Network error - no response received
    processedError = new NetworkError();
  } else {
    // Something else happened
    processedError = new AppError(
      error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG
    );
  }
  
  errorLogger.log(processedError, context);
  return processedError;
};

/**
 * Global error handler for unhandled errors
 * @param {Error} error - The unhandled error
 * @param {object} context - Additional context
 */
export const handleGlobalError = (error, context = {}) => {
  const processedError = error instanceof AppError ? error : new AppError(
    error.message || ERROR_MESSAGES.SOMETHING_WENT_WRONG
  );
  
  errorLogger.log(processedError, {
    ...context,
    type: 'global',
  });
  
  // In production, you might want to show a user-friendly error message
  if (process.env.NODE_ENV === 'production') {
    // Show toast notification or modal
    console.error('An unexpected error occurred');
  }
  
  return processedError;
};

/**
 * Error boundary error handler
 * @param {Error} error - The error from error boundary
 * @param {object} errorInfo - Error info from React
 */
export const handleBoundaryError = (error, errorInfo) => {
  const processedError = new AppError(
    `Component Error: ${error.message}`,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    'COMPONENT_ERROR'
  );
  
  errorLogger.log(processedError, {
    type: 'boundary',
    componentStack: errorInfo.componentStack,
  });
  
  return processedError;
};

/**
 * Retry mechanism for failed operations
 * @param {Function} operation - The operation to retry
 * @param {number} maxAttempts - Maximum retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} Result of the operation
 */
export const withRetry = async (operation, maxAttempts = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        break;
      }
      
      // Don't retry certain errors
      if (error instanceof AuthenticationError || 
          error instanceof AuthorizationError ||
          error instanceof ValidationError) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw handleApiError(lastError, { retryAttempts: maxAttempts });
};

/**
 * Safe async operation wrapper
 * @param {Function} operation - The async operation
 * @param {any} fallbackValue - Value to return on error
 * @returns {Promise} Result or fallback value
 */
export const safeAsync = async (operation, fallbackValue = null) => {
  try {
    return await operation();
  } catch (error) {
    errorLogger.log(error, { type: 'safe-async' });
    return fallbackValue;
  }
};

/**
 * Debounced error handler to prevent error spam
 */
class DebouncedErrorHandler {
  constructor(delay = 1000) {
    this.delay = delay;
    this.timeouts = new Map();
  }
  
  handle(errorKey, error, handler) {
    if (this.timeouts.has(errorKey)) {
      clearTimeout(this.timeouts.get(errorKey));
    }
    
    const timeout = setTimeout(() => {
      handler(error);
      this.timeouts.delete(errorKey);
    }, this.delay);
    
    this.timeouts.set(errorKey, timeout);
  }
}

export const debouncedErrorHandler = new DebouncedErrorHandler();

/**
 * Get user-friendly error message
 * @param {Error} error - The error to get message for
 * @returns {string} User-friendly message
 */
export const getUserFriendlyMessage = error => {
  if (error instanceof ValidationError) {
    return error.message;
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please log in to continue';
  }
  
  if (error instanceof AuthorizationError) {
    return 'You don\'t have permission to perform this action';
  }
  
  if (error instanceof NetworkError) {
    return 'Please check your internet connection and try again';
  }
  
  if (error instanceof NotFoundError) {
    return 'The requested item could not be found';
  }
  
  // Generic fallback
  return 'Something went wrong. Please try again';
};

/**
 * Error reporting for analytics
 * @param {Error} error - The error to report
 * @param {object} context - Additional context
 */
export const reportError = (error, context = {}) => {
  // This would integrate with analytics services
  const errorData = {
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    timestamp: Date.now(),
    context,
  };
  
  // Example: Google Analytics, Mixpanel, etc.
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: error.message,
      fatal: false,
    });
  }
  
  console.log('Error reported to analytics:', errorData);
};

export { errorLogger };

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  NotFoundError,
  handleApiError,
  handleGlobalError,
  handleBoundaryError,
  withRetry,
  safeAsync,
  debouncedErrorHandler,
  getUserFriendlyMessage,
  reportError,
  errorLogger,
};
