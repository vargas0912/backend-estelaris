'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    // NO insertamos user_branches en el seeder de test
    // porque el seeder de users no crea usuarios de antemano
    // Los tests crearán las relaciones user-branch según sea necesario
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_branches', null, {});
  }
};
