'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class loanPayments extends Model {
    static associate(models) {
      this.belongsTo(models.employeeLoans, { as: 'loan', foreignKey: 'loan_id' });
      this.belongsTo(models.payrollLines, { as: 'payrollLine', foreignKey: 'payroll_line_id' });
    }
  }

  loanPayments.init({
    loan_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payroll_line_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'loanPayments',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return loanPayments;
};
