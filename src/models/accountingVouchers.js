'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class accountingVouchers extends Model {
    static associate(models) {
      this.belongsTo(models.accountingPeriods, { as: 'period', foreignKey: 'period_id' });
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      this.belongsTo(models.users, { as: 'createdBy', foreignKey: 'created_by_user_id' });
      this.hasMany(models.accountingVoucherLines, { as: 'lines', foreignKey: 'voucher_id' });
    }
  }

  accountingVouchers.init({
    folio: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('ingreso', 'egreso', 'diario', 'ajuste'),
      allowNull: false
    },
    period_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('borrador', 'aplicada', 'cancelada'),
      allowNull: false,
      defaultValue: 'borrador'
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    applied_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'accountingVouchers',
    tableName: 'accounting_vouchers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return accountingVouchers;
};
