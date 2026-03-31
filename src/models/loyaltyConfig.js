'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class loyaltyConfig extends Model {
    static associate(models) {
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
    }
  }

  loyaltyConfig.init({
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    points_per_peso: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0.1
    },
    earn_on_tax: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    earn_on_discount: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    earn_on_credit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    earn_on_credit_when: {
      type: DataTypes.ENUM('sale', 'paid'),
      allowNull: false,
      defaultValue: 'paid'
    },
    peso_per_point: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.10
    },
    min_points_redeem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    max_redeem_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 20.00
    },
    max_redeem_points: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    points_expiry_days: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rounding_strategy: {
      type: DataTypes.ENUM('floor', 'round', 'ceil'),
      allowNull: false,
      defaultValue: 'floor'
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'loyaltyConfig',
    tableName: 'loyalty_configs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return loyaltyConfig;
};
