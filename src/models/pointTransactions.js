'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class pointTransactions extends Model {
    static associate(models) {
      this.belongsTo(models.customers, { foreignKey: 'customer_id' });
      this.belongsTo(models.users, { foreignKey: 'user_id' });
    }
  }

  pointTransactions.init({
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('earn', 'redeem', 'expire', 'adjust', 'void'),
      allowNull: false
    },
    points: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    balance_after: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    reference_type: {
      type: DataTypes.ENUM('sale', 'payment', 'admin', 'expiry'),
      allowNull: false
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    paranoid: true,
    modelName: 'pointTransactions',
    tableName: 'point_transactions',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  return pointTransactions;
};
