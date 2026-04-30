'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sale_payments', 'payment_type', {
      type: Sequelize.ENUM('Anticipo', 'Abono'),
      allowNull: false,
      defaultValue: 'Abono',
      after: 'notes'
    });

    await queryInterface.sequelize.query(
      'UPDATE sale_payments SET payment_type = \'Anticipo\' WHERE notes = \'Anticipo\''
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sale_payments', 'payment_type');
  }
};
