'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    // NO insertamos ningún usuario en el seeder de test
    // Esto permite probar el bootstrap inicial (registro del primer superadmin sin autenticación)
    // Los tests crearán los usuarios según sea necesario
    // NOTA: Una vez creado el primer superadmin, el endpoint /registerSuperUser
    // requerirá autenticación (CRIT-001 security fix)
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
