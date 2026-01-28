'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CampaignBranches extends Model {
    static associate(models) {
      // Una asignación de campaña-sucursal pertenece a una campaña
      CampaignBranches.belongsTo(models.campaigns, {
        foreignKey: 'campaign_id',
        as: 'campaign'
      });

      // Una asignación de campaña-sucursal pertenece a una sucursal
      CampaignBranches.belongsTo(models.branches, {
        foreignKey: 'branch_id',
        as: 'branch'
      });
    }
  }

  CampaignBranches.init(
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
      modelName: 'CampaignBranches',
      tableName: 'campaign_branches',
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  );

  return CampaignBranches;
};
