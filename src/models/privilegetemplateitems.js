'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class privilegeTemplateItems extends Model {
    static associate(models) {
      this.belongsTo(models.privilegeTemplates, { as: 'template', foreignKey: 'template_id' });
      this.belongsTo(models.privileges, { as: 'privilege', foreignKey: 'privilege_id' });
    }
  }
  privilegeTemplateItems.init({
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    privilege_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'privilegeTemplateItems',
    tableName: 'privilege_template_items'
  });

  return privilegeTemplateItems;
};
