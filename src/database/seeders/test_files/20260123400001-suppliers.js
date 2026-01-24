'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const suppliers = [
      {
        id: 1,
        name: 'Proveedor Test 1',
        trade_name: 'Test 1',
        tax_id: 'TEST000001AAA',
        contact_name: 'Contacto Test 1',
        email: 'proveedor1@test.com',
        phone: '8181111111',
        mobile: '8112222222',
        address: 'Calle Test 100',
        municipality_id: 1,
        postal_code: '64000',
        website: 'https://test1.com',
        payment_terms: '30 días',
        credit_limit: 50000.00,
        notes: 'Proveedor de prueba 1',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Proveedor Test 2',
        trade_name: 'Test 2',
        tax_id: 'TEST000002BBB',
        contact_name: 'Contacto Test 2',
        email: 'proveedor2@test.com',
        phone: '8183333333',
        mobile: '8114444444',
        address: 'Calle Test 200',
        municipality_id: 1,
        postal_code: '64100',
        website: null,
        payment_terms: '15 días',
        credit_limit: 25000.00,
        notes: 'Proveedor de prueba 2',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Proveedor Test 3 Inactivo',
        trade_name: null,
        tax_id: null,
        contact_name: null,
        email: 'proveedor3@test.com',
        phone: '8185555555',
        mobile: null,
        address: null,
        municipality_id: null,
        postal_code: null,
        website: null,
        payment_terms: null,
        credit_limit: 0,
        notes: 'Proveedor inactivo para pruebas',
        is_active: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('suppliers', suppliers, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('suppliers', null, {});
  }
};
