"use strict";
module.exports = (sequelize, DataTypes) => {
  var Todo = sequelize.define(
    "Todo",
    {
      text: DataTypes.STRING,
      done: { type: DataTypes.BOOLEAN, defaultValue: false },
      removed: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    {}
  );
  Todo.associate = function(models) {
    models.Todo.belongsTo(models.List);
  };
  return Todo;
};
