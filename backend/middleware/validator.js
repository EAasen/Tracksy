/**
 * Request Validation Middleware
 * Uses express-validator for input validation
 */

const { validationResult } = require('express-validator');
const { APIError } = require('./errorHandler');

/**
 * Middleware to check validation results and format errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));

    throw new APIError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }
  
  next();
};

module.exports = { validate };
