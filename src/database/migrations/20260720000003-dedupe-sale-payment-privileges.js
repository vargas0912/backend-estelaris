'use strict';
const { SALE_PAYMENT } = require('../../constants/modules');

const codeNames = [SALE_PAYMENT.VIEW_ALL, SALE_PAYMENT.ADD, SALE_PAYMENT.DELETE];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = Sequelize;
    const rows = await queryInterface.sequelize.query(
      'SELECT id, codeName FROM privileges WHERE codeName IN (:codeNames) ORDER BY id',
      { replacements: { codeNames }, type: QueryTypes.SELECT }
    );

    const keeperByCode = {};
    const duplicates = [];
    rows.forEach(({ id, codeName }) => {
      if (keeperByCode[codeName] === undefined) keeperByCode[codeName] = id;
      else duplicates.push({ id, keeperId: keeperByCode[codeName] });
    });

    for (const { id, keeperId } of duplicates) {
      // Reasigna asignaciones que no existan ya sobre el privilegio conservado
      await queryInterface.sequelize.query(
        `UPDATE userprivileges up SET up.privilege_id = :keeperId
         WHERE up.privilege_id = :id
           AND NOT EXISTS (
             SELECT 1 FROM (SELECT user_id FROM userprivileges WHERE privilege_id = :keeperId) k
             WHERE k.user_id = up.user_id
           )`,
        { replacements: { id, keeperId } }
      );
      await queryInterface.sequelize.query(
        'DELETE FROM userprivileges WHERE privilege_id = :id',
        { replacements: { id } }
      );
      await queryInterface.sequelize.query(
        'DELETE FROM privileges WHERE id = :id',
        { replacements: { id } }
      );
    }
  },

  async down() {
    // Irreversible: los duplicados eliminados eran datos erróneos
  }
};
