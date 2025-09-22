const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { OAuth2Client } = require('google-auth-library');
const app = express();
const port = process.env.PORT || 3000;
const { 
  User, 
  ActivityLog, 
  HealthMetrics, 
  Food,
  Meal,
  CustomFood,
  Measurement,
  Goal,
  WaterIntake,
  FamilyAccess,
  Report,
  ProviderToken,
  Token,
  Route,
  Activity
} = require('./config/database');
const { computeDistance, computeBbox, computeCenter } = require('./utils/geo');
const crypto = require('crypto');
const Joi = require('joi');
const axios = require('axios');

// Logger configuration (define early so we can log configuration warnings)
const loggerTransports = [new winston.transports.Console()];
if (process.env.NODE_ENV !== 'test') {
  loggerTransports.push(new winston.transports.File({ filename: 'logs/app.log' }));
}
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: loggerTransports
});

// Middleware to parse incoming request bodies
app.use(bodyParser.json());

// Fail fast (exit) in production if JWT secret missing; warn in dev
if (!process.env.JWT_SECRET) {
  const msg = 'JWT_SECRET not set. Using insecure default (development only).';
  if (process.env.NODE_ENV === 'production') {
    logger.error(msg);
    throw new Error('Refusing to start without JWT_SECRET in production');
  } else {
    logger.warn(msg);
  }
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Auth specific rate limiters
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20 });
const passwordResetLimiter = rateLimit({ windowMs: 15*60*1000, max: 10 });

// OAuth 2.0 client setup
const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// User authentication routes
const signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).max(100).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('user','admin').optional()
});

