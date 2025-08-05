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
  ProviderToken 
} = require('./config/database');
const axios = require('axios');

// Middleware to parse incoming request bodies
app.use(bodyParser.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

// OAuth 2.0 client setup
const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// User authentication routes
app.post('/signup', async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, role: role || 'user' });
    await user.save();
    // Issue JWT with role
    const token = jwt.sign({ username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User created', token });
  } catch (error) {
    logger.error(`Sign-up error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }
    // Issue JWT with role
    const token = jwt.sign({ username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).send('Internal server error');
  }
});

app.post('/password-recovery', async (req, res) => {
  try {
    const { email } = req.body;
    // Password recovery logic here (pseudo-code)
    // await sendPasswordRecoveryEmail(email);
    res.send('Password recovery email sent');
  } catch (error) {
    logger.error(`Password recovery error: ${error.message}`);
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
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET || 'tracksysecret', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
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

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
