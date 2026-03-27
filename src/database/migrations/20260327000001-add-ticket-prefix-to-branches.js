'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('branches', 'ticket_prefix', {
      type: Sequelize.STRING(5),
      allowNull: true,
      after: 'opening_date'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('branches', 'ticket_prefix');
  }
};
