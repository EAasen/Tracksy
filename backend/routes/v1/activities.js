/**
 * Activities Routes (API v1)
 * Handles activity tracking, including creating, listing, and managing activities
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { Activity, Route } = require('../../config/database');
const { authenticate, isAdmin } = require('../../middleware/auth');
const { APIError, asyncHandler } = require('../../middleware/errorHandler');
const logger = require('../../config/logger');

// Validation schemas
const activityCreateSchema = Joi.object({
  type: Joi.string().valid('walk', 'run', 'bike', 'hike', 'swim', 'ski', 'other').required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
  routeId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  distanceMeters: Joi.number().min(0).optional(),
  calories: Joi.number().min(0).optional(),
  notes: Joi.string().max(1000).optional(),
  metrics: Joi.object({
    avgHeartRate: Joi.number().min(0),
    maxHeartRate: Joi.number().min(0),
    avgPace: Joi.number().min(0),
    elevationGainMeters: Joi.number().min(0)
  }).optional()
});

const activityUpdateSchema = Joi.object({
  type: Joi.string().valid('walk', 'run', 'bike', 'hike', 'swim', 'ski', 'other').optional(),
  startTime: Joi.date().iso().optional(),
  endTime: Joi.date().iso().optional(),
  routeId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional().allow(null),
  distanceMeters: Joi.number().min(0).optional(),
  calories: Joi.number().min(0).optional(),
  notes: Joi.string().max(1000).optional(),
  metrics: Joi.object({
    avgHeartRate: Joi.number().min(0),
    maxHeartRate: Joi.number().min(0),
    avgPace: Joi.number().min(0),
    elevationGainMeters: Joi.number().min(0)
  }).optional()
});

/**
 * POST /activities
 * Create a new activity
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { value, error } = activityCreateSchema.validate(req.body);
  
  if (error) {
    throw new APIError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      error.details.map(d => d.message)
    );
  }

  // Validate time range
  if (new Date(value.endTime) <= new Date(value.startTime)) {
    throw new APIError('End time must be after start time', 400, 'INVALID_TIME_RANGE');
  }

  let route = null;

  // Validate route if provided
  if (value.routeId) {
    route = await Route.findOne({ _id: value.routeId, deletedAt: null });
    
    if (!route) {
      throw new APIError('Route not found', 400, 'INVALID_ROUTE');
    }

    // Check route visibility permissions
    if (route.visibility === 'private' && 
        route.createdBy.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      throw new APIError('You do not have access to this route', 403, 'FORBIDDEN_ROUTE');
    }
  }

  // Calculate duration
  const durationSeconds = Math.round(
    (new Date(value.endTime) - new Date(value.startTime)) / 1000
  );

  // Create activity
  const activity = await Activity.create({
    userId: req.user.id,
    routeId: value.routeId || undefined,
    type: value.type,
    startTime: value.startTime,
    endTime: value.endTime,
    durationSeconds,
    distanceMeters: value.distanceMeters ?? (route ? route.distanceMeters : undefined),
    calories: value.calories,
    notes: value.notes,
    metrics: value.metrics
  });

  logger.info(`Activity created: ${activity._id} for user: ${req.user.id}`, { 
    requestId: req.requestId 
  });

  res.status(201).json({
    message: 'Activity created successfully',
    data: {
      id: activity._id,
      type: activity.type,
      durationSeconds: activity.durationSeconds,
      startTime: activity.startTime,
      endTime: activity.endTime
    }
  });
}));

/**
 * GET /activities/:id
 * Get a specific activity by ID
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const activity = await Activity.findOne({
    _id: req.params.id,
    deletedAt: null
  }).populate('routeId', 'name description distanceMeters');

  if (!activity) {
    throw new APIError('Activity not found', 404, 'NOT_FOUND');
  }

  // Check permissions
  if (activity.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new APIError('You do not have access to this activity', 403, 'FORBIDDEN');
  }

  res.json({ data: activity });
}));

/**
 * GET /activities
 * List activities with filtering and pagination
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { type, from, to, routeId, limit, cursor } = req.query;
  
  // Parse and validate limit
  const lim = Math.min(parseInt(limit || '20', 10), 100);

  // Build filter
  const filter = {
    deletedAt: null,
    userId: req.user.id
  };

  if (type) {
    filter.type = type;
  }

  if (routeId) {
    filter.routeId = routeId;
  }

  // Date range filtering
  if (from || to) {
    filter.startTime = {};
    if (from) filter.startTime.$gte = new Date(from);
    if (to) filter.startTime.$lte = new Date(to);
  }

  // Cursor-based pagination
  if (cursor) {
    filter._id = { $lt: cursor };
  }

  // Fetch activities with one extra to determine if there are more
  const items = await Activity.find(filter)
    .sort({ _id: -1 })
    .limit(lim + 1)
    .populate('routeId', 'name description');

  let nextCursor = null;
  if (items.length > lim) {
    nextCursor = items[lim - 1]._id;
    items.length = lim; // Truncate to actual limit
  }

  res.json({
    data: items,
    pagination: {
      limit: lim,
      nextCursor,
      hasMore: nextCursor !== null
    }
  });
}));

/**
 * PUT /activities/:id
 * Update an existing activity
 */
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const { value, error } = activityUpdateSchema.validate(req.body);
  
  if (error) {
    throw new APIError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      error.details.map(d => d.message)
    );
  }

  // Find activity
  const activity = await Activity.findOne({
    _id: req.params.id,
    deletedAt: null
  });

  if (!activity) {
    throw new APIError('Activity not found', 404, 'NOT_FOUND');
  }

  // Check permissions
  if (activity.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new APIError('You do not have access to this activity', 403, 'FORBIDDEN');
  }

  // Update fields
  if (value.type) activity.type = value.type;
  if (value.startTime) activity.startTime = value.startTime;
  if (value.endTime) activity.endTime = value.endTime;

  // Recalculate duration if time changed
  if (value.startTime || value.endTime) {
    if (new Date(activity.endTime) <= new Date(activity.startTime)) {
      throw new APIError('End time must be after start time', 400, 'INVALID_TIME_RANGE');
    }
    activity.durationSeconds = Math.round(
      (new Date(activity.endTime) - new Date(activity.startTime)) / 1000
    );
  }

  // Update route if provided
  if (value.routeId !== undefined) {
    if (value.routeId === null) {
      activity.routeId = undefined;
    } else {
      const route = await Route.findOne({ _id: value.routeId, deletedAt: null });
      
      if (!route) {
        throw new APIError('Route not found', 400, 'INVALID_ROUTE');
      }

      // Check route permissions
      if (route.visibility === 'private' && 
          route.createdBy.toString() !== req.user.id && 
          req.user.role !== 'admin') {
        throw new APIError('You do not have access to this route', 403, 'FORBIDDEN_ROUTE');
      }

      activity.routeId = value.routeId;
      
      // Auto-populate distance from route if not explicitly provided
      if (value.distanceMeters === undefined && route.distanceMeters) {
        activity.distanceMeters = route.distanceMeters;
      }
    }
  }

  // Update other fields
  if (value.distanceMeters !== undefined) activity.distanceMeters = value.distanceMeters;
  if (value.calories !== undefined) activity.calories = value.calories;
  if (value.notes !== undefined) activity.notes = value.notes;
  if (value.metrics) {
    activity.metrics = { ...activity.metrics, ...value.metrics };
  }

  await activity.save();

  logger.info(`Activity updated: ${activity._id}`, { requestId: req.requestId });

  res.json({
    message: 'Activity updated successfully',
    data: {
      id: activity._id,
      updated: true
    }
  });
}));

/**
 * DELETE /activities/:id
 * Soft delete an activity
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const activity = await Activity.findOne({
    _id: req.params.id,
    deletedAt: null
  });

  if (!activity) {
    throw new APIError('Activity not found', 404, 'NOT_FOUND');
  }

  // Check permissions
  if (activity.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new APIError('You do not have access to this activity', 403, 'FORBIDDEN');
  }

  // Soft delete
  activity.deletedAt = new Date();
  await activity.save();

  logger.info(`Activity deleted: ${activity._id}`, { requestId: req.requestId });

  res.json({
    message: 'Activity deleted successfully',
    data: {
      id: activity._id,
      deleted: true
    }
  });
}));

module.exports = router;
