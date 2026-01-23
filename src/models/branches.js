'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class branches extends Model {
    static associate(models) {
      this.belongsTo(models.municipalities, { as: 'municipio', foreignKey: 'municipality_id' });
      this.hasMany(models.employees, { as: 'employees', foreignKey: 'branch_id' });
      this.hasMany(models.productStocks, { as: 'stocks', foreignKey: 'branch_id' });
    }
  }

  branches.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    sequelize,
    paranoid: true,
    modelName: 'branches'
  });

  return branches;
};
