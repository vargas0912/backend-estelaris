const { data } = require('./json_files/states');

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('states', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('states', null, {});
  }
};
