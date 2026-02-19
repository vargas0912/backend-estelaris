'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    static associate(models) {
      this.hasMany(models.userprivileges, { as: 'privilegios', foreignKey: 'user_id' });
      this.hasOne(models.customers, { as: 'customer', foreignKey: 'user_id' });
      this.belongsToMany(models.branches, {
        through: 'user_branches',
        as: 'branches',
        foreignKey: 'user_id',
        otherKey: 'branch_id'
      });
    }
  }
  users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    paranoid: true,
    modelName: 'users'
  });

  return users;
};
