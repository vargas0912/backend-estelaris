'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('stock_movements', 'reference_type', {
      type: Sequelize.ENUM('purchase', 'sale', 'adjustment', 'reversal', 'transfer'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('stock_movements', 'reference_type', {
      type: Sequelize.ENUM('purchase', 'sale', 'adjustment', 'reversal'),
      allowNull: false
    });
  }
};
