'use strict';

const { data } = require('./json_files/suppliers');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const suppliers = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('suppliers', suppliers, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('suppliers', null, {});
  }
};
