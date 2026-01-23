'use strict';

const { data } = require('./json_files/employees');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('employees', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employees', null, {});
  }
};
