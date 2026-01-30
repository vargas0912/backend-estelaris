'use strict';

const data = require('./json_files/customer-addresses.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const addresses = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('customer_addresses', addresses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customer_addresses', null, {});
  }
};
