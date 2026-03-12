'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class expenses extends Model {
    static associate(models) {
      expenses.belongsTo(models.branches, { as: 'branch', foreignKey: 'branch_id' });
      expenses.belongsTo(models.users, { as: 'user', foreignKey: 'user_id' });
      expenses.belongsTo(models.expense_types, { as: 'expenseType', foreignKey: 'expense_type_id' });
    }
  }
  expenses.init({
    branch_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    expense_type_id: DataTypes.INTEGER,
    trans_date: DataTypes.DATEONLY,
    expense_amount: DataTypes.DECIMAL(12, 2),
    notes: DataTypes.TEXT
  }, {
    sequelize,
    paranoid: true,
    modelName: 'expenses',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return expenses;
};
