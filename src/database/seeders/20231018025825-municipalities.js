const { data } = require('./json_files/municipalities');

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('municipalities', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('municipalities', null, {});
  }
};
