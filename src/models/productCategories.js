'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class productCategories extends Model {
    static associate(models) {
      this.hasMany(models.products, {
        as: 'products',
        foreignKey: 'category_id'
      });
    }
  }
  productCategories.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    paranoid: true,
    modelName: 'productCategories',
    tableName: 'product_categories',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return productCategories;
};
