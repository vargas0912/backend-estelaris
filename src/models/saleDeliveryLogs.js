'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class saleDeliveryLogs extends Model {
    static associate(models) {
      this.belongsTo(models.saleDeliveries, { as: 'delivery', foreignKey: 'delivery_id' });
      this.belongsTo(models.users, { as: 'createdByUser', foreignKey: 'created_by' });
    }
  }

  saleDeliveryLogs.init({
    delivery_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Preparando', 'Recolectado', 'En_Transito', 'En_Ruta_Entrega', 'Entregado', 'Devuelto'),
      allowNull: false
    },
    location: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: false,
    modelName: 'saleDeliveryLogs',
    tableName: 'sale_delivery_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return saleDeliveryLogs;
};
