'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('transfers', ['from_branch_id', 'transfer_date'], {
      name: 'idx_transfers_from_branch_id_transfer_date',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('transfers', 'idx_transfers_from_branch_id_transfer_date');
  }
};
