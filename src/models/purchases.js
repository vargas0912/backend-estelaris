'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class purchases extends Model {
    static associate(models) {
      this.belongsTo(models.suppliers, { as: 'supplier', foreignKey: 'supplier_id' });
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      this.belongsTo(models.users, { as: 'user', foreignKey: 'user_id' });
      this.hasMany(models.purchaseDetails, { as: 'details', foreignKey: 'purch_id' });
      this.hasMany(models.purchasePayments, { as: 'payments', foreignKey: 'purch_id' });
      this.hasMany(models.transferDetails, { as: 'transferDetails', foreignKey: 'purch_id' });
    }
  }

  purchases.init({
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    purch_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    purch_type: {
      type: DataTypes.ENUM('Contado', 'Credito'),
      allowNull: false,
      defaultValue: 'Contado'
    },
    payment_method: {
      type: DataTypes.ENUM('Efectivo', 'Transferencia', 'Cheque', 'Tarjeta'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Recibido', 'Pagado', 'Cancelado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    purch_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    due_payment: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    received_at: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'purchases',
    tableName: 'purchases',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return purchases;
};