app.post('/signup', authLimiter, async (req, res) => {
  try {
    const { value, error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { username, password, email, role } = value;
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ error: 'Username or email already exists' });
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword, email, role: role || 'user' });
    await user.save();
    // Create email verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await new Token({ userId: user._id, purpose: 'email_verification', tokenHash, expiresAt: new Date(Date.now()+ 1000*60*60*24) }).save();
    // Issue JWT with role & id
  const accessToken = jwt.sign({ id: user._id, username, role: user.role }, process.env.JWT_SECRET || 'tracksysecret', { expiresIn: '15m' });
  // create refresh token (persist hashed)
  const rawRefresh = crypto.randomBytes(40).toString('hex');
  const refreshHash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
  await new Token({ userId: user._id, purpose: 'refresh', tokenHash: refreshHash, expiresAt: new Date(Date.now()+ 1000*60*60*24*30) }).save();
  res.status(201).json({ message: 'User created. Verify your email.', accessToken, refreshToken: rawRefresh, emailVerificationToken: rawToken });
  } catch (error) {
    logger.error(`Sign-up error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

app.post('/login', authLimiter, async (req, res) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { username, password } = value;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  const accessToken = jwt.sign({ id: user._id, username, role: user.role }, process.env.JWT_SECRET || 'tracksysecret', { expiresIn: '15m' });
  const rawRefresh = crypto.randomBytes(40).toString('hex');
  const refreshHash = crypto.createHash('sha256').update(rawRefresh).digest('hex');
  await new Token({ userId: user._id, purpose: 'refresh', tokenHash: refreshHash, expiresAt: new Date(Date.now()+ 1000*60*60*24*30) }).save();
  res.json({ accessToken, refreshToken: rawRefresh, emailVerified: user.emailVerified });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

const passwordRequestSchema = Joi.object({ email: Joi.string().email().required() });
const passwordResetSchema = Joi.object({ token: Joi.string().required(), password: Joi.string().min(8).required() });
const emailVerifySchema = Joi.object({ token: Joi.string().required() });

app.post('/password-recovery', passwordResetLimiter, async (req, res) => {
  try {
    const { value, error } = passwordRequestSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const user = await User.findOne({ email: value.email });
    if (!user) return res.status(200).json({ message: 'If account exists, password reset sent' });
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await new Token({ userId: user._id, purpose: 'password_reset', tokenHash, expiresAt: new Date(Date.now()+ 1000*60*30) }).save();
    res.json({ message: 'Password reset token generated', resetToken: rawToken });
  } catch (error) {
    logger.error(`Password recovery error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

app.post('/password-reset', passwordResetLimiter, async (req, res) => {
  try {
    const { value, error } = passwordResetSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const tokenHash = crypto.createHash('sha256').update(value.token).digest('hex');
    const tokenDoc = await Token.findOne({ tokenHash, purpose: 'password_reset', consumed: false, expiresAt: { $gt: new Date() } });
    if (!tokenDoc) return res.status(400).json({ error: 'Invalid or expired token' });
    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(400).json({ error: 'User not found' });
    user.password = await bcrypt.hash(value.password, 12);
    await user.save();
    tokenDoc.consumed = true; await tokenDoc.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

// Refresh token rotation endpoint
const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });
app.post('/token/refresh', async (req, res) => {
  try {
    const { value, error } = refreshSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const refreshHash = crypto.createHash('sha256').update(value.refreshToken).digest('hex');
    const stored = await Token.findOne({ tokenHash: refreshHash, purpose: 'refresh', consumed: false, expiresAt: { $gt: new Date() } });
    if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });
    const user = await User.findById(stored.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    // rotate: mark old consumed
    stored.consumed = true; await stored.save();
    const newAccess = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'tracksysecret', { expiresIn: '15m' });
    const newRawRefresh = crypto.randomBytes(40).toString('hex');
    const newRefreshHash = crypto.createHash('sha256').update(newRawRefresh).digest('hex');
    await new Token({ userId: user._id, purpose: 'refresh', tokenHash: newRefreshHash, expiresAt: new Date(Date.now()+ 1000*60*60*24*30) }).save();
    res.json({ accessToken: newAccess, refreshToken: newRawRefresh });
  } catch (err) {
    logger.error(`Refresh token error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint (revoke a refresh token)
const logoutSchema = Joi.object({ refreshToken: Joi.string().required() });
app.post('/logout', async (req, res) => {
  try {
    const { value, error } = logoutSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const refreshHash = crypto.createHash('sha256').update(value.refreshToken).digest('hex');
    const stored = await Token.findOne({ tokenHash: refreshHash, purpose: 'refresh', consumed: false });
    if (stored) { stored.consumed = true; await stored.save(); }
    res.json({ message: 'Logged out' });
  } catch (err) {
    logger.error(`Logout error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/verify-email', authLimiter, async (req, res) => {
  try {
    const { value, error } = emailVerifySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const tokenHash = crypto.createHash('sha256').update(value.token).digest('hex');
    const tokenDoc = await Token.findOne({ tokenHash, purpose: 'email_verification', consumed: false, expiresAt: { $gt: new Date() } });
    if (!tokenDoc) return res.status(400).json({ error: 'Invalid or expired token' });
    const user = await User.findById(tokenDoc.userId);
    if (!user) return res.status(400).json({ error: 'User not found' });
    user.emailVerified = true; await user.save();
    tokenDoc.consumed = true; await tokenDoc.save();
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

// OAuth 2.0 routes
app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile'],
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const user = await User.findOneAndUpdate(
      { email: req.body.email },
      { googleTokens: tokens },
      { new: true }
    );
    res.send('Google authentication successful');
  } catch (error) {
    logger.error(`Google authentication error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { tokens } = await oauth2Client.refreshToken(refreshToken);
    oauth2Client.setCredentials(tokens);
    const user = await User.findOneAndUpdate(
      { 'googleTokens.refresh_token': refreshToken },
      { googleTokens: tokens },
      { new: true }
    );
    res.json({ tokens });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

// OAuth 2.0 routes for other providers (stubs)
app.get('/auth/facebook', (req, res) => {
  // TODO: Implement Facebook OAuth flow
  res.send('Facebook OAuth not yet implemented');
});

app.get('/auth/apple', (req, res) => {
  // TODO: Implement Apple OAuth flow
  res.send('Apple OAuth not yet implemented');
});

// Data sync routes
app.post('/sync', async (req, res) => {
  try {
    // Data sync logic here (pseudo-code)
    // await syncData();
    res.send('Data sync initiated');
  } catch (error) {
    logger.error(`Data sync error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

// Integration management routes
app.post('/integrations', async (req, res) => {
  try {
    const { service, action } = req.body;
    // Integration management logic here (pseudo-code)
    // await manageIntegration(service, action);
    res.send('Integration action completed');
  } catch (error) {
    logger.error(`Integration management error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

// JWT authentication middleware
function authenticate(req, res, next) {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET || 'tracksysecret', (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = decoded;
      return next();
    });
  } catch (e) {
    return res.status(500).json({ error: 'Auth processing error' });
  }
}

function isAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

// Pagination helper
function getPagination(req) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  return { skip: (page - 1) * limit, limit };
}

// CRUD endpoints for ActivityLog
app.get('/api/activitylog', authenticate, async (req, res) => {
  const { skip, limit } = getPagination(req);
  const filter = { userId: req.user.id, deleted: false };
  if (req.query.type) filter.activityType = req.query.type;
  const logs = await ActivityLog.find(filter).skip(skip).limit(limit);
  res.json(logs);
});
app.post('/api/activitylog', authenticate, async (req, res) => {
  const log = new ActivityLog({ ...req.body, userId: req.user.id });
  await log.save();
  res.status(201).json(log);
});
app.put('/api/activitylog/:id', authenticate, async (req, res) => {
  const log = await ActivityLog.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { ...req.body, $push: { audit: { action: 'update', date: new Date(), userId: req.user.id } } },
    { new: true }
  );
  if (!log) return res.status(404).json({ error: 'Not found' });
  res.json(log);
});
app.delete('/api/activitylog/:id', authenticate, async (req, res) => {
  const log = await ActivityLog.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { deleted: true, $push: { audit: { action: 'delete', date: new Date(), userId: req.user.id } } },
    { new: true }
  );
  if (!log) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Admin endpoint: view all activity logs
app.get('/api/admin/activitylog', authenticate, isAdmin, async (req, res) => {
  const logs = await ActivityLog.find({});
  res.json(logs);
});

// CRUD endpoints for HealthMetrics
app.get('/api/healthmetrics', authenticate, async (req, res) => {
  const { skip, limit } = getPagination(req);
  const filter = { userId: req.user.id, deleted: false };
  const metrics = await HealthMetrics.find(filter).skip(skip).limit(limit);
  res.json(metrics);
});
app.post('/api/healthmetrics', authenticate, async (req, res) => {
  const metric = new HealthMetrics({ ...req.body, userId: req.user.id });
  await metric.save();
  res.status(201).json(metric);
});
app.put('/api/healthmetrics/:id', authenticate, async (req, res) => {
  const metric = await HealthMetrics.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { ...req.body, $push: { audit: { action: 'update', date: new Date(), userId: req.user.id } } },
    { new: true }
  );
  if (!metric) return res.status(404).json({ error: 'Not found' });
  res.json(metric);
});
app.delete('/api/healthmetrics/:id', authenticate, async (req, res) => {
  const metric = await HealthMetrics.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { deleted: true, $push: { audit: { action: 'delete', date: new Date(), userId: req.user.id } } },
    { new: true }
  );
  if (!metric) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Admin analytics endpoint
app.get('/api/admin/analytics', authenticate, isAdmin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalActivities = await ActivityLog.countDocuments({ deleted: false });
  const avgDurationAgg = await ActivityLog.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: null, avg: { $avg: "$duration" } } }
  ]);
  const avgDuration = avgDurationAgg[0]?.avg || 0;
  const popAgg = await ActivityLog.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: "$activityType", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);
  const popularActivity = popAgg[0]?._id || 'N/A';
  // Goals and water intake
  const activeGoals = await Goal.countDocuments({ status: 'active' });
  const avgWaterAgg = await WaterIntake.aggregate([
    { $group: { _id: null, avg: { $avg: "$amount" } } }
  ]);
  const avgWaterIntake = avgWaterAgg[0]?.avg || 0;
  res.json({ totalUsers, totalActivities, avgDuration, popularActivity, activeGoals, avgWaterIntake });
});

// Role-based access control middleware
function requireRole(role) {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).send('No token provided');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== role) return res.status(403).send('Forbidden');
      next();
    } catch (err) {
      res.status(401).send('Invalid token');
    }
  };
}

// Example protected admin route
app.get('/admin/dashboard', requireRole('admin'), (req, res) => {
  res.send('Admin dashboard');
});

// Profile routes
app.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id).select('username email role emailVerified createdAt');
  res.json(user);
});

const profileUpdateSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  email: Joi.string().email().optional()
});

app.put('/me', authenticate, async (req, res) => {
  try {
    const { value, error } = profileUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const updates = value;
    if (updates.email) updates.emailVerified = false; // reverify if email changes
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('username email role emailVerified');
    res.json(user);
  } catch (err) {
    logger.error(`Profile update error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activity endpoints (Issue #3)
const activityCreateSchema = Joi.object({
  type: Joi.string().valid('run','hike','cycle','walk','swim','other').required(),
  routeId: Joi.string().hex().length(24).optional(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
  distanceMeters: Joi.number().min(0).optional(),
  calories: Joi.number().min(0).optional(),
  notes: Joi.string().max(2000).allow('', null),
  metrics: Joi.object({
    avgPace: Joi.number().min(0),
    avgHr: Joi.number().min(0),
    maxHr: Joi.number().min(0),
    elevationGainMeters: Joi.number().min(0)
  }).optional()
});

const activityUpdateSchema = Joi.object({
  type: Joi.string().valid('run','hike','cycle','walk','swim','other'),
  routeId: Joi.string().hex().length(24),
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso(),
  distanceMeters: Joi.number().min(0),
  calories: Joi.number().min(0),
  notes: Joi.string().max(2000).allow('', null),
  metrics: Joi.object({
    avgPace: Joi.number().min(0),
    avgHr: Joi.number().min(0),
    maxHr: Joi.number().min(0),
    elevationGainMeters: Joi.number().min(0)
  })
});

app.post('/activities', authenticate, async (req, res) => {
  try {
    const { value, error } = activityCreateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details.map(d => d.message) });
    if (new Date(value.endTime) <= new Date(value.startTime)) return res.status(400).json({ error: 'INVALID_TIME_RANGE' });
    let route = null;
    if (value.routeId) {
      route = await Route.findOne({ _id: value.routeId, deletedAt: null });
      if (!route) return res.status(400).json({ error: 'INVALID_ROUTE' });
      if (route.visibility === 'private' && route.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'FORBIDDEN_ROUTE' });
      }
    }
    const durationSeconds = Math.round((new Date(value.endTime) - new Date(value.startTime)) / 1000);
    const doc = await Activity.create({
      userId: req.user.id,
      routeId: value.routeId || undefined,
      type: value.type,
      startTime: value.startTime,
      endTime: value.endTime,
      durationSeconds,
      distanceMeters: value.distanceMeters ?? (route ? route.distanceMeters : undefined),
      calories: value.calories,
      notes: value.notes,
      metrics: value.metrics
    });
    res.status(201).json({ id: doc._id, durationSeconds });
  } catch (err) {
    logger.error(`Activity create error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/activities/:id', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, deletedAt: null });
    if (!activity) return res.status(404).json({ error: 'NOT_FOUND' });
    if (activity.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    res.json(activity);
  } catch (err) {
    logger.error(`Activity get error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/activities', authenticate, async (req, res) => {
  try {
    const { type, from, to, routeId, limit, cursor } = req.query;
    const lim = Math.min(parseInt(limit || '20', 10), 100);
    const filter = { deletedAt: null, userId: req.user.id };
    if (type) filter.type = type;
    if (routeId) filter.routeId = routeId;
    if (from || to) {
      filter.startTime = {};
      if (from) filter.startTime.$gte = new Date(from);
      if (to) filter.startTime.$lte = new Date(to);
    }
    if (cursor) filter._id = { $lt: cursor }; // simple backward pagination
    const items = await Activity.find(filter).sort({ _id: -1 }).limit(lim + 1);
    let nextCursor = null;
    if (items.length > lim) {
      nextCursor = items[lim - 1]._id;
      items.length = lim; // truncate extra
    }
    res.json({ items, nextCursor });
  } catch (err) {
    logger.error(`Activity list error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/activities/:id', authenticate, async (req, res) => {
  try {
    const { value, error } = activityUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details.map(d => d.message) });
    const activity = await Activity.findOne({ _id: req.params.id, deletedAt: null });
    if (!activity) return res.status(404).json({ error: 'NOT_FOUND' });
    if (activity.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    if (value.type) activity.type = value.type;
    if (value.startTime) activity.startTime = value.startTime;
    if (value.endTime) activity.endTime = value.endTime;
    if (value.startTime || value.endTime) {
      if (new Date(activity.endTime) <= new Date(activity.startTime)) return res.status(400).json({ error: 'INVALID_TIME_RANGE' });
      activity.durationSeconds = Math.round((new Date(activity.endTime) - new Date(activity.startTime)) / 1000);
    }
    if (value.routeId) {
      const route = await Route.findOne({ _id: value.routeId, deletedAt: null });
      if (!route) return res.status(400).json({ error: 'INVALID_ROUTE' });
      if (route.visibility === 'private' && route.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'FORBIDDEN_ROUTE' });
      }
      activity.routeId = value.routeId;
      if (!value.distanceMeters && route.distanceMeters) activity.distanceMeters = route.distanceMeters;
    }
    if (value.distanceMeters !== undefined) activity.distanceMeters = value.distanceMeters;
    if (value.calories !== undefined) activity.calories = value.calories;
    if (value.notes !== undefined) activity.notes = value.notes;
    if (value.metrics) activity.metrics = { ...activity.metrics, ...value.metrics };
    await activity.save();
    res.json({ id: activity._id, updated: true });
  } catch (err) {
    logger.error(`Activity update error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/activities/:id', authenticate, async (req, res) => {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, deletedAt: null });
    if (!activity) return res.status(404).json({ error: 'NOT_FOUND' });
    if (activity.userId.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    activity.deletedAt = new Date();
    await activity.save();
    res.json({ id: activity._id, deleted: true });
  } catch (err) {
    logger.error(`Activity delete error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route endpoints (Issue #2)
const routeCreateSchema = Joi.object({
  name: Joi.string().min(3).max(120).required(),
  description: Joi.string().max(2000).allow('', null),
  visibility: Joi.string().valid('public','private').default('private'),
  tags: Joi.array().items(Joi.string().min(1).max(32)).max(10).default([]),
  geojson: Joi.object({
    type: Joi.string().valid('LineString').required(),
    coordinates: Joi.array().items(
      Joi.array().items(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90)).length(2)
    ).min(2).max(5000).required()
  }).required()
});

app.post('/routes', authenticate, async (req, res) => {
  try {
    const { value, error } = routeCreateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details.map(d => d.message) });
    const coords = value.geojson.coordinates;
    const distance = computeDistance(coords);
    if (distance < 1) return res.status(400).json({ error: 'ROUTE_TOO_SHORT' });
    const bbox = computeBbox(coords);
    const center = computeCenter(bbox);
    const route = await Route.create({
      name: value.name,
      description: value.description,
      visibility: value.visibility,
      tags: value.tags.map(t => t.toLowerCase()),
      geometry: { type: 'LineString', coordinates: coords },
      distanceMeters: Math.round(distance * 100) / 100,
      bbox,
      center: { type: 'Point', coordinates: center },
      createdBy: req.user.id
    });
    res.status(201).json({ id: route._id, name: route.name, distanceMeters: route.distanceMeters, visibility: route.visibility });
  } catch (err) {
    logger.error(`Route create error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/routes/:id', authenticate, async (req, res) => {
  try {
    const route = await Route.findOne({ _id: req.params.id, deletedAt: null });
    if (!route) return res.status(404).json({ error: 'NOT_FOUND' });
    if (route.visibility === 'private' && route.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    res.json(route);
  } catch (err) {
    logger.error(`Route get error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/routes', authenticate, async (req, res) => {
  try {
    const { q, bbox, visibility, mine, tags, limit } = req.query;
    const lim = Math.min(parseInt(limit || '20', 10), 100);
    const filter = { deletedAt: null };
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (tags) filter.tags = { $all: tags.split(',').map(t => t.toLowerCase()) };
    if (bbox) {
      const parts = bbox.split(',').map(Number);
      if (parts.length === 4 && parts.every(n => Number.isFinite(n))) {
        filter.geometry = { $geoIntersects: { $geometry: { type: 'Polygon', coordinates: [[
          [parts[0], parts[1]],[parts[2], parts[1]],[parts[2], parts[3]],[parts[0], parts[3]],[parts[0], parts[1]]
        ]] } } };
      }
    }
    if (mine === 'true') {
      filter.createdBy = req.user.id;
    } else {
      // Only include public + owned
      filter.$or = [ { visibility: 'public' }, { createdBy: req.user.id } ];
      if (visibility === 'public') delete filter.$or; // explicit public-only
    }
    if (visibility === 'private') {
      filter.visibility = 'private';
      delete filter.$or;
      filter.createdBy = req.user.id; // restrict to owner
    }
    const routes = await Route.find(filter).limit(lim).sort({ createdAt: -1 });
    res.json({ items: routes, count: routes.length });
  } catch (err) {
    logger.error(`Route list error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const routeUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(120),
  description: Joi.string().max(2000).allow('', null),
  visibility: Joi.string().valid('public','private'),
  tags: Joi.array().items(Joi.string().min(1).max(32)).max(10),
  geojson: Joi.object({
    type: Joi.string().valid('LineString').required(),
    coordinates: Joi.array().items(
      Joi.array().items(Joi.number().min(-180).max(180), Joi.number().min(-90).max(90)).length(2)
    ).min(2).max(5000).required()
  })
});

app.put('/routes/:id', authenticate, async (req, res) => {
  try {
    const { value, error } = routeUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'VALIDATION_ERROR', details: error.details.map(d => d.message) });
    const route = await Route.findOne({ _id: req.params.id, deletedAt: null });
    if (!route) return res.status(404).json({ error: 'NOT_FOUND' });
    if (route.createdBy.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    if (value.name) route.name = value.name;
    if (value.description !== undefined) route.description = value.description;
    if (value.visibility) route.visibility = value.visibility;
    if (value.tags) route.tags = value.tags.map(t => t.toLowerCase());
    if (value.geojson) {
      const coords = value.geojson.coordinates;
      const distance = computeDistance(coords);
      if (distance < 1) return res.status(400).json({ error: 'ROUTE_TOO_SHORT' });
      const bbox = computeBbox(coords);
      route.geometry = { type: 'LineString', coordinates: coords };
      route.distanceMeters = Math.round(distance * 100) / 100;
      route.bbox = bbox;
      route.center = { type: 'Point', coordinates: computeCenter(bbox) };
    }
    await route.save();
    res.json({ id: route._id, updated: true });
  } catch (err) {
    logger.error(`Route update error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/routes/:id', authenticate, async (req, res) => {
  try {
    const route = await Route.findOne({ _id: req.params.id, deletedAt: null });
    if (!route) return res.status(404).json({ error: 'NOT_FOUND' });
    if (route.createdBy.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'FORBIDDEN' });
    route.deletedAt = new Date();
    await route.save();
    res.json({ id: route._id, deleted: true });
  } catch (err) {
    logger.error(`Route delete error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware for authentication errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token');
  } else {
    next(err);
  }
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// External provider integration stub
app.post('/api/integration/:provider', authenticate, async (req, res) => {
  // Example: req.params.provider === 'fitbit', 'apple', etc.
  // Here you would handle OAuth, token exchange, and data sync
  res.json({ message: `Integration with ${req.params.provider} requested.` });
});

// Fitbit OAuth callback endpoint
app.post('/api/integration/fitbit/callback', authenticate, async (req, res) => {
  // Exchange code for tokens (stub)
  const { code } = req.body;
  // Normally, you'd call Fitbit's token endpoint here
  // For demo, store a fake token
  const token = new ProviderToken({
    userId: req.user.id,
    provider: 'fitbit',
    accessToken: 'fake-access-token',
    refreshToken: 'fake-refresh-token',
    expiresAt: new Date(Date.now() + 3600 * 1000)
  });
  await token.save();
  res.json({ success: true, provider: 'fitbit' });
});

// Fitbit data sync endpoint (stub)
app.post('/api/integration/fitbit/sync', authenticate, async (req, res) => {
  const token = await ProviderToken.findOne({ userId: req.user.id, provider: 'fitbit' });
  if (!token) return res.status(400).json({ error: 'No Fitbit token found' });
  // Normally, you'd call Fitbit API here
  // For demo, return fake data
  res.json({ steps: 10000, calories: 2200 });
});

// AI assistant endpoint (OpenAI stub)
app.post('/api/ai/assistant', authenticate, async (req, res) => {
  const { message } = req.body;
  // Call OpenAI API (stub)
  // const response = await axios.post('https://api.openai.com/v1/chat/completions', ...)
  // For demo, return a canned response
  res.json({ reply: `AI says: You asked '${message}'` });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`);
  });
}

module.exports = app;
