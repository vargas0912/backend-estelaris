'use strict';
const { EMPlOYEE } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: EMPlOYEE.NAME_ASSIGN_ACCESS, codeName: EMPlOYEE.ASSIGN_ACCESS, module: EMPlOYEE.MODULE_NAME, created_at: fecha, updated_at: fecha }
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
