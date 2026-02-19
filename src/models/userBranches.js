'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class userBranches extends Model {
    static associate(models) {
      this.belongsTo(models.users, {
        foreignKey: 'user_id',
        as: 'user'
      });

      this.belongsTo(models.branches, {
        foreignKey: 'branch_id',
        as: 'branch'
      });
    }
  }

  userBranches.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El ID del usuario es requerido'
          }
        }
      },
      branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El ID de la sucursal es requerido'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'userBranches',
      tableName: 'user_branches',
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  );

  return userBranches;
};
