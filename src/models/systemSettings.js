'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class systemSettings extends Model {
    static associate() {
      // Tabla key-value autónoma — sin asociaciones
    }
  }

  systemSettings.init({
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    label: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    data_type: {
      type: DataTypes.ENUM('string', 'integer', 'decimal', 'boolean'),
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'systemSettings',
    tableName: 'system_settings',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return systemSettings;
};
