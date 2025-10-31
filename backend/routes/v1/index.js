/**
 * API v1 Router
 * Main router that aggregates all v1 API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const activitiesRoutes = require('./activities');
const healthMetricsRoutes = require('./health-metrics');

// Mount routes
router.use('/auth', authRoutes);
router.use('/activities', activitiesRoutes);
router.use('/health-metrics', healthMetricsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
