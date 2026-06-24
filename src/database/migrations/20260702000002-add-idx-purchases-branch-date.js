'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('purchases', ['branch_id', 'purch_date'], {
      name: 'idx_purchases_branch_id_purch_date',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('purchases', 'idx_purchases_branch_id_purch_date');
  }
};
