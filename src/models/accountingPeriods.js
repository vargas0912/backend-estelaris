'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class accountingPeriods extends Model {
    static associate(models) {
      this.belongsTo(models.users, { as: 'closedBy', foreignKey: 'closed_by_user_id' });
    }
  }

  accountingPeriods.init({
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('abierto', 'cerrado', 'bloqueado'),
      allowNull: false,
      defaultValue: 'abierto'
    },
    balance_snapshot: {
      type: DataTypes.JSON,
      allowNull: true
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    closed_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sat_catalog_xml: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sat_vouchers_xml: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sat_submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'accountingPeriods',
    tableName: 'accounting_periods',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return accountingPeriods;
};
