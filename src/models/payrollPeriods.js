'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class payrollPeriods extends Model {
    static associate(models) {
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      this.belongsTo(models.users, { as: 'createdBy', foreignKey: 'user_id' });
      this.hasMany(models.payrollLines, { as: 'lines', foreignKey: 'payroll_period_id' });
    }
  }

  payrollPeriods.init({
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
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
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    frequency: {
      type: DataTypes.ENUM('Quincenal', 'Mensual', 'Semanal'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Borrador', 'Aprobado', 'Pagado'),
      allowNull: false,
      defaultValue: 'Borrador'
    },
    total_gross: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_deductions: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_net: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'payrollPeriods',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return payrollPeriods;
};
