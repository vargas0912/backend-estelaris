'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    static associate(models) {
      this.hasMany(models.userprivileges, { as: 'privilegios', foreignKey: 'user_id' });
      this.hasOne(models.customers, { as: 'customer', foreignKey: 'user_id' });
      this.belongsToMany(models.branches, {
        through: models.userBranches,
        as: 'branches',
        foreignKey: 'user_id',
        otherKey: 'branch_id'
      });
      this.hasMany(models.purchases, { as: 'purchases', foreignKey: 'user_id' });
      this.hasMany(models.purchasePayments, { as: 'purchasePayments', foreignKey: 'user_id' });
      this.hasMany(models.transfers, { as: 'dispatchedTransfers', foreignKey: 'user_id' });
      this.hasMany(models.transfers, { as: 'receivedTransfers', foreignKey: 'received_by' });
      this.hasOne(models.employees, { foreignKey: 'user_id', as: 'employee' });
      this.belongsTo(models.privilegeTemplates, { as: 'template', foreignKey: 'template_id' });
    }
  }
  users.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    must_change_password: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    template_id: DataTypes.INTEGER,
    template_applied_version: DataTypes.INTEGER
  }, {
    sequelize,
    paranoid: true,
    modelName: 'users'
  });

  return users;
};
