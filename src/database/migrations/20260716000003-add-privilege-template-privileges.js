'use strict';
const { PRIVILEGE_TEMPLATE: PT } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: PT.NAME_VIEW, codeName: PT.VIEW, module: PT.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PT.NAME_ADD, codeName: PT.ADD, module: PT.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PT.NAME_UPDATE, codeName: PT.UPDATE, module: PT.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PT.NAME_DELETE, codeName: PT.DELETE, module: PT.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PT.NAME_APPLY, codeName: PT.APPLY, module: PT.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PT.NAME_SYNC, codeName: PT.SYNC, module: PT.MODULE_NAME, created_at: fecha, updated_at: fecha }
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
