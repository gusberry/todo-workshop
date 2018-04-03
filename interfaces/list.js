const db = require("../models");

module.exports = {
  get: ({ id }) => db.List.findById(id),

  create: ({ title }, user) =>
    db.List.create({ title }).then(list => list.setUser(user)),

  delete: list => list.destroy(),

  update: (list, { title }) => list.update({ title }),

  getAllTasks: list => list.getTodos()
};
