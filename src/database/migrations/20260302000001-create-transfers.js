'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transfers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      from_branch_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'branches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      to_branch_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'branches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      transfer_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('Borrador', 'En_Transito', 'Recibido', 'Cancelado'),
        defaultValue: 'Borrador'
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      received_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      driver_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      transport_plate: {
        allowNull: true,
        type: Sequelize.STRING(20)
      },
      notes: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      received_at: {
        allowNull: true,
        type: Sequelize.DATEONLY
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
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('transfers', ['from_branch_id']);
    await queryInterface.addIndex('transfers', ['to_branch_id']);
    await queryInterface.addIndex('transfers', ['user_id']);
    await queryInterface.addIndex('transfers', ['transfer_date']);
    await queryInterface.addIndex('transfers', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transfers');
  }
};
