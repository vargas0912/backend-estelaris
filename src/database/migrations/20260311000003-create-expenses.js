'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'branches', key: 'id' },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT'
      },
      expense_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'expense_types', key: 'id' },
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT'
      },
      trans_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      expense_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('expenses', ['branch_id']);
    await queryInterface.addIndex('expenses', ['user_id']);
    await queryInterface.addIndex('expenses', ['expense_type_id']);
    await queryInterface.addIndex('expenses', ['trans_date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('expenses');
  }
};
