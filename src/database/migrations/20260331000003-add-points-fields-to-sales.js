'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales', 'points_redeemed', {
      type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0, after: 'anticipo_amount'
    });
    await queryInterface.addColumn('sales', 'points_discount', {
      type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0, after: 'points_redeemed'
    });
    await queryInterface.addColumn('sales', 'points_earned', {
      type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0, after: 'points_discount'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('sales', 'points_redeemed');
    await queryInterface.removeColumn('sales', 'points_discount');
    await queryInterface.removeColumn('sales', 'points_earned');
  }
};
