'use strict';

const { data } = require('./json_files/user-privileges');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fecha = new Date();

    const userPrivileges = data.map(item => ({
      ...item,
      created_at: fecha,
      updated_at: fecha
    }));

    await queryInterface.bulkInsert('userprivileges', userPrivileges, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userprivileges', null, {});
  }
};
