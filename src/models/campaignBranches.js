'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class campaignBranches extends Model {
    static associate(models) {
      // Una asignación de campaña-sucursal pertenece a una campaña
      this.belongsTo(models.campaigns, {
        foreignKey: 'campaign_id',
        as: 'campaign'
      });

      // Una asignación de campaña-sucursal pertenece a una sucursal
      this.belongsTo(models.branches, {
        foreignKey: 'branch_id',
        as: 'branch'
      });
    }
  }

  campaignBranches.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      campaign_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El ID de la campaña es requerido'
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
      modelName: 'campaignBranches',
      tableName: 'campaign_branches',
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  );

  return campaignBranches;
};
