'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class privilegeTemplates extends Model {
    static associate(models) {
      this.hasMany(models.privilegeTemplateItems, { as: 'items', foreignKey: 'template_id' });
      this.hasMany(models.users, { as: 'users', foreignKey: 'template_id' });
    }
  }
  privilegeTemplates.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'privilegeTemplates',
    tableName: 'privilege_templates'
  });

  return privilegeTemplates;
};
