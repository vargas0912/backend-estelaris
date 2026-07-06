'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('sale_payments', 'payment_type', {
      type: Sequelize.ENUM('Anticipo', 'Abono', 'Liquidacion'),
      allowNull: false,
      defaultValue: 'Abono'
    });
  },

  async down(queryInterface, Sequelize) {
    // Only safe to revert if no 'Liquidacion' rows exist
    await queryInterface.changeColumn('sale_payments', 'payment_type', {
      type: Sequelize.ENUM('Anticipo', 'Abono'),
      allowNull: false,
      defaultValue: 'Abono'
    });
  }
};
