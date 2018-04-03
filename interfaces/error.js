const Boom = require("boom");

module.exports = {
  getBadRequestError: message => Boom.badRequest(message),
  getUnauthorizedError: message => Boom.unauthorized(message),
  getServerError: errObject => Boom.boomify(errObject),
  isCustomError: errObject => Boom.isBoom(errObject)
};
