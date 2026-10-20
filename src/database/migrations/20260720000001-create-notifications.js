'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'users' },
          key: 'id'
        }
      },
      created_by: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'users' },
          key: 'id'
        }
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      body: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      scheduled_at: {
        type: Sequelize.DATE
      },
      due_at: {
        type: Sequelize.DATE
      },
      read_at: {
        type: Sequelize.DATE
      },
      cancelled_at: {
        type: Sequelize.DATE
      },
      archived_at: {
        type: Sequelize.DATE
      },
      batch_id: {
        allowNull: false,
        type: Sequelize.UUID
      },
      ref_type: {
        type: Sequelize.STRING
      },
      ref_id: {
        type: Sequelize.INTEGER
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
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('notifications', ['user_id', 'read_at'], { name: 'notifications_user_read_idx' });
    await queryInterface.addIndex('notifications', ['batch_id'], { name: 'notifications_batch_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  }
};
