'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CampaignProductBranches extends Model {
    static associate(models) {
      // Un override pertenece a un producto de campaña
      CampaignProductBranches.belongsTo(models.CampaignProducts, {
        foreignKey: 'campaign_product_id',
        as: 'campaignProduct'
      });

      // Un override pertenece a una sucursal
      CampaignProductBranches.belongsTo(models.Branches, {
        foreignKey: 'branch_id',
        as: 'branch'
      });
    }

    /**
     * Obtiene el valor de override
     * @returns {number}
     */
    getOverrideValue() {
      return parseFloat(this.discount_value_override);
    }
  }

  CampaignProductBranches.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      campaign_product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El ID del producto de campaña es requerido'
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
      },
      discount_value_override: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El valor de override del descuento es requerido'
          },
          min: {
            args: [0.01],
            msg: 'El valor del override debe ser mayor a 0'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'CampaignProductBranches',
      tableName: 'campaign_product_branches',
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  );

  return CampaignProductBranches;
};
