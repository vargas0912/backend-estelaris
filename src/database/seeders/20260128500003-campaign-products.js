'use strict';

const campaignProductsData = require('./json_files/campaign-products.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const campaignProducts = campaignProductsData.map(cp => ({
      ...cp,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('campaign_products', campaignProducts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('campaign_products', null, {});
  }
};
