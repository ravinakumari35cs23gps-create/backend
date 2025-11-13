const { verifyAccessToken } = require('../utils/jwt');
const { AuthenticationError, AuthorizationError } = require('../utils/errors');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database with tokenVersion
    const user = await User.findById(decoded.userId).select('-passwordHash -refreshToken +tokenVersion');

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Check if token version matches (revocation check)
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AuthenticationError('Token has been revoked. Please login again.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: error.message,
        },
      });
    }
    
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
  }
};

/**
 * Authorization Middleware
 * Checks if user has required role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Access denied. Insufficient permissions.',
        },
      });
    }

    next();
  };
};

/**
 * Optional Authentication
 * Attaches user if token is present, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password -refreshToken');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
