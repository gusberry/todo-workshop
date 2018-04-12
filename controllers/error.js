const logger = require("./log");

module.exports = require("../interfaces/error");

module.exports.errorHandlerMiddleware = (err, req, res, next) => {
  let customError = err;

  if (!module.exports.isCustomError(err)) {
    customError = module.exports.getServerError(err);
  }

  res.status(customError.output.statusCode);
  logger.error(customError);
  return res.json(customError.output.payload);
};
