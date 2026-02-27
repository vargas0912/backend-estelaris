'use strict';

const { data } = require('./json_files/purchases');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const records = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('purchases', records, {});

    // Obtener IDs insertados
    const [inserted] = await queryInterface.sequelize.query(
      'SELECT id FROM purchases ORDER BY id ASC LIMIT 2'
    );

    if (inserted.length >= 1) {
      const purchaseDetails = [
        {
          purch_id: inserted[0].id,
          product_id: 'SAL-001',
          qty: 10,
          unit_price: 100.00,
          discount: 0,
          tax_rate: 16,
          subtotal: 1000.00,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      if (inserted.length >= 2) {
        purchaseDetails.push({
          purch_id: inserted[1].id,
          product_id: 'SAL-001',
          qty: 25,
          unit_price: 100.00,
          discount: 0,
          tax_rate: 16,
          subtotal: 2500.00,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      await queryInterface.bulkInsert('purchase_details', purchaseDetails, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('purchase_details', null, {});
    await queryInterface.bulkDelete('purchases', null, {});
  }
};
