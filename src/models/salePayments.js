'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class salePayments extends Model {
    static associate(models) {
      this.belongsTo(models.sales, { as: 'sale', foreignKey: 'sale_id' });
      this.belongsTo(models.users, { as: 'user', foreignKey: 'user_id' });
    }
  }

  salePayments.init({
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM('Efectivo', 'Transferencia', 'Vale despensa', 'Tarjeta'),
      allowNull: false
    },
    reference_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'salePayments',
    tableName: 'sale_payments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return salePayments;
};
