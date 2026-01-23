'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class productPrices extends Model {
    static associate(models) {
      this.belongsTo(models.products, {
        as: 'product',
        foreignKey: 'product_id'
      });
      this.belongsTo(models.priceLists, {
        as: 'priceList',
        foreignKey: 'price_list_id'
      });
    }
  }
  productPrices.init({
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price_list_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    min_quantity: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'productPrices',
    tableName: 'product_prices',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return productPrices;
};
