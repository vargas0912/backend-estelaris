'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class suppliers extends Model {
    static associate(models) {
      this.belongsTo(models.municipalities, {
        as: 'municipality',
        foreignKey: 'municipality_id'
      });
    }
  }

  suppliers.init({
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    trade_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    tax_id: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    municipality_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    payment_terms: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    credit_limit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0
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
    modelName: 'suppliers',
    tableName: 'suppliers',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return suppliers;
};
