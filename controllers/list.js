const listInterface = require("../interfaces/list");

const validate = () => {}; // TODO make it valuable

module.exports = {
  getListById: ({ id }) => {
    validate({ id });
    return listInterface.get({ id });
  },

  createList: ({ title }) => {
    validate({ title });
    return listInterface.create({ title });
  },

  updateList: (list, newData) => {
    validate(list, newData);
    return listInterface.update(list, newData);
  },

  deleteList: list => {
    validate(list);
    return listInterface.delete(list);
  },

  getListsTodos: list => {
    validate(list);
    return listInterface.getAllTasks(list);
  }
};
