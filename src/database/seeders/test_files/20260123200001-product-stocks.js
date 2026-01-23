'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productStocks = [
      // Producto 1 en sucursal 1
      {
        id: 1,
        product_id: 1,
        branch_id: 1,
        quantity: 100,
        min_stock: 10,
        max_stock: 200,
        location: 'A-01-01',
        last_count_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      // Producto 1 en sucursal 2
      {
        id: 2,
        product_id: 1,
        branch_id: 2,
        quantity: 50,
        min_stock: 5,
        max_stock: 100,
        location: 'A-01-02',
        last_count_date: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Producto 2 en sucursal 1
      {
        id: 3,
        product_id: 2,
        branch_id: 1,
        quantity: 75,
        min_stock: 8,
        max_stock: 150,
        location: 'B-02-01',
        last_count_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      // Producto 3 en sucursal 1
      {
        id: 4,
        product_id: 3,
        branch_id: 1,
        quantity: 25.5,
        min_stock: 5,
        max_stock: 50,
        location: 'C-03-01',
        last_count_date: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('product_stocks', productStocks, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_stocks', null, {});
  }
};
