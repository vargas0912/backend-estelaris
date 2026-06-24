'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('sales', ['branch_id', 'sales_date'], {
      name: 'idx_sales_branch_id_sales_date',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('sales', 'idx_sales_branch_id_sales_date');
  }
};
