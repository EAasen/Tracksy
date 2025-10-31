/**
 * Health Check Routes
 * System health and readiness endpoints
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * GET /healthz
 * Basic health check endpoint
 */
router.get('/healthz', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

  const health = {
    status: dbState === 1 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      readyState: dbState
    },
    memory: process.memoryUsage()
  };

  const statusCode = dbState === 1 ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /
 * Root endpoint
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Tracksy API',
    version: '1.0.0',
    documentation: '/api/v1/health',
    endpoints: {
      v1: '/api/v1',
      health: '/healthz'
    }
  });
});

module.exports = router;
