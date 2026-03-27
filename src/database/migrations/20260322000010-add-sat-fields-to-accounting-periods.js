'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('accounting_periods', 'sat_catalog_xml', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'balance_snapshot'
    });

    await queryInterface.addColumn('accounting_periods', 'sat_vouchers_xml', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'sat_catalog_xml'
    });

    await queryInterface.addColumn('accounting_periods', 'sat_submitted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'sat_vouchers_xml'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('accounting_periods', 'sat_submitted_at');
    await queryInterface.removeColumn('accounting_periods', 'sat_vouchers_xml');
    await queryInterface.removeColumn('accounting_periods', 'sat_catalog_xml');
  }
};
