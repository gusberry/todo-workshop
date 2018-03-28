const db = require("../models");

module.exports = {
  get: ({ id }) => db.List.findById(id),

  create: ({ title }) => db.List.create({ title }),

  delete: list => list.destroy(),

  update: (list, { title }) => list.update({ title }),

  getAllTasks: list => list.getTodos()
};
