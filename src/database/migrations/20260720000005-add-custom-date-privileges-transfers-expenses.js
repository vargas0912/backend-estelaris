'use strict';
const { TRANSFER, EXPENSE } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: TRANSFER.NAME_CUSTOM_DATE, codeName: TRANSFER.CUSTOM_DATE, module: TRANSFER.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EXPENSE.NAME_CUSTOM_DATE, codeName: EXPENSE.CUSTOM_DATE, module: EXPENSE.MODULE_NAME, created_at: fecha, updated_at: fecha }
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
