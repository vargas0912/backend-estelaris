'use strict';

const { data } = require('./json_files/price-lists');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const priceLists = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('price_lists', priceLists, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('price_lists', null, {});
  }
};
