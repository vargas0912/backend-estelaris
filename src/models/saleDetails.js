'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class saleDetails extends Model {
    static associate(models) {
      this.belongsTo(models.sales, { as: 'sale', foreignKey: 'sale_id' });
      this.belongsTo(models.products, { as: 'product', foreignKey: 'product_id' });
      this.belongsTo(models.purchases, { as: 'purchase', foreignKey: 'purch_id' });
    }
  }

  saleDetails.init({
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    qty: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    tax_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 16
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    purch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: false,
    modelName: 'saleDetails',
    tableName: 'sale_details',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return saleDetails;
};
