'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const priceLists = [
      {
        id: 1,
        name: 'Público General',
        description: 'Precio de venta al público en general',
        discount_percent: 0,
        is_active: true,
        priority: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Mayoreo',
        description: 'Precio para compras al mayoreo (10+ piezas)',
        discount_percent: 10,
        is_active: true,
        priority: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Distribuidor',
        description: 'Precio especial para distribuidores autorizados',
        discount_percent: 20,
        is_active: true,
        priority: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        name: 'Empleados',
        description: 'Precio especial para empleados de la empresa',
        discount_percent: 15,
        is_active: true,
        priority: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        name: 'Promoción',
        description: 'Precios de promoción temporal',
        discount_percent: 25,
        is_active: false,
        priority: 5,
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
