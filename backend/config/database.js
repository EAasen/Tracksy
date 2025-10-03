const mongoose = require('mongoose');

// Enhanced MongoDB connection with better error handling and options
let dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/tracksy';
// Force IPv4 loopback to avoid potential IPv6 (::1) refusal when MongoDB only listens on 127.0.0.1
dbUrl = dbUrl.replace('localhost', '127.0.0.1');

// Connection options optimized for fitness app with time-series data (Mongoose 8 compatible)
const mongooseOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Fail fast if server not reachable
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  // bufferCommands false ensures immediate errors instead of silent buffering when disconnected
  bufferCommands: false,
};

// Connect to MongoDB with enhanced error handling
mongoose.set('strictQuery', true); // explicit for query filtering safety

mongoose.connect(dbUrl, mongooseOptions);

const db = mongoose.connection;

// Enhanced error handling and logging
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

db.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

db.on('reconnected', () => {
  console.log('MongoDB reconnected successfully');
});

db.once('open', () => {
  console.log('✅ Connected to MongoDB successfully');
  console.log(`Database: ${db.name}`);
  console.log(`Host: ${db.host}:${db.port}`);
});

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  emailVerified: { type: Boolean, default: false },
  googleTokens: { type: Object },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Health metrics schema and model
const healthMetricsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  heartRate: { type: Number },
  sleepDuration: { type: Number },
  recovery: { type: Number },
  date: { type: Date, required: true, index: true },
});

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
const HealthMetrics = mongoose.model('HealthMetrics', healthMetricsSchema);

// Food schema for nutrition tracking
const foodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  servingSize: { type: String, default: '1 serving' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Food = mongoose.model('Food', foodSchema);

// Meal schema
const mealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  foods: [{ 
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    quantity: { type: Number, required: true, default: 1 }
  }],
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  date: { type: Date, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Meal = mongoose.model('Meal', mealSchema);

// Custom food schema
const customFoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  servingSize: { type: String, default: '1 serving' },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CustomFood = mongoose.model('CustomFood', customFoodSchema);

// Measurements schema
const measurementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['weight', 'height', 'body_fat', 'muscle_mass', 'waist', 'chest', 'arms', 'legs'], required: true },
  value: { type: Number, required: true },
  unit: { type: String, required: true }, // kg, lbs, cm, inches, etc.
  date: { type: Date, required: true, index: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Measurement = mongoose.model('Measurement', measurementSchema);

// Goals schema
const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['weight', 'exercise', 'nutrition', 'health'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  targetValue: { type: Number },
  currentValue: { type: Number, default: 0 },
  unit: { type: String },
  targetDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'paused', 'cancelled'], default: 'active' },
  progress: { type: Number, default: 0 }, // percentage
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Goal = mongoose.model('Goal', goalSchema);

// Water intake schema
const waterIntakeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true }, // in ml
  date: { type: Date, required: true, index: true },
  time: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const WaterIntake = mongoose.model('WaterIntake', waterIntakeSchema);

// Family access schema
const familyAccessSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sharedWithId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  permissions: {
    viewActivities: { type: Boolean, default: false },
    viewHealth: { type: Boolean, default: false },
    viewNutrition: { type: Boolean, default: false },
    viewGoals: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const FamilyAccess = mongoose.model('FamilyAccess', familyAccessSchema);

// Reports schema
const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'yearly'], required: true },
  period: { 
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  data: { type: Object, required: true }, // JSON containing report data
  generatedAt: { type: Date, default: Date.now },
  isShared: { type: Boolean, default: false }
});

const Report = mongoose.model('Report', reportSchema);

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

// General purpose token schema (email verification, password reset, etc.)
const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  purpose: { type: String, enum: ['email_verification', 'password_reset', 'refresh'], required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: true },
  consumed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Optional automatic TTL index for expired tokens (Mongo will remove after expiry)
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);

// Route schema (ADR-0002)
const routeSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 120, index: true },
  description: { type: String, maxlength: 2000 },
  geometry: {
    type: { type: String, enum: ['LineString'], required: true },
    coordinates: { type: [[Number]], required: true }
  },
  distanceMeters: { type: Number, required: true },
  bbox: { type: [Number], validate: v => !v || v.length === 4 },
  center: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: void 0 }
  },
  tags: { type: [String], index: true, default: [] },
  visibility: { type: String, enum: ['public','private'], default: 'private', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  elevationGainMeters: { type: Number, default: null },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

routeSchema.index({ geometry: '2dsphere' });
// Performance index: query patterns often filter by creator + visibility
routeSchema.index({ createdBy: 1, visibility: 1 }); // (#69) compound index to speed listing queries
routeSchema.pre('save', function(next) { this.updatedAt = new Date(); next(); });

const Route = mongoose.model('Route', routeSchema);

// Activity schema (Issue #3)
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: false, index: true },
  type: { type: String, enum: ['run','hike','cycle','walk','swim','other'], required: true, index: true },
  startTime: { type: Date, required: true, index: true },
  endTime: { type: Date, required: true },
  durationSeconds: { type: Number, required: true },
  distanceMeters: { type: Number, required: false },
  calories: { type: Number },
  notes: { type: String, maxlength: 2000 },
  metrics: {
    avgPace: { type: Number }, // seconds per km
    avgHr: { type: Number },
    maxHr: { type: Number },
    elevationGainMeters: { type: Number }
  },
  deletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Performance indexes (#69)
activitySchema.index({ userId: 1, startTime: -1 }); // Common listing by user + time desc
activitySchema.index({ type: 1 }); // Filtering by type
activitySchema.pre('save', function(next) { this.updatedAt = new Date(); next(); });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = {
  db,
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
  Activity,
};
