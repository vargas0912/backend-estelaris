'use strict';

const { data: privileges } = require('../json_files/privileges.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('privileges', privileges, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('privileges', null, {});
  }
};
