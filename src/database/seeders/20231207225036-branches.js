'use strict';

const { data } = require('./json_files/branches');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const branches = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('branches', branches, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('branches', null, {});
  }
};
