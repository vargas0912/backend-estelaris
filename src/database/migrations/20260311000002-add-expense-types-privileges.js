'use strict';
const { EXPENSE_TYPE } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: EXPENSE_TYPE.NAME_ALL, codeName: EXPENSE_TYPE.VIEW_ALL, module: EXPENSE_TYPE.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EXPENSE_TYPE.NAME_ADD, codeName: EXPENSE_TYPE.ADD, module: EXPENSE_TYPE.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EXPENSE_TYPE.NAME_UPDATE, codeName: EXPENSE_TYPE.UPDATE, module: EXPENSE_TYPE.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EXPENSE_TYPE.NAME_DELETE, codeName: EXPENSE_TYPE.DELETE, module: EXPENSE_TYPE.MODULE_NAME, created_at: fecha, updated_at: fecha }
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

    const [adminUsers] = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role = \'admin\' AND deleted_at IS NULL'
    );
    if (!adminUsers.length) return;

    const userPrivileges = [];
    for (const privilegeId of privilegeIds) {
      for (const u of adminUsers) {
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
