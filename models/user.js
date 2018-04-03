"use strict";
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define(
    "User",
    {
      email: { type: DataTypes.STRING, primaryKey: true },
      password: DataTypes.STRING
    },
    {}
  );
  User.associate = function(models) {
    models.User.hasMany(models.List);
  };
  return User;
};
