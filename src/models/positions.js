'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class positions extends Model {
    static associate(models) {
      this.hasMany(models.employees, { as: 'employees', foreignKey: 'position_id' });
    }
  }
  positions.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    paranoid: true,
    modelName: 'positions',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return positions;
};
