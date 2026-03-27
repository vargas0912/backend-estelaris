'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounting_accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('activo', 'pasivo', 'capital', 'ingreso', 'egreso', 'costo'),
        allowNull: false
      },
      nature: {
        type: Sequelize.ENUM('deudora', 'acreedora'),
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'accounting_accounts', key: 'id' },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT'
      },
      allows_movements: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('accounting_accounts', ['parent_id']);
    await queryInterface.addIndex('accounting_accounts', ['type']);
    await queryInterface.addIndex('accounting_accounts', ['level']);
    await queryInterface.addIndex('accounting_accounts', ['active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('accounting_accounts');
  }
};
