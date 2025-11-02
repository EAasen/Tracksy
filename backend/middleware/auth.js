/**
 * Authentication Middleware
 * JWT-based authentication for protected routes
 */

const jwt = require('jsonwebtoken');
const { APIError } = require('./errorHandler');
const { User } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new APIError('No authorization token provided', 401, 'NO_TOKEN');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      throw new APIError('Invalid authorization format', 401, 'INVALID_TOKEN_FORMAT');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new APIError('Invalid authentication token', 401, 'INVALID_TOKEN'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new APIError('Authentication token has expired', 401, 'TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check if user has admin role
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new APIError('Authentication required', 401, 'NOT_AUTHENTICATED'));
  }

  if (req.user.role !== 'admin') {
    return next(new APIError('Admin access required', 403, 'FORBIDDEN'));
  }

  next();
};

/**
 * Middleware to check for specific role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new APIError('Authentication required', 401, 'NOT_AUTHENTICATED'));
    }

    if (req.user.role !== role) {
      return next(new APIError(`Role '${role}' required`, 403, 'FORBIDDEN'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  isAdmin,
  requireRole
};
