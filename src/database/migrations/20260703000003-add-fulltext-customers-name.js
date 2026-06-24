'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('customers', ['name'], {
      name: 'ft_customers_name',
      type: 'FULLTEXT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('customers', 'ft_customers_name');
  }
};
