'use strict';
const { SALE, SALE_PAYMENT, SALE_DELIVERY } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  // Ventas
  { name: SALE.NAME_ALL, codeName: SALE.VIEW_ALL, module: SALE.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE.NAME_ADD, codeName: SALE.ADD, module: SALE.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE.NAME_UPDATE, codeName: SALE.UPDATE, module: SALE.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE.NAME_CANCEL, codeName: SALE.CANCEL, module: SALE.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE.NAME_DELETE, codeName: SALE.DELETE, module: SALE.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE.NAME_VIEW_OVERDUE, codeName: SALE.VIEW_OVERDUE, module: SALE.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Cobros de venta
  { name: SALE_PAYMENT.NAME_ALL, codeName: SALE_PAYMENT.VIEW_ALL, module: SALE_PAYMENT.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE_PAYMENT.NAME_ADD, codeName: SALE_PAYMENT.ADD, module: SALE_PAYMENT.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE_PAYMENT.NAME_DELETE, codeName: SALE_PAYMENT.DELETE, module: SALE_PAYMENT.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Entregas de venta
  { name: SALE_DELIVERY.NAME_ALL, codeName: SALE_DELIVERY.VIEW_ALL, module: SALE_DELIVERY.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE_DELIVERY.NAME_ADD, codeName: SALE_DELIVERY.ADD, module: SALE_DELIVERY.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE_DELIVERY.NAME_UPDATE, codeName: SALE_DELIVERY.UPDATE, module: SALE_DELIVERY.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SALE_DELIVERY.NAME_DELETE, codeName: SALE_DELIVERY.DELETE, module: SALE_DELIVERY.MODULE_NAME, created_at: fecha, updated_at: fecha }
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
