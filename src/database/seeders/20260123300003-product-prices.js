'use strict';

const { data } = require('./json_files/product-prices');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productPrices = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('product_prices', productPrices, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_prices', null, {});
  }
};
