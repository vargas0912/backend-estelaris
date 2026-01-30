'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class customers extends Model {
    static associate(models) {
      this.belongsTo(models.municipalities, { as: 'municipality', foreignKey: 'municipality_id' });
      this.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      this.belongsTo(models.users, { as: 'user', foreignKey: 'user_id' });
      this.hasMany(models.customerAddresses, { as: 'addresses', foreignKey: 'customer_id' });
    }
  }

  customers.init({
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    tax_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    is_international: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'México'
    },
    billing_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    municipality_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    paranoid: true,
    timestamps: true,
    underscored: true,
    modelName: 'customers'
  });

  return customers;
};
