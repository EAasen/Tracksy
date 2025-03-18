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

module.exports = {
  db,
  User,
  ActivityLog,
  HealthMetrics,
};
