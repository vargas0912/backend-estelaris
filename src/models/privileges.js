'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class privileges extends Model {
    static associate (models) {
      // define association here
    }
  }
  privileges.init({
    name: DataTypes.STRING,
    codename: DataTypes.STRING,
    module: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'privileges'
  });

  return privileges;
};
