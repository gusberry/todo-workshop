const todoInterface = require("../interfaces/todo");

const validate = () => {}; // TODO make it valuable

module.exports = {
  getTodoById: ({ id }) => {
    validate({ id });
    return todoInterface.get({ id });
  },

  createTodo: ({ text }) => {
    validate({ text });
    return todoInterface.create({ text });
  },

  updateTodo: (todo, newData) => {
    validate(todo, newData);
    return todoInterface.update(todo, newData);
  },

  deleteTodo: todo => {
    validate(todo);
    return todoInterface.delete(todo);
  },

  createTodoAndAddToList: (list, todoData) => {
    validate(list, todoData);
    return todoInterface.createAndAddToList(list, todoData);
  }
};
