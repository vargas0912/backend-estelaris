'use strict';
const { data, parentCodeMap } = require('./json_files/accounting-accounts');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Insert in order: level 1 first, then 2, then 3 (respects self-referential FK)
    const level1 = data.filter(a => a.level === 1);
    const level2 = data.filter(a => a.level === 2);
    const level3 = data.filter(a => a.level === 3);

    await queryInterface.bulkInsert('accounting_accounts', level1, { ignoreDuplicates: true });
    await queryInterface.bulkInsert('accounting_accounts', level2, { ignoreDuplicates: true });
    await queryInterface.bulkInsert('accounting_accounts', level3, { ignoreDuplicates: true });

    // Resolve parent_id by code
    const allCodes = Object.keys(parentCodeMap).concat(Object.values(parentCodeMap));
    const uniqueCodes = [...new Set(allCodes)];

    const [rows] = await queryInterface.sequelize.query(
      `SELECT id, code FROM accounting_accounts WHERE code IN (${uniqueCodes.map(() => '?').join(',')})`,
      { replacements: uniqueCodes }
    );

    const codeToId = {};
    for (const row of rows) {
      codeToId[row.code] = row.id;
    }

    // Update parent_id for each account that has a parent
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
