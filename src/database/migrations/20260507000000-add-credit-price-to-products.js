'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'credit_price', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0.00,
      after: 'base_price'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'credit_price');
  }
};
