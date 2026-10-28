'use strict';
const { TICKET_CONFIGS } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: TICKET_CONFIGS.NAME_VIEW, codeName: TICKET_CONFIGS.VIEW, module: TICKET_CONFIGS.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: TICKET_CONFIGS.NAME_UPDATE, codeName: TICKET_CONFIGS.UPDATE, module: TICKET_CONFIGS.MODULE_NAME, created_at: fecha, updated_at: fecha }
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
