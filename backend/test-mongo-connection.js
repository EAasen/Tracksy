#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * This script tests the MongoDB connection using the same configuration as the main app
 */

const mongoose = require('mongoose');

// Use the same configuration as database.js
let dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/tracksy';
dbUrl = dbUrl.replace('localhost', '127.0.0.1');

const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
};

console.log('🧪 Testing MongoDB connection...');
console.log(`📍 Connecting to: ${dbUrl}`);

async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbUrl, mongooseOptions);
    console.log('✅ MongoDB connection successful!');
    
    // Test basic operations
    const testCollection = mongoose.connection.db.collection('test');
    
    // Insert a test document
    const testDoc = { test: true, timestamp: new Date() };
    await testCollection.insertOne(testDoc);
    console.log('✅ Write operation successful!');
    
    // Read the test document
    const foundDoc = await testCollection.findOne({ test: true });
    console.log('✅ Read operation successful!');
    console.log(`📄 Test document: ${JSON.stringify(foundDoc)}`);
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('✅ Delete operation successful!');
    
    // Test indexes
    const indexes = await testCollection.indexes();
    console.log(`📊 Available indexes: ${indexes.length}`);
    
    console.log('\n🎉 All MongoDB tests passed!');
    console.log('🔗 Database is ready for Tracksy application');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('💡 Make sure MongoDB is running and accessible');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

testConnection();
