'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class products extends Model {
    static associate(models) {
      this.belongsTo(models.productCategories, {
        as: 'category',
        foreignKey: 'category_id'
      });
      this.hasMany(models.productStocks, {
        as: 'stocks',
        foreignKey: 'product_id'
      });
    }
  }
  products.init({
    sku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    short_description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    unit_of_measure: {
      type: DataTypes.ENUM('piece', 'kg', 'lt', 'mt', 'box'),
      allowNull: false,
      defaultValue: 'piece'
    },
    cost_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    base_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    seo_title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    seo_description: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    seo_keywords: {
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'products',
    tableName: 'products',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return products;
};
