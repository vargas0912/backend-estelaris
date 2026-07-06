'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales', 'settlement_discount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: null,
      after: 'due_date'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sales', 'settlement_discount');
  }
};
