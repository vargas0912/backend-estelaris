'use strict';

const { data } = require('./json_files/product-stocks');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productStocks = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('product_stocks', productStocks, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_stocks', null, {});
  }
};
