'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class campaignProducts extends Model {
    static associate(models) {
      // Un producto de campaña pertenece a una campaña
      this.belongsTo(models.campaigns, {
        foreignKey: 'campaign_id',
        as: 'campaign'
      });

      // Un producto de campaña pertenece a un producto
      this.belongsTo(models.products, {
        foreignKey: 'product_id',
        as: 'product'
      });

      // Un producto de campaña puede tener múltiples overrides por sucursal
      this.hasMany(models.campaignProductBranches, {
        foreignKey: 'campaign_product_id',
        as: 'branchOverrides'
      });
    }

    /**
     * Calcula el precio efectivo después de aplicar el descuento
     * @param {number} basePrice - Precio base del producto
     * @param {number|null} branchId - ID de la sucursal (para verificar overrides)
     * @returns {Promise<number>}
     */
    async calculateEffectivePrice(basePrice, branchId = null) {
      let discountValue = this.discount_value;

      // Verificar si hay override para la sucursal
      if (branchId) {
        const override = await this.getBranchOverride(branchId);
        if (override) {
          discountValue = override;
        }
      }

      if (this.discount_type === 'percentage') {
        const discountAmount = (basePrice * discountValue) / 100;
        return parseFloat((basePrice - discountAmount).toFixed(2));
      } else if (this.discount_type === 'fixed_price') {
        return parseFloat(discountValue);
      }

      return basePrice;
    }

    /**
     * Obtiene el valor de override para una sucursal específica
     * @param {number} branchId - ID de la sucursal
     * @returns {Promise<number|null>}
     */
    async getBranchOverride(branchId) {
      const CampaignProductBranches = sequelize.models.CampaignProductBranches;

      const override = await CampaignProductBranches.findOne({
        where: {
          campaign_product_id: this.id,
          branch_id: branchId
        }
      });

      return override ? override.discount_value_override : null;
    }

    /**
     * Verifica si hay stock disponible
     * @param {number} quantity - Cantidad solicitada
     * @returns {boolean}
     */
    hasAvailableStock(quantity = 1) {
      // Si max_quantity es null, hay stock ilimitado
      if (this.max_quantity === null) {
        return true;
      }

      const remaining = this.max_quantity - this.sold_quantity;
      return remaining >= quantity;
    }

    /**
     * Obtiene la cantidad disponible restante
     * @returns {number|null}
     */
    getRemainingStock() {
      if (this.max_quantity === null) {
        return null; // Ilimitado
      }

      return Math.max(0, this.max_quantity - this.sold_quantity);
    }

    /**
     * Incrementa la cantidad vendida
     * @param {number} quantity - Cantidad a incrementar
     * @returns {Promise<void>}
     */
    async incrementSoldQuantity(quantity = 1) {
      if (!this.hasAvailableStock(quantity)) {
        throw new Error('No hay suficiente stock disponible para esta oferta');
      }

      this.sold_quantity += quantity;
      await this.save();
    }
  }

  campaignProducts.init(
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
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El ID del producto es requerido'
          }
        }
      },
      discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed_price'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El tipo de descuento es requerido'
          },
          isIn: {
            args: [['percentage', 'fixed_price']],
            msg: 'El tipo de descuento debe ser percentage o fixed_price'
          }
        }
      },
      discount_value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El valor del descuento es requerido'
          },
          min: {
            args: [0.01],
            msg: 'El valor del descuento debe ser mayor a 0'
          },
          isValidPercentage(value) {
            if (this.discount_type === 'percentage' && parseFloat(value) > 100) {
              throw new Error('El porcentaje de descuento no puede ser mayor a 100');
            }
          }
        }
      },
      max_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: {
            args: [1],
            msg: 'La cantidad máxima debe ser mayor a 0'
          }
        }
      },
      sold_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: 'La cantidad vendida no puede ser negativa'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'campaignProducts',
      tableName: 'campaign_products',
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  );

  return campaignProducts;
};
