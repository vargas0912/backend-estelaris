'use strict';

const { data: userPrivileges } = require('../json_files/user-privileges.js');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fecha = new Date();

    // Agregar campos de timestamps a cada registro
    const data = userPrivileges.map(privilege => ({
      ...privilege,
      active: true,
      created_at: fecha,
      updated_at: fecha
    }));

    await queryInterface.bulkInsert('userprivileges', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userprivileges', null, {});
  }
};
