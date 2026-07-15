'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class employeeLoans extends Model {
    static associate(models) {
      this.belongsTo(models.employees, { as: 'employee', foreignKey: 'employee_id' });
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      this.belongsTo(models.users, { as: 'requestedBy', foreignKey: 'user_id' });
      this.belongsTo(models.users, { as: 'approvedBy', foreignKey: 'approved_by' });
      this.hasMany(models.loanPayments, { as: 'payments', foreignKey: 'loan_id' });
    }
  }

  employeeLoans.init({
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    disbursement_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    installment_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Activo', 'Liquidado', 'Cancelado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'employeeLoans',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return employeeLoans;
};
