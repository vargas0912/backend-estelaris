'use strict';

const data = require('./json_files/customers.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const customers = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('customers', customers, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('customers', null, {});
  }
};
