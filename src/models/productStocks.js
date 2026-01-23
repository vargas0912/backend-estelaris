'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class productStocks extends Model {
    static associate(models) {
      this.belongsTo(models.products, {
        as: 'product',
        foreignKey: 'product_id'
      });
      this.belongsTo(models.branches, {
        as: 'branch',
        foreignKey: 'branch_id'
      });
    }
  }
  productStocks.init({
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false,
      defaultValue: 0
    },
    min_stock: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: true,
      defaultValue: 0
    },
    max_stock: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    last_count_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'productStocks',
    tableName: 'product_stocks',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return productStocks;
};
