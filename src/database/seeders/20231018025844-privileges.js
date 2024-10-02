'use strict';

const { data } = require('./json_files/privileges');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('privileges', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('privileges', null, {});
  }
};
