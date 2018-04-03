const db = require("../models");

module.exports = {
  get: ({ email }) => db.User.findOne({ where: { email } }),

  create: ({ email, password }) => db.User.create({ email, password }),

  delete: user => user.destroy()
};
