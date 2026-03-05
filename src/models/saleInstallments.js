'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class saleInstallments extends Model {
    static associate(models) {
      this.belongsTo(models.sales, { as: 'sale', foreignKey: 'sale_id' });
    }
  }

  saleInstallments.init({
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    installment_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    paid_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('Pendiente', 'Pagado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    paid_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: false,
    modelName: 'saleInstallments',
    tableName: 'sale_installments',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return saleInstallments;
};
