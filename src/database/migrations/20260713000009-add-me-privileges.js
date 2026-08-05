'use strict';
const { ME } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: ME.NAME_VIEW_PROFILE, codeName: ME.VIEW_PROFILE, module: ME.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: ME.NAME_VIEW_PAYROLL, codeName: ME.VIEW_PAYROLL, module: ME.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: ME.NAME_VIEW_VACATIONS, codeName: ME.VIEW_VACATIONS, module: ME.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: ME.NAME_REQUEST_VACATION, codeName: ME.REQUEST_VACATION, module: ME.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: ME.NAME_VIEW_LOANS, codeName: ME.VIEW_LOANS, module: ME.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: ME.NAME_REQUEST_LOAN, codeName: ME.REQUEST_LOAN, module: ME.MODULE_NAME, created_at: fecha, updated_at: fecha }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('privileges', privileges);

    const codeNames = privileges.map(p => p.codeName);
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id FROM privileges WHERE codeName IN (${codeNames.map(() => '?').join(',')})`,
      { replacements: codeNames }
    );
    if (!rows.length) return;
    const privilegeIds = rows.map(r => r.id);

    const [userAccounts] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE role = 'user' AND deleted_at IS NULL"
    );
    if (!userAccounts.length) return;

    const userPrivileges = [];
    for (const privilegeId of privilegeIds) {
      for (const u of userAccounts) {
        userPrivileges.push({ user_id: u.id, privilege_id: privilegeId, created_at: fecha, updated_at: fecha });
      }
    }
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
