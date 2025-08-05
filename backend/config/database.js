const mongoose = require('mongoose');

const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/tracksy';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 10, // Database connection pooling
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  googleTokens: { type: Object },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Activity log schema and model
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  activityType: { type: String, required: true },
  duration: { type: Number, required: true },
  distance: { type: Number, required: true },
  date: { type: Date, required: true, index: true },
});

// Advanced features for ActivityLog and HealthMetrics
// 1. Soft delete
activityLogSchema.add({ deleted: { type: Boolean, default: false } });
healthMetricsSchema.add({ deleted: { type: Boolean, default: false } });

// 2. Audit logging (track changes)
activityLogSchema.add({ audit: [{ action: String, date: Date, userId: mongoose.Schema.Types.ObjectId }] });
healthMetricsSchema.add({ audit: [{ action: String, date: Date, userId: mongoose.Schema.Types.ObjectId }] });

// 3. Family access controls (share data)
activityLogSchema.add({ sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] });
healthMetricsSchema.add({ sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] });

// 4. Data validation (example for activityType)
activityLogSchema.path('activityType').validate(function(value) {
  return ['run', 'walk', 'cycle', 'swim', 'other'].includes(value);
}, 'Invalid activity type');

// 5. Timestamps
activityLogSchema.set('timestamps', true);
healthMetricsSchema.set('timestamps', true);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

// Health metrics schema and model
const healthMetricsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  heartRate: { type: Number },
  sleepDuration: { type: Number },
  recovery: { type: Number },
  date: { type: Date, required: true, index: true },
});

const HealthMetrics = mongoose.model('HealthMetrics', healthMetricsSchema);

// External provider tokens schema
const providerTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, required: true }, // e.g. 'fitbit', 'apple', 'googlefit'
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ProviderToken = mongoose.model('ProviderToken', providerTokenSchema);

module.exports = {
  db,
  User,
  ActivityLog,
  HealthMetrics,
  ProviderToken,
};
