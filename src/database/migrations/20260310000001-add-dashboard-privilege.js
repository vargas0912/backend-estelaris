'use strict';
const { DASHBOARD } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: DASHBOARD.NAME_VIEW, codeName: DASHBOARD.VIEW, module: DASHBOARD.MODULE_NAME, created_at: fecha, updated_at: fecha }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('privileges', privileges);

    const [rows] = await queryInterface.sequelize.query(
      'SELECT id FROM privileges WHERE codeName = ? LIMIT 1',
      { replacements: [DASHBOARD.VIEW] }
    );
    if (!rows.length) return;
    const privilegeId = rows[0].id;

    const [adminUsers] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role = \'admin\' AND deleted_at IS NULL'
    );
    if (!adminUsers.length) return;

    const userPrivileges = adminUsers.map(u => ({
      user_id: u.id, privilege_id: privilegeId, created_at: fecha, updated_at: fecha
    }));
    await queryInterface.bulkInsert('userprivileges', userPrivileges, { ignoreDuplicates: true });
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
