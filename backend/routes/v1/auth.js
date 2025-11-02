/**
 * Authentication Routes (API v1)
 * Handles user signup, login, password reset, email verification, OAuth, etc.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { User, Token } = require('../../config/database');
const { APIError, asyncHandler } = require('../../middleware/errorHandler');
const { validate } = require('../../middleware/validator');
const logger = require('../../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later'
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts, please try again later'
});

// Validation schemas
const signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(100).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('user', 'admin').optional()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const passwordRequestSchema = Joi.object({
  email: Joi.string().email().required()
});

const passwordResetSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required()
});

const emailVerifySchema = Joi.object({
  token: Joi.string().required()
});

/**
 * POST /signup
 * Register a new user
 */
router.post('/signup', authLimiter, asyncHandler(async (req, res) => {
  const { value, error } = signupSchema.validate(req.body);
  if (error) {
    throw new APIError(error.details[0].message, 400, 'VALIDATION_ERROR');
  }

  const { username, password, email, role } = value;

  // Check if user already exists
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    throw new APIError('Username or email already exists', 409, 'DUPLICATE_USER');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = new User({
    username,
    password: hashedPassword,
    email,
    role: role || 'user'
  });
  await user.save();

  // Create email verification token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await new Token({
    userId: user._id,
    purpose: 'email_verification',
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
  }).save();

  // Issue JWT
  const accessToken = jwt.sign(
    { id: user._id, username, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Create refresh token
  const rawRefresh = crypto.randomBytes(40).toString('hex');
  const refreshHash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
  await new Token({
    userId: user._id,
    purpose: 'refresh',
    tokenHash: refreshHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
  }).save();

  logger.info(`New user registered: ${username}`, { requestId: req.requestId });

  res.status(201).json({
    message: 'User created. Please verify your email.',
    accessToken,
    refreshToken: rawRefresh,
    emailVerificationToken: rawToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified
    }
  });
}));

/**
 * POST /login
 * Authenticate user and return tokens
 */
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { value, error } = loginSchema.validate(req.body);
  if (error) {
    throw new APIError(error.details[0].message, 400, 'VALIDATION_ERROR');
  }

  const { username, password } = value;

  // Find user
  const user = await User.findOne({ username });
  if (!user) {
    throw new APIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new APIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Issue JWT
  const accessToken = jwt.sign(
    { id: user._id, username, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Create refresh token
  const rawRefresh = crypto.randomBytes(40).toString('hex');
  const refreshHash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
  await new Token({
    userId: user._id,
    purpose: 'refresh',
    tokenHash: refreshHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
  }).save();

  logger.info(`User logged in: ${username}`, { requestId: req.requestId });

  res.json({
    accessToken,
    refreshToken: rawRefresh,
    emailVerified: user.emailVerified,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
}));

/**
 * POST /password-recovery
 * Request password reset email
 */
router.post('/password-recovery', passwordResetLimiter, asyncHandler(async (req, res) => {
  const { value, error } = passwordRequestSchema.validate(req.body);
  if (error) {
    throw new APIError(error.details[0].message, 400, 'VALIDATION_ERROR');
  }

  const user = await User.findOne({ email: value.email });
  
  // Always return success to prevent email enumeration
  if (!user) {
    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  // Create password reset token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  await new Token({
    userId: user._id,
    purpose: 'password_reset',
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
  }).save();

  logger.info(`Password reset requested for: ${user.email}`, { requestId: req.requestId });

  res.json({
    message: 'If an account with that email exists, a password reset link has been sent',
    resetToken: rawToken // In production, send via email instead
  });
}));

/**
 * POST /password-reset
 * Reset password using token
 */
router.post('/password-reset', passwordResetLimiter, asyncHandler(async (req, res) => {
  const { value, error } = passwordResetSchema.validate(req.body);
  if (error) {
    throw new APIError(error.details[0].message, 400, 'VALIDATION_ERROR');
  }

  const { token, password } = value;

  // Hash the provided token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Find valid token
  const tokenDoc = await Token.findOne({
    tokenHash,
    purpose: 'password_reset',
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDoc) {
    throw new APIError('Invalid or expired reset token', 400, 'INVALID_TOKEN');
  }

  // Update password
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.findByIdAndUpdate(tokenDoc.userId, { password: hashedPassword });

  // Delete the used token
  await Token.deleteOne({ _id: tokenDoc._id });

  logger.info(`Password reset completed for user: ${tokenDoc.userId}`, { requestId: req.requestId });

  res.json({ message: 'Password reset successful' });
}));

/**
 * POST /verify-email
 * Verify email address using token
 */
router.post('/verify-email', authLimiter, asyncHandler(async (req, res) => {
  const { value, error} = emailVerifySchema.validate(req.body);
  if (error) {
    throw new APIError(error.details[0].message, 400, 'VALIDATION_ERROR');
  }

  const { token } = value;

  // Hash the provided token
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Find valid token
  const tokenDoc = await Token.findOne({
    tokenHash,
    purpose: 'email_verification',
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDoc) {
    throw new APIError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
  }

  // Update user
  await User.findByIdAndUpdate(tokenDoc.userId, { emailVerified: true });

  // Delete the used token
  await Token.deleteOne({ _id: tokenDoc._id });

  logger.info(`Email verified for user: ${tokenDoc.userId}`, { requestId: req.requestId });

  res.json({ message: 'Email verified successfully' });
}));

/**
 * POST /token/refresh
 * Refresh access token using refresh token
 */
router.post('/token/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new APIError('Refresh token required', 400, 'MISSING_TOKEN');
  }

  // Hash the provided refresh token
  const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Find valid refresh token
  const tokenDoc = await Token.findOne({
    tokenHash: refreshHash,
    purpose: 'refresh',
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDoc) {
    throw new APIError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }

  // Get user
  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw new APIError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Issue new access token
  const accessToken = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.json({ accessToken });
}));

/**
 * POST /logout
 * Logout user by invalidating refresh token
 */
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await Token.deleteOne({ tokenHash: refreshHash, purpose: 'refresh' });
  }

  logger.info('User logged out', { requestId: req.requestId });

  res.json({ message: 'Logged out successfully' });
}));

/**
 * OAuth placeholders (Google, Facebook, Apple)
 * These should be implemented with proper OAuth2 flows
 */
router.get('/google', (req, res) => {
  res.status(501).json({ message: 'Google OAuth not yet implemented' });
});

router.get('/google/callback', (req, res) => {
  res.status(501).json({ message: 'Google OAuth not yet implemented' });
});

router.get('/facebook', (req, res) => {
  res.status(501).json({ message: 'Facebook OAuth not yet implemented' });
});

router.get('/apple', (req, res) => {
  res.status(501).json({ message: 'Apple OAuth not yet implemented' });
});

module.exports = router;
