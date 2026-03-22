'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class accountingVoucherLines extends Model {
    static associate(models) {
      this.belongsTo(models.accountingVouchers, { as: 'voucher', foreignKey: 'voucher_id' });
      this.belongsTo(models.accountingAccounts, { as: 'account', foreignKey: 'account_id' });
    }
  }

  accountingVoucherLines.init({
    voucher_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    debit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    credit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    paranoid: false,
    modelName: 'accountingVoucherLines',
    tableName: 'accounting_voucher_lines',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return accountingVoucherLines;
};
