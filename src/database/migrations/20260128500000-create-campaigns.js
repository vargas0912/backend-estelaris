'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaigns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Higher number = higher priority when multiple campaigns overlap'
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

    // Índices para optimizar consultas
    await queryInterface.addIndex('campaigns', ['is_active'], {
      name: 'idx_campaigns_is_active'
    });

    await queryInterface.addIndex('campaigns', ['start_date', 'end_date'], {
      name: 'idx_campaigns_date_range'
    });

    await queryInterface.addIndex('campaigns', ['priority'], {
      name: 'idx_campaigns_priority'
    });

    await queryInterface.addIndex('campaigns', ['name'], {
      name: 'idx_campaigns_name'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaigns');
  }
};
