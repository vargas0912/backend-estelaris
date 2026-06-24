'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('expenses', ['branch_id', 'trans_date'], {
      name: 'idx_expenses_branch_id_trans_date',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('expenses', 'idx_expenses_branch_id_trans_date');
  }
};
