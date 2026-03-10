'use strict';
const { COMPANY_INFO, SYSTEM_SETTINGS } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  // Información fiscal de la empresa
  { name: COMPANY_INFO.NAME_VIEW, codeName: COMPANY_INFO.VIEW, module: COMPANY_INFO.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: COMPANY_INFO.NAME_UPDATE, codeName: COMPANY_INFO.UPDATE, module: COMPANY_INFO.MODULE_NAME, created_at: fecha, updated_at: fecha },

  // Configuraciones del sistema
  { name: SYSTEM_SETTINGS.NAME_ALL, codeName: SYSTEM_SETTINGS.VIEW_ALL, module: SYSTEM_SETTINGS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: SYSTEM_SETTINGS.NAME_UPDATE, codeName: SYSTEM_SETTINGS.UPDATE, module: SYSTEM_SETTINGS.MODULE_NAME, created_at: fecha, updated_at: fecha }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('privileges', privileges);
  },

  async down(queryInterface) {
    const codeNames = privileges.map(p => p.codeName);
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM privileges WHERE codeName IN (${codeNames.map(() => '?').join(',')})`,
      { replacements: codeNames }
    );
    if (rows.length) {
      const ids = rows.map(r => r.id);
      await queryInterface.bulkDelete('userprivileges', { privilege_id: ids });
    }
    await queryInterface.bulkDelete('privileges', { codeName: codeNames });
  }
};
