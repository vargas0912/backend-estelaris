'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class campaigns extends Model {
    static associate(models) {
      // Una campaña tiene muchos productos
      this.hasMany(models.campaignProducts, {
        foreignKey: 'campaign_id',
        as: 'campaignProducts'
      });

      // Una campaña puede aplicar a varias sucursales
      this.hasMany(models.campaignBranches, {
        foreignKey: 'campaign_id',
        as: 'campaignBranches'
      });

      // Relación many-to-many con sucursales a través de CampaignBranches
      this.belongsToMany(models.branches, {
        through: models.campaignBranches,
        foreignKey: 'campaign_id',
        otherKey: 'branch_id',
        as: 'branches'
      });
    }

    /**
     * Verifica si la campaña está actualmente válida (activa y dentro del período)
     * @returns {boolean}
     */
    isCurrentlyValid() {
      if (!this.is_active) {
        return false;
      }

      const now = new Date();
      const start = new Date(this.start_date);
      const end = new Date(this.end_date);

      return now >= start && now <= end;
    }

    /**
     * Verifica si la campaña aplica a una sucursal específica
     * @param {number} branchId - ID de la sucursal
     * @returns {Promise<boolean>}
     */
    async isAvailableForBranch(branchId) {
      // Si no hay registros en campaign_branches, aplica a todas las sucursales
      const branches = await this.getBranches();

      if (!branches || branches.length === 0) {
        return true; // Aplica a todas
      }

      // Verificar si la sucursal está en la lista
      return branches.some(branch => branch.id === branchId);
    }

    /**
     * Obtiene el estado de la campaña (active/upcoming/finished)
     * @returns {string}
     */
    getStatus() {
      const now = new Date();
      const start = new Date(this.start_date);
      const end = new Date(this.end_date);

      if (!this.is_active) {
        return 'inactive';
      }

      if (now < start) {
        return 'upcoming';
      }

      if (now > end) {
        return 'finished';
      }

      return 'active';
    }
  }

  campaigns.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'El nombre de la campaña es requerido'
          },
          len: {
            args: [3, 100],
            msg: 'El nombre debe tener entre 3 y 100 caracteres'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'La fecha de inicio es requerida'
          },
          isDate: {
            msg: 'Debe ser una fecha válida'
          }
        }
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'La fecha de fin es requerida'
          },
          isDate: {
            msg: 'Debe ser una fecha válida'
          },
          isAfterStartDate(value) {
            if (this.start_date && new Date(value) <= new Date(this.start_date)) {
              throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
            }
          }
        }
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: 'La prioridad debe ser un número entero'
          },
          min: {
            args: [0],
            msg: 'La prioridad debe ser mayor o igual a 0'
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'campaigns',
      tableName: 'campaigns',
      timestamps: true,
      paranoid: true,
      underscored: true
    }
  );

  return campaigns;
};
