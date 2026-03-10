'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('system_settings', [
      {
        category: 'formats',
        key: 'date_format',
        value: 'DD/MM/YYYY',
        label: 'Formato de fecha',
        description: null,
        data_type: 'string',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'formats',
        key: 'currency',
        value: 'MXN',
        label: 'Moneda',
        description: null,
        data_type: 'string',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'formats',
        key: 'timezone',
        value: 'America/Mexico_City',
        label: 'Zona horaria',
        description: null,
        data_type: 'string',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'formats',
        key: 'decimal_places',
        value: '2',
        label: 'Decimales',
        description: null,
        data_type: 'integer',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category: 'inventory',
        key: 'low_stock_threshold',
        value: '5',
        label: 'Umbral de stock bajo',
        description: null,
        data_type: 'integer',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('system_settings', null, {});
  }
};
