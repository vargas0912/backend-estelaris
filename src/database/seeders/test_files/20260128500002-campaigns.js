'use strict';

const { data: campaignsData } = require('../json_files/campaigns');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const campaigns = campaignsData.map(campaign => ({
      ...campaign,
      start_date: new Date(campaign.start_date),
      end_date: new Date(campaign.end_date),
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('campaigns', campaigns, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('campaigns', null, {});
  }
};
