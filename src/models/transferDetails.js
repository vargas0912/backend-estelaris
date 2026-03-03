'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class transferDetails extends Model {
    static associate(models) {
      this.belongsTo(models.transfers, { as: 'transfer', foreignKey: 'transfer_id' });
      this.belongsTo(models.products, { as: 'product', foreignKey: 'product_id' });
      this.belongsTo(models.purchases, { as: 'purchase', foreignKey: 'purch_id' });
    }
  }

  transferDetails.init({
    transfer_id: {
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
    qty_received: {
      type: DataTypes.DECIMAL(12, 3),
      allowNull: true
    },
    unit_cost: {
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
    modelName: 'transferDetails',
    tableName: 'transfer_details',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return transferDetails;
};
