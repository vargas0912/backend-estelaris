'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class employees extends Model {
    static associate(models) {
      this.belongsTo(models.positions, { as: 'position', foreignKey: 'position_id' });
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
    }
  }

  employees.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    hire_date: DataTypes.DATEONLY,
    position_id: DataTypes.INTEGER,
    branch_id: DataTypes.INTEGER,
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'employees',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return employees;
};
