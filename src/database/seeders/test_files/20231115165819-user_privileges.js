'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // NO insertamos user_privileges en el seeder de test
    // porque el seeder de users ya no crea usuarios
    // Esto permite probar el bootstrap inicial
    // Los tests crearán las relaciones user-privilege según sea necesario
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userprivileges', null, {});
  }
};
