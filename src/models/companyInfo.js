'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class companyInfo extends Model {
    static associate() {
      // Singleton — sin asociaciones
    }
  }

  companyInfo.init({
    company_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    trade_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    rfc: {
      type: DataTypes.STRING(13),
      allowNull: false
    },
    fiscal_regime: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    fiscal_address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    zip_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    fiscal_email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'companyInfo',
    tableName: 'company_info',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return companyInfo;
};
