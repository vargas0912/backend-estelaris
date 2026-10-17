'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class userprivileges extends Model {
    static associate(models) {
      userprivileges.belongsTo(models.users, { as: 'users', foreignKey: 'user_id' });
      userprivileges.belongsTo(models.privileges, { as: 'privileges', foreignKey: 'privilege_id' });
      userprivileges.belongsTo(models.privilegeTemplates, { as: 'template', foreignKey: 'source_template_id' });
    }
  }
  userprivileges.init({
    active: DataTypes.INTEGER,
    source_template_id: DataTypes.INTEGER
  }, {
    sequelize,
    paranoid: true,
    modelName: 'userprivileges'
  });

  return userprivileges;
};
