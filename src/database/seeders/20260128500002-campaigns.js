'use strict';

const campaignsData = require('./json_files/campaigns.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const campaigns = campaignsData.map(campaign => ({
      ...campaign,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('campaigns', campaigns, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('campaigns', null, {});
  }
};
