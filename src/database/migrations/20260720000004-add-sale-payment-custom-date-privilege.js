'use strict';
const { SALE_PAYMENT } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: SALE_PAYMENT.NAME_CUSTOM_DATE, codeName: SALE_PAYMENT.CUSTOM_DATE, module: SALE_PAYMENT.MODULE_NAME, created_at: fecha, updated_at: fecha }
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
