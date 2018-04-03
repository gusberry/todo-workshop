const userInterface = require("../interfaces/user");

const validate = () => {}; // TODO make it valuable

module.exports = {
  getUserByEmail: ({ email }) => {
    validate({ email });
    return userInterface.get({ email });
  },

  createUser: ({ email, password }) => {
    validate({ email, password });
    return userInterface.create({ email, password });
  },

  deleteUser: user => {
    validate(user);
    return userInterface.delete(user);
  },

  isProvidedPasswordEqualsUsers: (user, password) =>
    Promise.resolve(user.password === password)
};
