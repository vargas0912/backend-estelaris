'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_product_branches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaign_product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'campaign_products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      discount_value_override: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Override discount value for this specific branch'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Índice único para evitar múltiples overrides para la misma combinación
    await queryInterface.addIndex('campaign_product_branches', ['campaign_product_id', 'branch_id'], {
      unique: true,
      name: 'idx_campaign_product_branches_unique',
      where: {
        deleted_at: null
      }
    });

    // Índices para búsquedas
    await queryInterface.addIndex('campaign_product_branches', ['campaign_product_id'], {
      name: 'idx_campaign_product_branches_cp_id'
    });

    await queryInterface.addIndex('campaign_product_branches', ['branch_id'], {
      name: 'idx_campaign_product_branches_branch_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaign_product_branches');
  }
};
