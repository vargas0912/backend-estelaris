'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales', 'anticipo_amount', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      after: 'discount_amount'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sales', 'anticipo_amount');
  }
};
