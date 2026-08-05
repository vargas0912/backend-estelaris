'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class employeeVacations extends Model {
    static associate(models) {
      this.belongsTo(models.employees, { as: 'employee', foreignKey: 'employee_id' });
      this.belongsTo(models.users, { as: 'approvedBy', foreignKey: 'approved_by' });
    }
  }

  employeeVacations.init({
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Aprobado', 'Rechazado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'employeeVacations',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return employeeVacations;
};
