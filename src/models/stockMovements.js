'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class stockMovements extends Model {
    static associate(models) {
      this.belongsTo(models.products, { as: 'product', foreignKey: 'product_id' });
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      this.belongsTo(models.users, { as: 'createdByUser', foreignKey: 'created_by' });
    }
  }

  stockMovements.init({
    product_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reference_type: {
      type: DataTypes.ENUM('purchase', 'sale', 'adjustment', 'reversal'),
      allowNull: false
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    qty_change: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: false,
    modelName: 'stockMovements',
    tableName: 'stock_movements',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return stockMovements;
};
