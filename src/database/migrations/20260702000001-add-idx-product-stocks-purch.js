'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('product_stocks', ['purch_id'], {
      name: 'idx_product_stocks_purch_id',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('product_stocks', 'idx_product_stocks_purch_id');
  }
};
