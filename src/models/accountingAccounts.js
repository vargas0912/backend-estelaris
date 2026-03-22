'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class accountingAccounts extends Model {
    static associate(models) {
      this.belongsTo(models.accountingAccounts, { as: 'parent', foreignKey: 'parent_id' });
      this.hasMany(models.accountingAccounts, { as: 'children', foreignKey: 'parent_id' });
    }
  }

  accountingAccounts.init({
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('activo', 'pasivo', 'capital', 'ingreso', 'egreso', 'costo'),
      allowNull: false
    },
    nature: {
      type: DataTypes.ENUM('deudora', 'acreedora'),
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    allows_movements: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    paranoid: false,
    modelName: 'accountingAccounts',
    tableName: 'accounting_accounts',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return accountingAccounts;
};
