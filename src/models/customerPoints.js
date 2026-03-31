'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class customerPoints extends Model {
    static associate(models) {
      this.belongsTo(models.customers, { foreignKey: 'customer_id' });
    }
  }

  customerPoints.init({
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    total_points: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    lifetime_points: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'customerPoints',
    tableName: 'customer_points',
    underscored: true,
    timestamps: false
  });

  return customerPoints;
};
