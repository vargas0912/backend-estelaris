'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // No crear user_privileges en el seeder de tests
    // Los usuarios se crean en los tests, por lo tanto no hay user_id disponible
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userprivileges', null, {});
  }
};
