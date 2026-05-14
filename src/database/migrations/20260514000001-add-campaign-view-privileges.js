'use strict';
const { CAMPAIGN, CAMPAIGN_PRODUCT } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: CAMPAIGN.NAME_VIEW_BRANCHES, codeName: CAMPAIGN.VIEW_BRANCHES, module: CAMPAIGN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CAMPAIGN.NAME_VIEW_STATS, codeName: CAMPAIGN.VIEW_STATS, module: CAMPAIGN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: CAMPAIGN_PRODUCT.NAME_VIEW_OVERRIDES, codeName: CAMPAIGN_PRODUCT.VIEW_OVERRIDES, module: CAMPAIGN_PRODUCT.MODULE_NAME, created_at: fecha, updated_at: fecha }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('privileges', privileges);
  },

  async down(queryInterface) {
    const codeNames = privileges.map(p => p.codeName);
    await queryInterface.bulkDelete('privileges', { codeName: codeNames });
  }
};
