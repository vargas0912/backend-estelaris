'use strict';

const { encrypt } = require('../../../utils/handlePassword');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    const password = await encrypt('superadmin');
    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@estelaris.com',
        password,
        role: 'superadmin',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
