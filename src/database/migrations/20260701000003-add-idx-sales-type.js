'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('sales', ['sales_type'], {
      name: 'idx_sales_sales_type',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('sales', 'idx_sales_sales_type');
  }
};
