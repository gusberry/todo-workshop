"use strict";
module.exports = (sequelize, DataTypes) => {
  var List = sequelize.define(
    "List",
    {
      title: DataTypes.STRING
    },
    {}
  );
  List.associate = function(models) {
    models.List.belongsTo(models.User);
    models.List.hasMany(models.Todo);
  };
  return List;
};
