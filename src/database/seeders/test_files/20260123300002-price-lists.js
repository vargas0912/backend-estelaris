'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const priceLists = [
      {
        id: 1,
        name: 'Público',
        description: 'Precio público general',
        discount_percent: 0,
        is_active: true,
        priority: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Mayoreo',
        description: 'Precio mayoreo',
        discount_percent: 10,
        is_active: true,
        priority: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'VIP',
        description: 'Precio clientes VIP',
        discount_percent: 20,
        is_active: true,
        priority: 3,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('price_lists', priceLists, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('price_lists', null, {});
  }
};
