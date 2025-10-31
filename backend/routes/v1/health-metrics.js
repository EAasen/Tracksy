/**
 * Health Metrics Routes (API v1)
 * Handles health metrics CRUD operations
 */

const express = require('express');
const router = express.Router();
const { HealthMetrics } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const { APIError, asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../config/logger');

/**
 * Helper function for pagination
 */
const getPagination = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;
  return { skip, limit, page };
};

/**
 * GET /health-metrics
 * Get user's health metrics with pagination
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { skip, limit, page } = getPagination(req);
  const filter = { userId: req.user.id, deleted: false };

  const [metrics, total] = await Promise.all([
    HealthMetrics.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    HealthMetrics.countDocuments(filter)
  ]);

  res.json({
    data: metrics,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

/**
 * GET /health-metrics/:id
 * Get a specific health metric
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const metric = await HealthMetrics.findOne({
    _id: req.params.id,
    userId: req.user.id,
    deleted: false
  });

  if (!metric) {
    throw new APIError('Health metric not found', 404, 'NOT_FOUND');
  }

  res.json({ data: metric });
}));

/**
 * POST /health-metrics
 * Create a new health metric
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const metric = new HealthMetrics({
    ...req.body,
    userId: req.user.id,
    audit: [{
      action: 'create',
      date: new Date(),
      userId: req.user.id
    }]
  });

  await metric.save();

  logger.info(`Health metric created for user: ${req.user.id}`, { requestId: req.requestId });

  res.status(201).json({
    message: 'Health metric created successfully',
    data: metric
  });
}));

/**
 * PUT /health-metrics/:id
 * Update a health metric
 */
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const metric = await HealthMetrics.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
      deleted: false
    },
    {
      ...req.body,
      $push: {
        audit: {
          action: 'update',
          date: new Date(),
          userId: req.user.id
        }
      }
    },
    { new: true, runValidators: true }
  );

  if (!metric) {
    throw new APIError('Health metric not found', 404, 'NOT_FOUND');
  }

  logger.info(`Health metric updated: ${req.params.id}`, { requestId: req.requestId });

  res.json({
    message: 'Health metric updated successfully',
    data: metric
  });
}));

/**
 * DELETE /health-metrics/:id
 * Soft delete a health metric
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const metric = await HealthMetrics.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
      deleted: false
    },
    {
      deleted: true,
      $push: {
        audit: {
          action: 'delete',
          date: new Date(),
          userId: req.user.id
        }
      }
    },
    { new: true }
  );

  if (!metric) {
    throw new APIError('Health metric not found', 404, 'NOT_FOUND');
  }

  logger.info(`Health metric deleted: ${req.params.id}`, { requestId: req.requestId });

  res.json({
    message: 'Health metric deleted successfully'
  });
}));

module.exports = router;
