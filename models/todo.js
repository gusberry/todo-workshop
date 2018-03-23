'use strict';
module.exports = (sequelize, DataTypes) => {
  var Todo = sequelize.define('Todo', {
    text: DataTypes.STRING,
    done: DataTypes.BOOLEAN,
    removed: DataTypes.BOOLEAN
  }, {});
  Todo.associate = function(models) {
    models.Todo.belongsTo(models.List)
  };
  return Todo;
};