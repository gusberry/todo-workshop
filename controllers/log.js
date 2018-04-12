const winston = require("winston");
const morgan = require("morgan");
const config = require("../config/logger");
require("winston-loggly-bulk");

const logger = new winston.Logger({
  transports: [
    new winston.transports.File(config.file),
    new winston.transports.Console(config.console),
    new winston.transports.Loggly(config.loggly)
  ]
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;

module.exports.requestLogger = morgan("combined", { stream: logger.stream });
