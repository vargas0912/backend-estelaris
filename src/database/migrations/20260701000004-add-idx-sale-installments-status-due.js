'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('sale_installments', ['status', 'due_date'], {
      name: 'idx_sale_installments_status_due_date',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('sale_installments', 'idx_sale_installments_status_due_date');
  }
};
