'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class customerAddresses extends Model {
    static associate(models) {
      this.belongsTo(models.customers, { as: 'customer', foreignKey: 'customer_id' });
      this.belongsTo(models.municipalities, { as: 'municipality', foreignKey: 'municipality_id' });
      this.hasMany(models.sales, { as: 'sales', foreignKey: 'customer_address_id' });
      this.hasMany(models.saleDeliveries, { as: 'deliveries', foreignKey: 'customer_address_id' });
    }
  }

  customerAddresses.init({
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address_type: {
      type: DataTypes.ENUM('billing', 'shipping'),
      allowNull: false
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'México'
    },
    municipality_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    timestamps: true,
    underscored: true,
    modelName: 'customerAddresses'
  });

  return customerAddresses;
};
