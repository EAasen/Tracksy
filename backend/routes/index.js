/**
 * Central Router Aggregator
 * Mounts all API versions and health check routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const v1Routes = require('./v1');
const healthRoutes = require('./health');

// Mount API v1 routes
router.use('/api/v1', v1Routes);

// Mount health check routes (legacy compatibility)
router.use('/', healthRoutes);

module.exports = router;
