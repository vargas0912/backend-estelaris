'use strict';

const { data } = require('./json_files/privileges');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const privileges = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('privileges', privileges, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('privileges', null, {});
  }
};
