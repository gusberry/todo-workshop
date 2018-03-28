const db = require("../models");
const listInterface = require("./list");

module.exports = {
  get: ({ id }) => db.Todo.findById(id),

  create: ({ text }) => db.Todo.create({ text }),

  delete: todo => todo.destroy(),

  update: (todo, { text, done, removed }) =>
    todo.update({ text, done, removed }),

  createAndAddToList: (list, { text }) =>
    module.exports.create({ text }).then(todo => todo.setList(list))
};
