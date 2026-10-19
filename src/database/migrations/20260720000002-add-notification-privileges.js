'use strict';
const { NOTIFICATION: N } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: N.NAME_CREATE, codeName: N.CREATE, module: N.MODULE_NAME, created_at: fecha, updated_at: fecha }
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
