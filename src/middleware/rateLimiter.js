const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Auth Routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
  },
  skipSuccessfulRequests: true,
});

/**
 * Create Account Rate Limiter
 */
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 accounts per hour per IP (increased for development)
  message: {
    success: false,
    error: {
      code: 'ACCOUNT_CREATION_LIMIT',
      message: 'Too many accounts created, please try again later',
    },
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  createAccountLimiter,
};
