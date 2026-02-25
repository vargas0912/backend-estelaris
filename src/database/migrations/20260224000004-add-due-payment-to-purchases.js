'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('purchases', 'due_payment', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Importe pendiente de pago',
      after: 'purch_total'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('purchases', 'due_payment');
  }
};
