module.exports = require("../interfaces/error");

module.exports.errorHandlerMiddleware = (err, req, res) => {
  let customError = err;

  if (!module.exports.isCustomError(err)) {
    customError = module.exports.getServerError(err);
  }

  res.status(err.output.statusCode);
  res.json(err.output.payload);
};
