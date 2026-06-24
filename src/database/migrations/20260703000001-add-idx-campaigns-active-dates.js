'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('campaigns', ['is_active', 'start_date', 'end_date'], {
      name: 'idx_campaigns_is_active_start_date_end_date',
      using: 'BTREE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('campaigns', 'idx_campaigns_is_active_start_date_end_date');
  }
};
