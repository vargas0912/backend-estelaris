'use strict';
const { data, parentCodeMap } = require('../json_files/accounting-accounts');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const level1 = data.filter(a => a.level === 1);
    const level2 = data.filter(a => a.level === 2);
    const level3 = data.filter(a => a.level === 3);

    await queryInterface.bulkInsert('accounting_accounts', level1);
    await queryInterface.bulkInsert('accounting_accounts', level2);
    await queryInterface.bulkInsert('accounting_accounts', level3);

    const allCodes = [...new Set([...Object.keys(parentCodeMap), ...Object.values(parentCodeMap)])];
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id, code FROM accounting_accounts WHERE code IN (${allCodes.map(() => '?').join(',')})`,
      { replacements: allCodes }
    );

    const codeToId = {};
    for (const row of rows) codeToId[row.code] = row.id;

    for (const [childCode, parentCode] of Object.entries(parentCodeMap)) {
      const childId = codeToId[childCode];
      const parentId = codeToId[parentCode];
      if (!childId || !parentId) continue;
      await queryInterface.sequelize.query(
        'UPDATE accounting_accounts SET parent_id = ? WHERE id = ?',
        { replacements: [parentId, childId] }
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('accounting_accounts', null, {});
  }
};
