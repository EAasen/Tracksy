// Placeholder central router aggregator.
// In future, split domain routes (activity, healthmetrics, admin, integrations) into separate files
// and mount them here under versioned prefixes.
const express = require('express');
const router = express.Router();

// Currently all routes reside in app.js; this file prepares structure for modularization.

module.exports = router;
