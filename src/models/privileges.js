'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class privileges extends Model {
    static associate (models) {
      this.hasMany(models.user_privileges, { as: 'privileges', foreignKey: 'privilege_id' });
    }
  }
  privileges.init({
    name: DataTypes.STRING,
    codename: DataTypes.STRING,
    module: DataTypes.STRING
  }, {
    sequelize,
    paranoid: true,
    modelName: 'privileges'
  });

  return privileges;
};
