const userInterface = require("../interfaces/user");
const errorController = require("./error");

const validate = argument1 => {
  if (!argument1) {
    throw errorController.getBadRequestError("Missing data");
  }
}; // TODO make it valuable

module.exports = {
  getUserByEmail: ({ email }) => {
    validate({ email });
    return userInterface.get({ email }).then(user => {
      if (!user) {
        throw errorController.getUnauthorizedError(
          "There is no user with provided email"
        );
      }

      return user;
    });
  },

  createUser: ({ email, password }) => {
    validate({ email, password });
    return userInterface.create({ email, password }).catch(err => {
      let filteredError = err;
      if (err.message === "Validation error") {
        filteredError = errorController.getConflictError(
          "User with such email is already exist"
        );
      }

      throw filteredError;
    });
  },

  deleteUser: user => {
    validate(user);
    return userInterface.delete(user);
  },

  checkUserPassword: (user, password) =>
    new Promise((resolve, reject) => {
      if (user.password !== password) {
        reject(errorController.getUnauthorizedError("Incorrect password"));
      }

      resolve(user);
    }),

  loginUser: ({ email, password }) =>
    module.exports
      .getUserByEmail({ email })
      .then(user => module.exports.checkUserPassword(user, password))
};
