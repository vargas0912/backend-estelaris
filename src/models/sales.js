'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class sales extends Model {
    static associate(models) {
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      this.belongsTo(models.customers, { as: 'customer', foreignKey: 'customer_id' });
      this.belongsTo(models.customerAddresses, { as: 'customerAddress', foreignKey: 'customer_address_id' });
      this.belongsTo(models.employees, { as: 'employee', foreignKey: 'employee_id' });
      this.belongsTo(models.users, { as: 'user', foreignKey: 'user_id' });
      this.belongsTo(models.priceLists, { as: 'priceList', foreignKey: 'price_list_id' });
      this.hasMany(models.saleDetails, { as: 'details', foreignKey: 'sale_id' });
      this.hasMany(models.salePayments, { as: 'payments', foreignKey: 'sale_id' });
      this.hasMany(models.saleInstallments, { as: 'installments', foreignKey: 'sale_id' });
      this.hasMany(models.saleDeliveries, { as: 'deliveries', foreignKey: 'sale_id' });
    }
  }

  sales.init({
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customer_address_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price_list_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sales_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    sales_type: {
      type: DataTypes.ENUM('Contado', 'Credito'),
      allowNull: false,
      defaultValue: 'Contado'
    },
    payment_periods: {
      type: DataTypes.ENUM('Semanal', 'Quincenal', 'Mensual'),
      allowNull: true
    },
    total_days_term: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    invoice: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ticket: {
      type: DataTypes.STRING(20),
      allowNull: true
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
    anticipo_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    points_redeemed: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    points_discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    points_earned: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    sales_total: {
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
    status: {
      type: DataTypes.ENUM('Pendiente', 'Pagado', 'Cancelado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    delivery_status: {
      type: DataTypes.ENUM('Entregado', 'Pendiente'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'sales',
    tableName: 'sales',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return sales;
};
