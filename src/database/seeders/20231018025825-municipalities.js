'use strict';

const { data } = require('./json_files/municipalities');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const municipalities = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('municipalities', municipalities, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('municipalities', null, {});
  }
};
