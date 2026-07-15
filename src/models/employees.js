'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class employees extends Model {
    static associate(models) {
      this.belongsTo(models.positions, { as: 'position', foreignKey: 'position_id' });
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      this.hasMany(models.transfers, { as: 'drivenTransfers', foreignKey: 'driver_id' });
      this.hasMany(models.sales, { as: 'sales', foreignKey: 'employee_id' });
      this.hasMany(models.saleDeliveries, { as: 'drivenDeliveries', foreignKey: 'driver_id' });
      this.belongsTo(models.users, { foreignKey: 'user_id', as: 'user' });
      this.hasMany(models.payrollLines, { as: 'payrollLines', foreignKey: 'employee_id' });
      this.hasMany(models.employeeLoans, { as: 'loans', foreignKey: 'employee_id' });
      this.hasMany(models.employeeVacations, { as: 'vacations', foreignKey: 'employee_id' });
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
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    },
    base_salary: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0.00
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
