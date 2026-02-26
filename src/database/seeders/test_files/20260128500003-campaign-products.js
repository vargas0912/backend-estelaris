'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const campaignProducts = [
      {
        id: 1,
        campaign_id: 1,
        product_id: 'TEST-001',
        discount_type: 'percentage',
        discount_value: 25.00,
        max_quantity: 100,
        sold_quantity: 0,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        campaign_id: 1,
        product_id: 'TEST-002',
        discount_type: 'percentage',
        discount_value: 30.00,
        max_quantity: 50,
        sold_quantity: 0,
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        campaign_id: 1,
        product_id: 'TEST-003',
        discount_type: 'fixed_price',
        discount_value: 50.00,
        max_quantity: 25,
        sold_quantity: 0,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('campaign_products', campaignProducts, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('campaign_products', null, {});
  }
};
