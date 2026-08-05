'use strict';
const { PAYROLL, EMPLOYEE_LOAN, EMPLOYEE_VACATION } = require('../../constants/modules');

const fecha = new Date();
const privileges = [
  { name: PAYROLL.NAME_ALL, codeName: PAYROLL.VIEW_ALL, module: PAYROLL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PAYROLL.NAME_ADD, codeName: PAYROLL.ADD, module: PAYROLL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PAYROLL.NAME_APPROVE, codeName: PAYROLL.APPROVE, module: PAYROLL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: PAYROLL.NAME_DELETE, codeName: PAYROLL.DELETE, module: PAYROLL.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMPLOYEE_LOAN.NAME_ALL, codeName: EMPLOYEE_LOAN.VIEW_ALL, module: EMPLOYEE_LOAN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMPLOYEE_LOAN.NAME_ADD, codeName: EMPLOYEE_LOAN.ADD, module: EMPLOYEE_LOAN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMPLOYEE_LOAN.NAME_APPROVE, codeName: EMPLOYEE_LOAN.APPROVE, module: EMPLOYEE_LOAN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMPLOYEE_LOAN.NAME_DELETE, codeName: EMPLOYEE_LOAN.DELETE, module: EMPLOYEE_LOAN.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMPLOYEE_VACATION.NAME_ALL, codeName: EMPLOYEE_VACATION.VIEW_ALL, module: EMPLOYEE_VACATION.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMPLOYEE_VACATION.NAME_ADD, codeName: EMPLOYEE_VACATION.ADD, module: EMPLOYEE_VACATION.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMPLOYEE_VACATION.NAME_APPROVE, codeName: EMPLOYEE_VACATION.APPROVE, module: EMPLOYEE_VACATION.MODULE_NAME, created_at: fecha, updated_at: fecha },
  { name: EMPLOYEE_VACATION.NAME_DELETE, codeName: EMPLOYEE_VACATION.DELETE, module: EMPLOYEE_VACATION.MODULE_NAME, created_at: fecha, updated_at: fecha }
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
