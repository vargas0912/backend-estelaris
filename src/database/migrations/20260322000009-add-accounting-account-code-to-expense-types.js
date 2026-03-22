'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('expense_types', 'accounting_account_code', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'name'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('expense_types', 'accounting_account_code');
  }
};
