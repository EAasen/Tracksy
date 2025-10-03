// MongoDB Initialization Script for Tracksy
// This script sets up the initial database structure and indexes

print('🚀 Initializing Tracksy MongoDB database...');

// Switch to the tracksy database
db = db.getSiblingDB('tracksy');

// Create a user for the application (if using authentication)
// Note: In development, this might not be needed depending on your setup
try {
  db.createUser({
    user: 'tracksyapp',
    pwd: 'tracksy_dev_password',
    roles: [
      {
        role: 'readWrite',
        db: 'tracksy'
      }
    ]
  });
  print('✅ Created application user: tracksyapp');
} catch (error) {
  print('ℹ️  User might already exist:', error.message);
}

// Create indexes for better performance (this will be expanded in issue #63)
print('📊 Creating initial indexes...');

// User collection indexes
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

// Activity logs - compound index for user queries
db.activitylogs.createIndex({ "userId": 1, "date": -1 });
db.activitylogs.createIndex({ "userId": 1, "activityType": 1 });

// Health metrics - optimized for time-series queries
db.healthmetrics.createIndex({ "userId": 1, "date": -1 });
db.healthmetrics.createIndex({ "userId": 1, "type": 1, "date": -1 });

// Meals and nutrition tracking
db.meals.createIndex({ "userId": 1, "date": -1 });
db.meals.createIndex({ "userId": 1, "mealType": 1, "date": -1 });

// Water intake tracking
db.waterintakes.createIndex({ "userId": 1, "date": -1 });

// Goals tracking
db.goals.createIndex({ "userId": 1, "status": 1 });
db.goals.createIndex({ "userId": 1, "type": 1 });

// Provider tokens for integrations
db.providertokens.createIndex({ "userId": 1, "provider": 1 });
db.providertokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

print('✅ Database initialization completed successfully!');
print('📝 Indexes created for optimal query performance');
print('🔗 Ready for Tracksy application connection');
