const winston = require('winston');
const { format } = require('logform');
const { combine, timestamp, printf, errors } = format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} ${level}: ${message} - ${stack}`
        : `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

// Detailed logging for data sync operations
logger.syncData = (operation, details) => {
  logger.info(`Data sync operation: ${operation}`, details);
};

// Logging for OAuth 2.0 authentication flow
logger.oauth2 = (operation, details) => {
  logger.info(`OAuth 2.0 operation: ${operation}`, details);
};

// Alerting for critical issues
logger.alert = (message, details) => {
  logger.error(`ALERT: ${message}`, details);
};

module.exports = logger;
