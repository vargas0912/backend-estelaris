'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class saleDeliveries extends Model {
    static associate(models) {
      this.belongsTo(models.sales, { as: 'sale', foreignKey: 'sale_id' });
      this.belongsTo(models.customerAddresses, { as: 'customerAddress', foreignKey: 'customer_address_id' });
      this.belongsTo(models.employees, { as: 'driver', foreignKey: 'driver_id' });
      this.hasMany(models.saleDeliveryLogs, { as: 'logs', foreignKey: 'delivery_id' });
    }
  }

  saleDeliveries.init({
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customer_address_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Preparando', 'Recolectado', 'En_Transito', 'En_Ruta_Entrega', 'Entregado', 'Devuelto'),
      allowNull: false,
      defaultValue: 'Preparando'
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    transport_plate: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    estimated_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'saleDeliveries',
    tableName: 'sale_deliveries',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return saleDeliveries;
};
