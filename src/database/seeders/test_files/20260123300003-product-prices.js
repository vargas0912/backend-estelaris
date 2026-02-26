'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productPrices = [
      // TEST-001 en lista Público
      {
        id: 1,
        product_id: 'TEST-001',
        price_list_id: 1,
        price: 150.00,
        min_quantity: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // TEST-001 en lista Mayoreo
      {
        id: 2,
        product_id: 'TEST-001',
        price_list_id: 2,
        price: 135.00,
        min_quantity: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // TEST-001 en lista Mayoreo (precio escalonado)
      {
        id: 3,
        product_id: 'TEST-001',
        price_list_id: 2,
        price: 120.00,
        min_quantity: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      // TEST-002 en lista Público
      {
        id: 4,
        product_id: 'TEST-002',
        price_list_id: 1,
        price: 300.00,
        min_quantity: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // TEST-002 en lista VIP
      {
        id: 5,
        product_id: 'TEST-002',
        price_list_id: 3,
        price: 240.00,
        min_quantity: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // TEST-003 en lista Público
      {
        id: 6,
        product_id: 'TEST-003',
        price_list_id: 1,
        price: 75.00,
        min_quantity: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('product_prices', productPrices, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_prices', null, {});
  }
};
