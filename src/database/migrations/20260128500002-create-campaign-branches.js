'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_branches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'campaigns',
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

    // Índice único para evitar duplicados
    await queryInterface.addIndex('campaign_branches', ['campaign_id', 'branch_id'], {
      unique: true,
      name: 'idx_campaign_branches_unique',
      where: {
        deleted_at: null
      }
    });

    // Índices para búsquedas
    await queryInterface.addIndex('campaign_branches', ['campaign_id'], {
      name: 'idx_campaign_branches_campaign_id'
    });

    await queryInterface.addIndex('campaign_branches', ['branch_id'], {
      name: 'idx_campaign_branches_branch_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaign_branches');
  }
};
