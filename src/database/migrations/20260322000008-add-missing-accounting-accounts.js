'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Insertar cuenta 115 - Inventario de Mercancías (si no existe)
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO accounting_accounts (code, name, type, nature, level, parent_id, allows_movements, is_system, active, created_at, updated_at)
      SELECT '115', 'Inventario de Mercancías', 'activo', 'deudora', 3,
             (SELECT id FROM accounting_accounts WHERE code = '110' LIMIT 1),
             1, 1, 1, NOW(), NOW()
      FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM accounting_accounts WHERE code = '115')
    `);

    // Insertar cuenta 614 - Gastos Generales (si no existe)
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO accounting_accounts (code, name, type, nature, level, parent_id, allows_movements, is_system, active, created_at, updated_at)
      SELECT '614', 'Gastos Generales', 'egreso', 'deudora', 3,
             (SELECT id FROM accounting_accounts WHERE code = '610' LIMIT 1),
             1, 1, 1, NOW(), NOW()
      FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM accounting_accounts WHERE code = '614')
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE FROM accounting_accounts WHERE code IN ('115', '614') AND is_system = 1"
    );
  }
};
