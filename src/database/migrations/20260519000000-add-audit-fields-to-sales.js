'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales', 'modified_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      after: 'notes'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sales', 'modified_by');
  }
};
