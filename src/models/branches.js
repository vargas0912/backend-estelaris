'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class branches extends Model {
    static associate(models) {
      this.belongsTo(models.municipalities, {
        as: 'municipio',
        foreignKey: 'municipality_id'
      });
      this.hasMany(models.employees, {
        as: 'employees',
        foreignKey: 'branch_id'
      });
      this.hasMany(models.productStocks, {
        as: 'stocks',
        foreignKey: 'branch_id'
      });
      this.hasMany(models.customers, {
        as: 'customers',
        foreignKey: 'branch_id'
      });
      this.belongsToMany(models.users, {
        through: models.userBranches,
        as: 'users',
        foreignKey: 'branch_id',
        otherKey: 'user_id'
      });
      this.hasMany(models.purchases, { as: 'purchases', foreignKey: 'branch_id' });
      this.hasMany(models.stockMovements, { as: 'stockMovements', foreignKey: 'branch_id' });
      this.hasMany(models.transfers, { as: 'outgoingTransfers', foreignKey: 'from_branch_id' });
      this.hasMany(models.transfers, { as: 'incomingTransfers', foreignKey: 'to_branch_id' });
    }
  }

  branches.init(
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      phone: DataTypes.STRING,
      opening_date: DataTypes.DATE,
      ticket_prefix: {
        type: DataTypes.STRING(5),
        allowNull: true
      }
    },
    {
      sequelize,
      paranoid: true,
      modelName: 'branches'
    }
  );

  return branches;
};
