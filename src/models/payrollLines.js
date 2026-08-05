'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class payrollLines extends Model {
    static associate(models) {
      this.belongsTo(models.payrollPeriods, { as: 'period', foreignKey: 'payroll_period_id' });
      this.belongsTo(models.employees, { as: 'employee', foreignKey: 'employee_id' });
      this.hasMany(models.loanPayments, { as: 'loanPayments', foreignKey: 'payroll_line_id' });
    }
  }

  payrollLines.init({
    payroll_period_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    base_salary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    worked_days: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    gross_pay: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    loan_deduction: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    other_deductions: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    net_pay: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    payment_method: {
      type: DataTypes.ENUM('Efectivo', 'Transferencia'),
      allowNull: false,
      defaultValue: 'Transferencia'
    },
    reference_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Pagado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'payrollLines',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return payrollLines;
};
