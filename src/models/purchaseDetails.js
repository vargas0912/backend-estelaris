'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class purchaseDetails extends Model {
    static associate(models) {
      this.belongsTo(models.purchases, { as: 'purchase', foreignKey: 'purch_id' });
      this.belongsTo(models.products, { as: 'product', foreignKey: 'product_id' });
    }
  }

  purchaseDetails.init({
    purch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: {
      type: DataTypes.INTEGER,
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
    }
  }, {
    sequelize,
    paranoid: false,
    modelName: 'purchaseDetails',
    tableName: 'purchase_details',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return purchaseDetails;
};
