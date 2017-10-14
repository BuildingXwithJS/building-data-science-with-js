const winston = require('winston');

const levelTesting = process.env.NODE_ENV === 'test' ? 'error' : false;
const level = levelTesting || process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level,
      colorize: true,
      timestamp: true,
      prettyPrint: true,
      label: 'storage-service',
    }),
  ],
});

module.exports = logger;
