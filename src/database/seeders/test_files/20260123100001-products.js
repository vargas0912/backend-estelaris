'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const products = [
      {
        id: 1,
        sku: 'TEST-001',
        barcode: '1234567890001',
        name: 'Producto Test 1',
        description: 'Descripción del producto de prueba 1',
        short_description: 'Producto test 1',
        category_id: 1,
        unit_of_measure: 'piece',
        cost_price: 100.00,
        base_price: 150.00,
        weight: 10.00,
        dimensions: JSON.stringify({ length: 50, width: 30, height: 20 }),
        images: JSON.stringify(['test1.jpg']),
        is_active: true,
        is_featured: true,
        seo_title: 'Producto Test 1',
        seo_description: 'Producto de prueba',
        seo_keywords: 'test, producto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        sku: 'TEST-002',
        barcode: '1234567890002',
        name: 'Producto Test 2',
        description: 'Descripción del producto de prueba 2',
        short_description: 'Producto test 2',
        category_id: 2,
        unit_of_measure: 'piece',
        cost_price: 200.00,
        base_price: 300.00,
        weight: 15.00,
        dimensions: JSON.stringify({ length: 60, width: 40, height: 30 }),
        images: JSON.stringify(['test2.jpg']),
        is_active: true,
        is_featured: false,
        seo_title: 'Producto Test 2',
        seo_description: 'Producto de prueba 2',
        seo_keywords: 'test, producto',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        sku: 'TEST-003',
        barcode: '1234567890003',
        name: 'Producto Test 3',
        description: 'Descripción del producto de prueba 3',
        short_description: 'Producto test 3',
        category_id: 3,
        unit_of_measure: 'kg',
        cost_price: 50.00,
        base_price: 75.00,
        weight: 5.00,
        dimensions: null,
        images: null,
        is_active: true,
        is_featured: false,
        seo_title: null,
        seo_description: null,
        seo_keywords: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('products', products, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
