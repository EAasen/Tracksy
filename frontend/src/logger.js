import log from 'loglevel';

log.setLevel(process.env.LOG_LEVEL || 'info');

export default log;
