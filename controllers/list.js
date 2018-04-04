const listInterface = require("../interfaces/list");
const errorController = require("./error");

const validate = argument1 => {
  if (!argument1) {
    throw errorController.getBadRequestError("Missing data");
  }
}; // TODO make it valuable

module.exports = {
  getListById: ({ id }) => {
    validate({ id });
    return listInterface.get({ id });
  },

  createList: ({ title }, user) => {
    validate({ title }, user);
    return listInterface.create({ title }, user);
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
