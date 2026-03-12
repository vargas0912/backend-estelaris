'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  // eslint-disable-next-line camelcase
  class expense_types extends Model {
    static associate() {}
  }
  // eslint-disable-next-line camelcase
  expense_types.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    paranoid: false,
    modelName: 'expense_types',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // eslint-disable-next-line camelcase
  return expense_types;
};
