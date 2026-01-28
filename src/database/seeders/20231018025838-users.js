'use strict';

const { encrypt } = require('../../utils/handlePassword');
const { data } = require('./json_files/users');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    const users = await Promise.all(
      data.map(async(user) => ({
        name: user.name,
        email: user.email,
        password: await encrypt(user.password),
        role: user.role,
        created_at: new Date(),
        updated_at: new Date()
      }))
    );

    await queryInterface.bulkInsert('users', users, {});
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
